import json
from tokenize import group
from channels.generic.websocket import AsyncWebsocketConsumer
import random
from django.shortcuts import redirect
import time
from threading import Thread
import asyncio

from .chess_package.chess_engine import Engine


class Counter():
    def __init__(self):
        self.rooms = {}

    def append_if_absent(self, group_name):
        present = False
        for room_name in self.rooms:
            if group_name == room_name:
                present = True
        if present == False:
            self.rooms[group_name] = 0

    def increment_and_check_room_size(self, group_name):
        if self.rooms[group_name] + 1 > 2:
            return False
        
        if self.rooms[group_name] + 1 <= 2:
            self.rooms[group_name] += 1
            return True

    def decrement_and_check_room_deletion(self, group_name):
        if self.rooms[group_name] - 1 > 0:
            self.rooms[group_name] -= 1

        elif self.rooms[group_name] - 1 == 0:
            self.rooms.pop(group_name)

counter = Counter()

class RequestCounter():
    def __init__(self):
        self.people = []

    def append_name(self, name):
        if name not in self.people:
            self.people.append(name)

    def remove_name(self, name):
        if name in self.people:
            self.people.remove(name)

    def find_opponent(self, own_name):
        if self.people[0] != own_name:
            return self.people[0]
        else:
            return self.people[1]

requestcounter = RequestCounter()


class GameCounter():
    def __init__(self):
        self.games = 0

gamecounter = GameCounter()
    

class AliasTracker():
    def __init__(self):
        self.aliases = {}

    def append_values(self, alias, room):
        # rooms are unique, so make that the key
        present = False
        for r in self.aliases:
            if r == room:
                present = True
        
        # creating the key value
        if present == False:
            self.aliases[room] = [alias]

        if present == True:
            self.aliases[room].append(alias)

aliastracker = AliasTracker()


class MoveTracker():
    def __init__(self):
        self.current_moves = {}
        self.previous_piece_moved = {}
        self.results = {}
        self.end_game = {}

    def update_results(self, group_name, result):
        self.results[group_name] = result

    def update_end_game(self, group_name, end_game):
        self.end_game[group_name] = end_game

    def update_previous_move(self, group_name, previous_move):
        if group_name not in self.previous_piece_moved:
            self.previous_piece_moved[group_name] = previous_move

        else:
            self.previous_piece_moved[group_name] = previous_move

    def append_if_absent(self, channel_name):
        present = False
        for user in self.current_moves:
            if user == channel_name:
                present = True
        
        if present == False:
            self.current_moves[channel_name] = []

    def update_move(self, channel_name, move):
        self.current_moves[channel_name] = move

    def delete(self, channel_name):
        self.current_moves.pop(channel_name)

    def delete_results(self, group_name):
        self.results.pop(group_name)

    def delete_end_game(self, group_name):
        self.end_game.pop(group_name)

movetracker = MoveTracker()


class Delay():
    def __init__(self):
        self.delays = {}

    def delay(self, channel_name):

        self.delays[channel_name] = 0
        time.sleep(2)

        if self.delays[channel_name] == 0:
            return False
        else:
            self.delays.pop(channel_name)
            return True

    def bypass(self, channel_name):
        self.delays[channel_name] = 1

delay = Delay()




class ChessRoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        print("\nWE ARE CONNECTING!!\n")

        self.group_name = 'dummy'
        counter.append_if_absent(self.group_name)
        counter.increment_and_check_room_size(self.group_name)

        self.chess_room_name = self.scope['url_route']['kwargs']['chess_room_name']
        group_name = 'game_%s' % self.chess_room_name


        counter.append_if_absent(group_name)
        allowed = counter.increment_and_check_room_size(group_name)
        



        if allowed == True:
            self.group_name = group_name
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()

            # somehow know that we want to play the computer

            if self.group_name in movetracker.current_moves:
                await self.channel_layer.group_send(
                        self.group_name,
                        {
                            'type': 'get_opponent_color', 
                            'sender': self.channel_name,
                        }
                    )
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'get_refresh_alias',
                        'sender': self.channel_name
                    }
                )
                await self.send(text_data=json.dumps({
                    'type': 'refresh_sequence',
                    'message': movetracker.current_moves[self.group_name],
                    'previous_move': movetracker.previous_piece_moved[self.group_name],
                    'result': movetracker.results[self.group_name],
                    'end_game': movetracker.end_game[self.group_name]
                }))
                print("BYPASS")
                delay.bypass(self.group_name)


            elif counter.rooms[self.group_name] == 2:
                if self.group_name not in movetracker.current_moves:
                    x = random.randint(0, 1)
                    if x == 0:
                        message = 'white'

                    if x == 1:
                        message = 'black'
                    
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            'type': 'start_game', 
                            'sender': self.channel_name,
                            'message': message,
                        }
                    ) 

        if allowed == False:
            return
            
            

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message'] # assuming the message is keyed to 'message'
        type = text_data_json['type']
        

        if type == 'move':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'play_move',
                    'sender': self.channel_name,
                    'message': message
                }
            )

        if type == 'alias':
            self.alias = message
            print(self.alias)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_alias',
                    'sender': self.channel_name,
                    'alias': message
                }
            )

        if type == 'aborted':
            movetracker.update_end_game(self.group_name, end_game=True)
            movetracker.update_results(self.group_name, result='game aborted')
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'abort_game'
                }
            )

        if type == 'rematch':
            print('REMATCH IN RECEIVE')

            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'rematch_request',
                    'sender': self.channel_name
                }
            )

        if type == 'rematch_accepted':
            print("REMATCH ACCEPTED IN RECEIVE")
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'rematch_accepted',
                    'sender': self.channel_name,
                    'color': message
                }
            )

        if type == 'update_sequence':
            movetracker.append_if_absent(self.group_name)
            movetracker.update_move(self.group_name, message)
            movetracker.update_previous_move(self.group_name, previous_move=text_data_json['previous_piece_moved'])
            movetracker.update_end_game(self.group_name, end_game=text_data_json['end_game'])
            movetracker.update_results(self.group_name, result=text_data_json['result'])

        if type == 'update_own_alias':
            self.alias = message

        if type == 'close':
            await self.close()

    async def rejected_play(self, text_data):
        await self.send(text_data=json.dumps({
            'type': 'rejected_play',
            'message': 'game rejected',
        }))

    async def get_refresh_alias(self, text_data):
        sender = text_data['sender']
        if sender != self.channel_name:
            print("\ngetting alias from opponent:")
            print(self.alias)
            print('\n')
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_refresh_alias', 
                    'sender': self.channel_name,
                    'alias': self.alias
                }
            )

    async def send_refresh_alias(self, text_data):
        sender = text_data['sender']
        opp_alias = text_data['alias']
        if sender != self.channel_name:
            print("\nSENDING ALIAS BACK TO MYSELF\n")
            print(opp_alias)

            await self.send(text_data=json.dumps({
                'type': 'refresh_alias',
                'opp_alias': opp_alias
            }))
        


    async def get_opponent_color(self, text_data):
        sender = text_data['sender']

        if sender != self.channel_name:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_opponent_color', 
                    'sender': self.channel_name,
                    'color': self.color
                }
            ) 

    async def send_opponent_color(self, text_data):
        sender = text_data['sender']
        color = text_data['color']

        turn = 'black'

        if len(movetracker.current_moves[self.group_name]) % 2:
            turn = 'white'

        if color == 'white':
            color = 'black'
        elif color == 'black':
            color = 'white'

        if sender != self.channel_name:
            self.color = color
            await self.send(text_data=json.dumps({
                'type': 'define_color',
                'color': color,
                'turn': turn
            }))

    async def rematch_accepted(self, text_data):
        print("REMATCH ACCEPTED")
        sender = text_data['sender']
        color = text_data['color']

        if sender == self.channel_name:
            if color == 'white':
                new_color = 'black'
            if color == 'black':
                new_color = 'white'
            self.color = new_color
            

        if sender != self.channel_name:
            new_color = color
            self.color = new_color

        movetracker.current_moves[self.group_name] = []
        movetracker.previous_piece_moved[self.group_name] = None
        movetracker.results[self.group_name] = None
        movetracker.end_game[self.group_name] = None

        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'message': new_color
        }))


    async def rematch_request(self, text_data):
        sender = text_data['sender']
        if sender != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'rematch_request'
            }))

    async def send_alias(self, text_data):
        alias = text_data['alias']
        sender = text_data['sender']

        if sender != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'alias',
                'message': alias
            }))

    async def start_game(self, text_data):
        message = text_data['message']
        please = text_data['sender']

        if please != self.channel_name:
            if message == 'white':
                message = 'black'
            elif message == 'black':
                message = 'white'

        self.color = message


        await self.send(text_data=json.dumps({
                'type': 'start_game',
                'message': message,
                'opponent_type': 'human'
            }))

    async def play_move(self, text_data):
        message = text_data['message']
        sender = text_data['sender']

        if sender != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'play_move',
                'message': message
            }))

    async def abort_game(self, text_data):
        #stay = await delay.delay(self.group_name)
        #print(f"STAY: {stay}")
        
        await self.send(text_data=json.dumps({
                'type': 'game_aborted',
                'message': 'game_aborted'
            }))

    async def group_send_abort_game(self, text_data):
        await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'abort_game',
                }
            )

    async def controlled_disconnect(self, text_data):
        print("CONTROLLED DISCONNECTING")

        await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'abort_game',
                }
            )
        
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )


    async def and_now_disconnect(self):
        print('\nand_now_disconnect\n')
        stay = delay.delay(self.group_name)

        print(f"STAY: {stay}")
        if stay == False:
            print('well, turns out it was false.')
            await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'abort_game',
                    }
                )
            
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    def between_callback(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.and_now_disconnect())
        loop.close()

    async def disconnect(self, close_code):
        print("\nDISCONNECTING")
        print(f"counter: {counter.rooms[self.group_name]}")

        if counter.rooms[self.group_name] == 1:
            if self.group_name in movetracker.current_moves:
                movetracker.delete(self.group_name)
            if self.group_name in movetracker.end_game:
                movetracker.delete_end_game(self.group_name)
            if self.group_name in movetracker.results:
                movetracker.delete_results(self.group_name)
        counter.decrement_and_check_room_deletion(self.group_name)

        new_thread = Thread(target=self.between_callback)
        new_thread.start()        






class ComputerRoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        print("\nCONNECTING TO COMPUTER WEBSOCKET\n")

        self.chess_room_name = self.scope['url_route']['kwargs']['chess_room_name']
        self.group_name = 'game_%s' % self.chess_room_name

        if self.group_name not in counter.rooms:
            counter.append_if_absent(self.group_name)
            await self.accept()

            x = random.randint(0, 1)
            if x == 0:
                color = 'white'

            if x == 1:
                color = 'black'

            await self.send(text_data=json.dumps({
                'type': 'start_game',
                'message': color,
                'opponent_type': 'computer'
            }))


    async def receive(self, text_data):

        text_data_json = json.loads(text_data)
        message = text_data_json['message'] # assuming the message is keyed to 'message'
        type = text_data_json['type']
        

        if type == 'move':
            player = text_data_json['player']
            pieces = text_data_json['pieces']
            print(pieces)

            engine = Engine(player)
            engine.new_position(pieces)
            move = engine.generate_move('computer')
            engine.show_legal_moves()


            await self.send(text_data=json.dumps({
                'type': 'play_move',
                'message': move
            }))

        if type == 'alias':
            await self.send(text_data=json.dumps({
                'type': 'alias',
                'message': 'computer'
            }))

            human_color = text_data_json['own_color']
            if human_color == 'black':
                await self.send(text_data=json.dumps({
                'type': 'move_demanded',
            }))



    async def disconnect(self, text_data):
        counter.rooms.pop(self.group_name)








class NotificationConsumer(AsyncWebsocketConsumer):

    # connect to a channel layer which is unique for every person. group name is equal to channel name
    async def connect(self):

        await self.accept()

        await self.send(text_data=json.dumps({
                'type': 'first_connection',
            }))


        


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        self_profile_pk = text_data_json['message']
        type = text_data_json['type']

        if type == 'connecting_room':
            self.group_name = 'notificationroom'
            self.identifier = 'notification_room_%s' % self_profile_pk

            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

        



    async def send_notification(self, text_data):
        count = text_data['count']
        notification = text_data['notification']
        send_to = text_data['send_to']

        if self.identifier == send_to:
            await self.send(text_data=json.dumps({
                    'type': 'notification_sent',
                    'count': count,
                    'notification': notification
                }))









class LobbyConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.group_name = 'lobby'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        alias = text_data_json['alias']
        opposition = text_data_json['opposition']

        if message == 'request_to_play': # we need to keep track of who has sent play requests
            requestcounter.append_name(self.channel_name)

            if opposition == 'computer':
                gamecounter.games += 1
                aliastracker.append_values(alias, gamecounter.games)
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'reroute',
                        'own_name': self.channel_name,
                        'opponent_name': opposition,
                        'message': 'computer_' + str(gamecounter.games),
                        'player': opposition
                    }
                )

            if len(requestcounter.people) >= 2 and opposition == 'human':
                opponent = requestcounter.find_opponent(self.channel_name)
                gamecounter.games += 1

                # save alias and game number
                aliastracker.append_values(alias, gamecounter.games)

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'reroute',
                        'own_name': self.channel_name,
                        'opponent_name': opponent,
                        'message': gamecounter.games,
                        'player': opposition
                    }
                )




    async def reroute(self, text_data):
        
        own_name = text_data['own_name']
        opponent_name = text_data['opponent_name']
        message = text_data['message']

        if self.channel_name == own_name or self.channel_name == opponent_name:
            await self.send(text_data=json.dumps({
                    'type': 'rerouting',
                    'message': message,
                }))

            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        requestcounter.remove_name(self.channel_name)

