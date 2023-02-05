from django.shortcuts import render, redirect
from django.views import View
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.mixins import LoginRequiredMixin


from .models import UserProfile, AcceptedChallenge, Notifications
from .consumers import NotificationConsumer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json




class IDGenerator():
    def __init__(self):
        self.number = 0
    def generate(self):
        self.number += 1
        return self.number

idgenerator = IDGenerator()



# Create your views here.


class Home(View): #lobby
    def get(self, request, *args, **kwargs):
        context = {
            'profile': False
        }
        if str(request.user) != 'AnonymousUser':
            count = Notifications.objects.filter(user=request.user, is_seen=False).count()

            context = {
                'profile': True,
                'count': count
            }
        
        return render(request, 'main/home.html', context)

class ChessRoom(View):
    def get(self, request, chess_room_name, *args, **kwargs):
        logged_in = request.user.is_authenticated

        if logged_in == True:
            alias = request.user.profile.name
            count = Notifications.objects.filter(user=request.user, is_seen=False).count()
            profile = True
        
        if logged_in == False:
            if 'anonymous_name' not in request.session:
                request.session['anonymous_name'] = str(idgenerator.generate())
            alias = 'Anonymous_' + request.session['anonymous_name']
            count = 0
            profile = False

        
        context = {
            'profile': profile,
            'chess_room_name': chess_room_name,
            'alias': alias,
            'count': count
        }
        return render(request, 'main/chess_room.html', context)


class ProfileSearch(View):
    def get(self, request, *args, **kwargs):
        query = self.request.GET.get('query')
        profile_list = None
        if query != None:
            profile_list = UserProfile.objects.filter(
                Q(name__icontains=query)
            )

        count = 0
        profile = False
        if str(request.user) != 'AnonymousUser':
            count = Notifications.objects.filter(user=request.user, is_seen=False).count()
            profile = True

        context = {
            'profile_list': profile_list,
            'count': count,
            'profile': profile
        }

        return render(request, 'main/profile_search.html', context)

class Profile(View):
    def get(self, request, pk, *args, **kwargs):

        profile = UserProfile.objects.get(pk=pk)
        friend_list = profile.following.all
        challengers_list = profile.challengers.all
        count = 0
        is_following = 'dummy'
        is_challenging = 'dummy'
        logged_in = False

        if str(request.user) != 'AnonymousUser':
            logged_in = True
            count = Notifications.objects.filter(user=request.user, is_seen=False).count()
            if profile.followers.all().filter(id=request.user.id).exists() == False:
                is_following = False
            else:
                is_following = True

            if profile.challengers.all().filter(id=request.user.id).exists() == False:
                is_challenging = False
            else:
                is_challenging = True

            if pk == request.user.profile.pk:
                Notifications.objects.filter(user=request.user).update(is_seen=True)

        

        context = {
            'logged_in': logged_in,
            'count': count,
            'profile': profile,
            'friend_list': friend_list,
            'challengers_list': challengers_list,
            'is_following': is_following,
            'is_challenging': is_challenging,
        }
        return render(request, 'main/profile.html', context)

class Follow(LoginRequiredMixin, View):
    def post(self, request, pk, *args, **kwargs):
        followed_profile = UserProfile.objects.get(pk=pk)
        if followed_profile.user != request.user:

            if followed_profile.followers.all().filter(id=request.user.id).exists() == False:

                followed_profile.followers.add(request.user)
                follower_profile = request.user.profile
                follower_profile.following.add(followed_profile.user)

            else:
                followed_profile.followers.remove(request.user)
                follower_profile = request.user.profile
                follower_profile.following.remove(followed_profile.user)

            next = request.POST.get('next', '/')
            query = request.POST.get('query')
            if query:
                connector = "?query="
                url = next + connector + query
            else:
                url = next
            return HttpResponseRedirect(url, pk)

class SendChallenge(LoginRequiredMixin, View):
    def post(self, request, pk, *args, **kwargs):
        challenged = UserProfile.objects.get(pk=pk)
        challenger = request.user.profile

        if request.user != challenged.user:
            if challenged.challengers.all().filter(id=request.user.id).exists() == False:
                challenged.challengers.add(request.user)
                challenger = request.user.profile
                challenger.challenging.add(challenged.user)

                acceptchallenge = AcceptedChallenge.objects.create(challenger=challenger, challenged=challenged)
                acceptchallenge.accepted = False

                Notifications.objects.create(user=challenged.user, notification='You have been challenged to a match!')
                count = Notifications.objects.filter(user=challenged.user, is_seen=False).count()

                channel_layer = get_channel_layer()
                challenged_profile_pk = pk
                send_to = 'notification_room_%s' % challenged_profile_pk

                # we need the fucking channel name...
                async_to_sync(channel_layer.group_send)(
                    'notificationroom',
                    {
                        'type': 'send_notification',
                        'count': count,
                        'notification': 'You have been challenged to a match!',
                        'send_to': send_to

                    }
                )

            else:
                challenged.challengers.remove(request.user)
                challenger = request.user.profile
                challenger.challenging.remove(challenged.user)

                AcceptedChallenge.objects.get(challenger=challenger, challenged=challenged).delete()
                Notifications.objects.get(user=challenged.user, notification='You have been challenged to a match!').delete()


        chess_room_name = 'challenge_' + str(challenger.pk) + str(challenged.pk)
        return redirect('/game/%s' %chess_room_name)

        """next = request.POST.get('next', '/')
        query = request.POST.get('query')
        if query:
            connector = "?query="
            url = next + connector + query
        else:
            url = next
        return HttpResponseRedirect(url, pk)"""

class AcceptChallenge(LoginRequiredMixin, View):
    def post(self, request, pk, accepted, *args, **kwargs):
        challenger = UserProfile.objects.get(pk=pk)
        challenged = UserProfile.objects.get(pk=request.user.profile.pk)

        if accepted == 'accept':
            AcceptedChallenge.objects.get(challenger=challenger, challenged=challenged).delete()
            Notifications.objects.get(user=challenged.user, notification='You have been challenged to a match!').delete()
            challenged.challengers.remove(challenger.user)
            challenger.challenging.remove(challenged.user)
            chess_room_name = 'challenge_' + str(challenger.pk) + str(challenged.pk)
            return redirect('/game/%s' % chess_room_name)
        
        if accepted == 'reject':
            AcceptedChallenge.objects.get(challenger=challenger, challenged=challenged).delete()
            Notifications.objects.get(user=challenged.user, notification='You have been challenged to a match!').delete()
            challenged.challengers.remove(challenger.user)
            challenger.challenging.remove(challenged.user)

            channel_layer = get_channel_layer()
            chess_room_name = 'challenge_' + str(challenger.pk) + str(challenged.pk)
            group_name = 'game_%s' % chess_room_name

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'rejected_play'
                }
            )

            return redirect('/profile/%s' % request.user.profile.pk)

