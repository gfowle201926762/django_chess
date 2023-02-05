from webbrowser import get
from django.db import models
from django.contrib.auth.models import User
from django.db.models.fields.related import ForeignKey, OneToOneField
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from .consumers import NotificationConsumer

# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True, null=True)
    followers = models.ManyToManyField(User, blank=True, related_name='followers')
    following = models.ManyToManyField(User, blank=True, related_name='following')
    challengers = models.ManyToManyField(User, blank=True, related_name='challengers')
    challenging = models.ManyToManyField(User, blank=True, related_name='challenging')

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance, name=instance.username)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class AcceptedChallenge(models.Model):
    challenger = models.ForeignKey(UserProfile, related_name='challenger', on_delete=models.CASCADE)
    challenged = models.ForeignKey(UserProfile, related_name='challenged', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

class Notifications(models.Model):
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    is_seen = models.BooleanField(default=False)
    notification = models.TextField(max_length=50)
    time = models.DateTimeField(default=timezone.now)



# only for guests?
class GuestPlayer(models.Model):
    alias = models.CharField(max_length=20, blank=True, null=True)