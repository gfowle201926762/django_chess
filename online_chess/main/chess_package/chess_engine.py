import numpy
import random
import copy

from .chess_piece_package.chess_piece import board, white_king, black_king, white_pieces, black_pieces, all_pieces

class Engine():
    def __init__(self, player):
        self.player = player
        self.new_dict = {}
        self.original_position = {}
        self.max_depth = 4
        self.max_breadth = 2
        self.saved_depth_1 = {}
        self.saved_depth_2 = {}
        self.saved_depth_3 = {}
        self.saved_depth_4 = {}
        self.saved_depth_5 = {}
        self.saved_depth_6 = {}
        self.saved_depth_7 = {}
        self.saved_depth_8 = {}
        self.saved_depth_9 = {}
        self.saved_depth_10 = {}
        self.saved_depth_11 = {}
        self.saved_depth_12 = {}
        self.original_previous_piece_moved = None
        self.moves = []

        if player == 'white':
            self.opponent = 'black'
            self.king = white_king
            self.opp_king = black_king
            self.check_value = 101
            self.opp_check_value = 117
            self.castle_value = 201
            self.opp_castle_value = 217
            self.own_pieces = white_pieces
            self.opp_pieces = black_pieces

        if player == 'black':
            self.opponent = 'white'
            self.king = black_king
            self.opp_king = white_king
            self.check_value = 117
            self.opp_check_value = 101
            self.castle_value = 217
            self.opp_castle_value = 201
            self.own_pieces = black_pieces
            self.opp_pieces = white_pieces

    def show_legal_moves(self):
        #print("\nLEGAL MOVES:")
        for i in range(0, int(len(self.moves) / 4)):
            print(self.moves[(i * 4)], self.moves[(i * 4) + 1], self.moves[(i * 4) + 2], self.moves[(i * 4) + 3])
        #print("\n")

    def clear_array(self):
        board.array = numpy.zeros((8, 8))
        for piece in all_pieces:
            if piece.alive == True:
                piece.update_array()

    def new_position(self, new_dict):

        self.new_dict = new_dict

        for piece in all_pieces:
            if piece.identifier == new_dict['previous_piece_moved']:
                self.original_previous_piece_moved = piece

        alive_pieces = new_dict['alive_pieces']
        dead_pieces = new_dict['dead_pieces']

        new_alive_pieces = []
        new_dead_pieces = []

        for i in range(0, int(len(alive_pieces) / 6)):
            for piece in all_pieces:
                if piece.identifier == alive_pieces[(i * 6) + 5]:
                    piece.alive = True
                    piece.x = alive_pieces[(i * 6) + 0]
                    piece.y = alive_pieces[(i * 6) + 1]
                    piece.first_turn = alive_pieces[(i * 6) + 2]
                    piece.type = alive_pieces[(i * 6) + 3]
                    piece.ranking = alive_pieces[(i * 6) + 4]

                    new_alive_pieces.append(piece)
                    new_alive_pieces.append(piece.x)
                    new_alive_pieces.append(piece.y)
                    new_alive_pieces.append(piece.first_turn)
                    new_alive_pieces.append(piece.type)
                    new_alive_pieces.append(piece.ranking)


        for i in range(0, len(dead_pieces)):
            for piece in all_pieces:
                if piece.identifier == dead_pieces[i]:
                    piece.alive = False

                    new_dead_pieces.append(piece)

        self.original_position['alive_pieces'] = new_alive_pieces
        self.original_position['dead_pieces'] = new_dead_pieces

        self.clear_array()

        #print("\n\n***************\nNEW MOVE\n******************\n")
        #print(f"\n{board.array}\n")

    def check_for_check(self, player, previous_piece_moved):

        if player == self.player:
            pieces = self.opp_pieces
            king = self.king
            check_value = self.check_value

        if player != self.player:
            pieces = self.own_pieces
            king = self.opp_king
            check_value = self.opp_check_value


        in_check = False
        for piece in pieces:
            if piece.alive == True:
                self.clear_array()
                piece.move(previous_piece_moved)
                if board.array[king.y][king.x] == check_value:
                    in_check = True

        return in_check

    def get_legal_moves(self, player, previous_piece_moved):
        if player == self.player:
            own_pieces = self.own_pieces
            opp_pieces = self.opp_pieces
            castle_value = self.castle_value
            king = self.king

        if player != self.player:
            own_pieces = self.opp_pieces
            opp_pieces = self.own_pieces
            castle_value = self.opp_castle_value
            king = self.opp_king

        legal_moves = []

        for own_piece in own_pieces:
            if own_piece.alive == True:

                saved_x = own_piece.x
                saved_y = own_piece.y

                self.clear_array()
                own_piece.move(previous_piece_moved)

                for row in range(0, 8):
                    for col in range(0, 8):

                        taken_piece = None

                        if board.array[row][col] == -1 or (board.array[row][col] > 100 and board.array[row][col] < 200): # OPTIONAL or TAKING:
                            own_piece.y = row
                            own_piece.x = col

                            if board.array[row][col] > 100:
                                for opp_piece in opp_pieces:
                                    if opp_piece.alive == True and opp_piece.identifier == board.array[row][col] - 100:
                                        opp_piece.alive = False
                                        taken_piece = opp_piece

                            in_check = self.check_for_check(player, previous_piece_moved)

                            own_piece.x = saved_x
                            own_piece.y = saved_y

                            if taken_piece != None:
                                taken_piece.alive = True

                            if in_check == False:
                                legal_moves.append(own_piece)
                                legal_moves.append(row)
                                legal_moves.append(col)
                                if taken_piece != None:
                                    legal_moves.append(taken_piece)
                                else:
                                    legal_moves.append(None)

                            self.clear_array()
                            own_piece.move(previous_piece_moved)

                        elif board.array[row][col] == castle_value: #CASTLE OPPORTUNITY:

                            # own_piece = the castle
                            if king.first_turn == True:

                                in_check = self.check_for_check(player, previous_piece_moved)
                                if in_check == False:

                                    increment = 1
                                    castle_col = 5
                                    if own_piece.x == 0:
                                        increment = -1
                                        castle_col = 3

                                    king.x = 4 + (1 * increment)
                                    in_check = self.check_for_check(player, previous_piece_moved)
                                    if in_check == False:
                                        king.x = 4 + (2 * increment)
                                        in_check = self.check_for_check(player, previous_piece_moved)
                                        if in_check == False:
                                            # Now it is legal.
                                            legal_moves.append(own_piece)
                                            legal_moves.append(row)
                                            legal_moves.append(castle_col)
                                            legal_moves.append(king)

                                    king.x = 4

                            self.clear_array()
                            own_piece.move(previous_piece_moved)
        self.clear_array()
        return legal_moves

    def generate_random_legal_move(self, moves):
        no_moves = len(moves) / 4
        x = random.randint(0, no_moves - 1)

        move = [moves[(x * 4)], moves[(x * 4) + 1], moves[(x * 4) + 2], moves[(x * 4) + 3]]

        # NOT CASTLING: 1. piece being moved, 2. target row, 3. target col, 4. taken piece
        # CASTLING: 1. castle, target row for castle, target col for castle, king

        return move

    def generate_ordered_move(self, moves, number):
        if number >= len(moves) / 4:
            return False
        move = [moves[(number * 4)], moves[(number * 4) + 1], moves[(number * 4) + 2], moves[(number * 4) + 3]]
        return move

    def translate_move(self, move):

        # we don't actually need to simulate it though do we.
        self.clear_array()
        original_x = move[0].x
        original_y = move[0].y
        taken_identifier = None

        #if board.array[move[1]][move[2]] != 0: #taking a piece:
        #print(f"MOVE[3]: {move[3]}")
        if move[3] != None:
            for opp_piece in all_pieces:
                if opp_piece.alive == True and opp_piece.identifier == move[3].identifier: #board.array[move[1]][move[2]]:
                    opp_piece.alive = False
                    taken_identifier = opp_piece.identifier
                    #print(f"taken_identifier = {opp_piece.identifier}")

        move[0].y = move[1]
        move[0].x = move[2]
        move[0].first_turn = False
        if move[0].type == 'pawn':
            move[0].check_queening()

        translated_move = [move[0].identifier, move[0].y, move[0].x, taken_identifier, original_x, original_y]

        return translated_move


    def simulate_move(self, move):

        if move[3] != None:
            if move[3].identifier == 1 or move[3].identifier == 17:
                #print("CASTLING!")
                move[3].first_turn = False
                if move[0].x == 0:
                    move[3].x = 2
                if move[0].x == 7:
                    move[3].x = 6

            else:
                move[3].alive = False

        move[0].y = move[1]
        move[0].x = move[2]
        move[0].first_turn = False
        move[0].check_queening()
        self.clear_array()

    def save_depth(self, depth):

        alive_pieces = []
        dead_pieces = []
        for piece in all_pieces:
            if piece.alive == True:
                alive_pieces.append(piece)
                alive_pieces.append(piece.x)
                alive_pieces.append(piece.y)
                alive_pieces.append(piece.first_turn)
                alive_pieces.append(piece.type)
                alive_pieces.append(piece.ranking)
            if piece.alive == False:
                dead_pieces.append(piece)

        if depth == 1:
            self.saved_depth_1['alive_pieces'] = alive_pieces
            self.saved_depth_1['dead_pieces'] = dead_pieces

        if depth == 2:
            self.saved_depth_2['alive_pieces'] = alive_pieces
            self.saved_depth_2['dead_pieces'] = dead_pieces

        if depth == 3:
            self.saved_depth_3['alive_pieces'] = alive_pieces
            self.saved_depth_3['dead_pieces'] = dead_pieces

        if depth == 4:
            self.saved_depth_4['alive_pieces'] = alive_pieces
            self.saved_depth_4['dead_pieces'] = dead_pieces

        if depth == 5:
            self.saved_depth_5['alive_pieces'] = alive_pieces
            self.saved_depth_5['dead_pieces'] = dead_pieces

        if depth == 6:
            self.saved_depth_6['alive_pieces'] = alive_pieces
            self.saved_depth_6['dead_pieces'] = dead_pieces

        if depth == 7:
            self.saved_depth_7['alive_pieces'] = alive_pieces
            self.saved_depth_7['dead_pieces'] = dead_pieces

        if depth == 8:
            self.saved_depth_8['alive_pieces'] = alive_pieces
            self.saved_depth_8['dead_pieces'] = dead_pieces

        if depth == 9:
            self.saved_depth_9['alive_pieces'] = alive_pieces
            self.saved_depth_9['dead_pieces'] = dead_pieces

        if depth == 10:
            self.saved_depth_10['alive_pieces'] = alive_pieces
            self.saved_depth_10['dead_pieces'] = dead_pieces

        if depth == 11:
            self.saved_depth_11['alive_pieces'] = alive_pieces
            self.saved_depth_11['dead_pieces'] = dead_pieces

        if depth == 12:
            self.saved_depth_12['alive_pieces'] = alive_pieces
            self.saved_depth_12['dead_pieces'] = dead_pieces


    def change_depth(self, depth):
        if depth == 0:
            saved_depth = self.original_position
        if depth == 1:
            saved_depth = self.saved_depth_1
        if depth == 2:
            saved_depth = self.saved_depth_2
        if depth == 3:
            saved_depth = self.saved_depth_3
        if depth == 4:
            saved_depth = self.saved_depth_4
        if depth == 5:
            saved_depth = self.saved_depth_5
        if depth == 6:
            saved_depth = self.saved_depth_6
        if depth == 7:
            saved_depth = self.saved_depth_7
        if depth == 8:
            saved_depth = self.saved_depth_8
        if depth == 9:
            saved_depth = self.saved_depth_9
        if depth == 10:
            saved_depth = self.saved_depth_10
        if depth == 11:
            saved_depth = self.saved_depth_11
        if depth == 12:
            saved_depth = self.saved_depth_12

        for i in range(0, int(len(saved_depth['alive_pieces']) / 6)):
            saved_depth['alive_pieces'][(i * 6)].alive = True
            saved_depth['alive_pieces'][(i * 6)].x = saved_depth['alive_pieces'][(i * 6) + 1]
            saved_depth['alive_pieces'][(i * 6)].y = saved_depth['alive_pieces'][(i * 6) + 2]
            saved_depth['alive_pieces'][(i * 6)].first_turn = saved_depth['alive_pieces'][(i * 6) + 3]
            saved_depth['alive_pieces'][(i * 6)].type = saved_depth['alive_pieces'][(i * 6) + 4]
            saved_depth['alive_pieces'][(i * 6)].ranking = saved_depth['alive_pieces'][(i * 6) + 5]

        for i in range(0, int(len(saved_depth['dead_pieces']))): # WHY DOES THIS SHOW AS AN INT??????????
            saved_depth['dead_pieces'][(i)].alive = False

    def get_indexes(self, list, value):
        indexes = []
        for i in range(0, len(list)):
            if list[i] == value:
                indexes.append(i)
        return indexes


    def evaluate_mate(self, move, previous_piece_moved, depth, player):
        if player == self.player:
            opponent = self.opponent

        if player == self.opponent:
            opponent = self.player

        #print('\n')
        #print(depth, move)

        # The move must first get simulated (played for real)
        self.simulate_move(move)

        # opponent in check mate?
        moves = self.get_legal_moves(opponent, previous_piece_moved)
        #print(moves)

        in_check = self.check_for_check(opponent, previous_piece_moved)

        if len(moves) == 0 and in_check == True:
            #print('CHECKMATE DETECTED at top of evaluate')
            return [1000, depth] # CHECKMATE!

        if len(moves) == 0 and in_check == False:
            return [0, depth] # STALEMATE!

        if depth >= self.max_depth:
            return [0, depth]

        # opponent only has a few options?
        if len(moves) / 4 >= 1 and len(moves) / 4 <= self.max_breadth:
            #print("LIMITED OPTIONS")

            certain_check_mate = True
            depth += 1
            saved_depth = depth
            self.save_depth(depth)
            for opp_i in range(0, int(len(moves) / 4)): # loop through opponent's potential moves
                self.change_depth(depth)
                self.clear_array()

                # simulate an option
                opp_move = self.generate_ordered_move(moves, opp_i)
                self.simulate_move(opp_move)
                own_moves = self.get_legal_moves(player, opp_move[0])

                self.save_depth(saved_depth + 1)
                potential = False
                for own_i in range(0, int(len(own_moves) / 4)): # loop through all own moves in response - only one needs to work.

                    self.change_depth(saved_depth + 1)
                    self.clear_array()
                    own_move = self.generate_ordered_move(own_moves, own_i)

                    evaluation = self.evaluate_mate(own_move, opp_move[0], saved_depth + 1, player)
                    if evaluation[0] >= 1000 - (self.max_depth + 1):
                        potential = True
                        returned_depth = evaluation[1]
                        if evaluation[0] == 1000:
                            break

                if potential == False:
                    certain_check_mate = False

            if certain_check_mate == True:
                #print(f"\nRETURNING WITH CERTAINTY AT DEPTH {depth}\n")
                #print(f"RETURNING: {1000 - returned_depth}, {returned_depth}")
                return [1000 - returned_depth, returned_depth]

        return [0, depth]



    def detect_threats(self, previous_piece_moved, specific_piece, player, action):
        if player == self.player:
            if action == 'threatened':
                opp_pieces = self.opp_pieces
                own_pieces = self.own_pieces
                lower_bound = 100
                upper_bound = 200
            if action == 'supported':
                opp_pieces = self.own_pieces
                own_pieces = self.own_pieces
                lower_bound = 300
                upper_bound = 400
        if player == self.opponent:
            if action == 'threatened':
                opp_pieces = self.own_pieces
                own_pieces = self.opp_pieces
                lower_bound = 100
                upper_bound = 200
            if action == 'supported':
                opp_pieces = self.opp_pieces
                own_pieces = self.opp_pieces
                lower_bound = 300
                upper_bound = 400

        # DETECT YOUR OWN PIECES WHICH ARE THREATENED!
        own_threatened_pieces = {}
        specific_threats = []
        for piece in opp_pieces:
            if piece.alive == True:
                self.clear_array()
                piece.move(previous_piece_moved)
                result = numpy.where(numpy.logical_and(board.array > lower_bound, board.array < upper_bound))
                rows = result[0]
                cols = result[1]

                for i in range(0, int(len(rows))): # if the opponent can take one of our pieces
                    if specific_piece == False:
                        for own_piece in own_pieces:
                            if own_piece.identifier == board.array[rows[i]][cols[i]] - lower_bound:
                                if own_piece not in own_threatened_pieces:
                                    own_threatened_pieces[own_piece] = {1: {None: [piece]}}
                                else:
                                    own_threatened_pieces[own_piece][1][None].append(piece)
                    else:
                        if specific_piece.identifier == board.array[rows[i]][cols[i]] - lower_bound:
                            specific_threats.append(piece)

        self.clear_array()
        if specific_piece == False:
            return own_threatened_pieces # For the first order, return a dictionary with all own pieces as keys. Associated values are also dictionaries, with the values being which depth the threat is detected. Finally, the value is a list of all threatening pieces at that depth for a particular piece.
        else:
            return specific_threats

    def detect_recursive_threats(self, own_threatened_pieces, key, previous_piece_moved, threat_depth, player, action, previous_threatened_pieces, previous_threat):

        original_threat_depth = threat_depth
        original_threatened_pieces = own_threatened_pieces[key][threat_depth][previous_threat]
        #print(f"ORIGINAL THREATENED PIECES: {original_threatened_pieces}")

        for threat in own_threatened_pieces[key][threat_depth][previous_threat]:
            threat.alive = False
            #print(f"\nREMOVING: {threat}")

            deeper_specific_threats = self.detect_threats(previous_piece_moved, key, player, action)
            if len(deeper_specific_threats) > 0:

                new_list = []
                #print(f"\nDEEPER SPECIFIC THREATS: {deeper_specific_threats}")
                #print(f"PREVIOUS THREATENED PIECES: {previous_threatened_pieces}\n")
                for new_threat in deeper_specific_threats:
                    if new_threat not in previous_threatened_pieces:
                        new_list.append(new_threat)

                if len(new_list) > 0:
                    #threat_depth += 1
                    if threat_depth + 1 not in own_threatened_pieces[key]:
                        own_threatened_pieces[key][threat_depth + 1] = {threat: new_list}
                    else:
                        own_threatened_pieces[key][threat_depth + 1][threat] = new_list
                    self.detect_recursive_threats(own_threatened_pieces, key, previous_piece_moved, threat_depth + 1, player, action, original_threatened_pieces + previous_threatened_pieces, threat)

            threat.alive = True

        for threat in own_threatened_pieces[key][original_threat_depth][previous_threat]:
            threat.alive = True



    def order_simple(self, threatened_pieces):
        # order each list simpmly

        for first_key in threatened_pieces:
            for threat_depth in threatened_pieces[first_key]:
                for piece_moved in threatened_pieces[first_key][threat_depth]:
                    if len(threatened_pieces[first_key][threat_depth][piece_moved]) > 0:
                        rankings = []
                        for piece in threatened_pieces[first_key][threat_depth][piece_moved]:
                            rankings.append(piece.ranking)
                        rankings = sorted(rankings)
                        new_list = []
                        for i in range(0, len(rankings)):
                            for piece in threatened_pieces[first_key][threat_depth][piece_moved]:
                                if piece.ranking == rankings[i] and piece not in new_list:
                                    new_list.append(piece)
                                    break
                        threatened_pieces[first_key][threat_depth][piece_moved] = new_list


                        for i in range(0, len(new_list)):
                            if len(new_list) > i + 1:
                                if new_list[i].ranking == new_list[i + 1].ranking:
                                    if threat_depth + 1 in list(threatened_pieces[first_key].keys()):
                                        first_sub = False
                                        second_sub = False
                                        if new_list[i] in list(threatened_pieces[first_key][threat_depth + 1].keys()):
                                            first_sub = threatened_pieces[first_key][threat_depth + 1][new_list[i]]
                                        if new_list[i + 1] in list(threatened_pieces[first_key][threat_depth + 1].keys()):
                                            second_sub = threatened_pieces[first_key][threat_depth + 1][new_list[i + 1]]

                                        winner = False
                                        if first_sub != False and second_sub != False:
                                            shortest = min([len(first_sub), len(second_sub)])
                                            for x in range(0, shortest):
                                                if first_sub[x].ranking > second_sub[x].ranking:
                                                    winner = second_sub
                                                    break
                                                if first_sub[x].ranking < second_sub[x].ranking:
                                                    winner = first_sub
                                                    break

                                        if (first_sub != False and second_sub == False) or (first_sub == False and second_sub != False):
                                            if first_sub == False:
                                                true_sub = second_sub
                                                competing_sub = first_sub
                                                competing_piece = new_list[i]
                                            else:
                                                true_sub = first_sub
                                                competing_sub = second_sub
                                                competing_piece = new_list[i + 1]
                                            for x in range(0, len(true_sub)):
                                                if competing_piece.ranking > true_sub[x].ranking: # allowed
                                                    winner = true_sub
                                                    break
                                                if competing_piece.ranking < true_sub[x].ranking:
                                                    winner = competing_sub
                                                    break

                                        if winner == second_sub:
                                            saved = threatened_pieces[first_key][threat_depth][piece_moved][i]
                                            threatened_pieces[first_key][threat_depth][piece_moved][i] = threatened_pieces[first_key][threat_depth][piece_moved][i + 1]
                                            threatened_pieces[first_key][threat_depth][piece_moved][i + 1] = saved




        # order those pieces of the same ranking at the same depth (and related piece) depending on which allows the lowest subsequent rank:


        return threatened_pieces

    def get_tp_length(self, threatened_pieces, first_key):
        count = 0
        for threat_depth in threatened_pieces[first_key]:
            for piece in threatened_pieces[first_key][threat_depth]:
                count += len(threatened_pieces[first_key][threat_depth][piece])
        return count

    def order_recursive(self, threatened_pieces, new_order, threat_depth, first_key, previous_pieces, t_pieces, count):
        threat_depth += 1

        if threat_depth in list(threatened_pieces[first_key].keys()):
            for previous_piece in previous_pieces:
                if previous_piece in list(threatened_pieces[first_key][threat_depth].keys()):
                    #print(f'we have a boogie: {previous_piece}')
                    allowed = True
                    seen = False
                    saved_potential_piece = None
                    saved_competing_piece = None
                    for x in range(0, len(threatened_pieces[first_key][threat_depth][previous_piece])):
                        potential_piece = threatened_pieces[first_key][threat_depth][previous_piece][x]
                        if potential_piece not in new_order[first_key]:
                            #print(f"\nPOTENTIAL PIECE: {potential_piece}")
                            if count - 1 == len(new_order[first_key]):
                                new_order[first_key].append(potential_piece)
                                #print(f"Appending into DH: {potential_piece}")
                                break

                            # ranking must be less than all layers above it.
                            for t in range(1, threat_depth + 1):
                                for index_piece in t_pieces[t]:
                                    if index_piece in list(threatened_pieces[first_key][t].keys()):
                                        #print(f"SCANNING: threat depth: {t}, index piece: {index_piece}")
                                        for num in range(0, len(threatened_pieces[first_key][t][index_piece])):
                                            competing_piece = threatened_pieces[first_key][t][index_piece][num]
                                            #print(f"POTENTIAL PIECE: {potential_piece}")
                                            #print(f"COMPETING PIECE: {competing_piece}")
                                            #print(f"NEW ORDER: {new_order}")
                                            if competing_piece not in new_order[first_key]:
                                                if competing_piece != potential_piece:

                                                    #print('both competing and potential NOT IN new order')
                                                    seen = True
                                                    saved_potential_piece = potential_piece
                                                    saved_competing_piece = competing_piece

                                                    if potential_piece.ranking >= competing_piece.ranking:
                                                        allowed = False
                                                        #print("FALSE!!!!!")

                    #print(f"allowed: {allowed}, seen: {seen}")
                    if allowed == True and seen == True:
                        #print(f"POTENTIAL PIECE: {saved_potential_piece}")
                        #print(f"COMPETING PIECE: {saved_competing_piece}")
                        #print(f"DEEP APPENDAGE")
                        new_order[first_key].append(saved_potential_piece)
                        #print(f"Appending into: {saved_potential_piece}")

        return new_order

    def order_big(self, threatened_pieces):
        new_order = {}
        for first_key in threatened_pieces:
            #print(f"\n\n\nFIRST KEY: {first_key}")

            count = self.get_tp_length(threatened_pieces, first_key)
            seen_pieces = []
            potential_pieces = []
            tp_pieces = []
            for i in range(0, len(threatened_pieces[first_key][1][None])):
                delay = False
                #print(f"\n\ni: {i}")
                piece = threatened_pieces[first_key][1][None][i]
                #print(f"PIECE: {piece}")
                seen_pieces.append(piece)

                # First, append the piece to the new list.
                if i == 0:
                    new_order[first_key] = [piece]
                    #print(f"Appending up here: {piece}")


                # check if the next depth at this piece offers lower ranking pieces.
                #if len(threatened_pieces[first_key][1][None]) > i + 1:
                if 2 in list(threatened_pieces[first_key].keys()):
                    #if piece in list(threatened_pieces[first_key][2].keys()):

                    # get all seen pieces and look for potential options
                    for seen_piece in seen_pieces:
                        if seen_piece in list(threatened_pieces[first_key][2].keys()):
                            #print(f"SEEN PIECE: {seen_piece}")
                            if seen_piece not in tp_pieces and seen_piece != piece: # if you allow the current piece, the subsequent pieces will be appended before the higher level one (this is wrong)
                                tp_pieces.append(seen_piece)
                            for x in range(0, len(threatened_pieces[first_key][2][seen_piece])):

                                potential_piece = threatened_pieces[first_key][2][seen_piece][x]
                                #print(f"POTENTIAL PIECE: {potential_piece}")
                                #print(f"PIECE: {piece}")

                                #print(f"count: {count}")
                                #print(f"new order length: {len(new_order[first_key])}")

                                if potential_piece.ranking < piece.ranking:
                                    if potential_piece not in new_order[first_key]:
                                        if seen_piece != piece:
                                            new_order[first_key].append(potential_piece)
                                            #print(f"Appending in here: {potential_piece}")
                                            potential_pieces.append(potential_piece)
                                            #new_order = self.order_recursive(threatened_pieces, new_order, 2, first_key, potential_pieces, {1: [None], 2: tp_pieces.append(piece)}, count)
                                        else:
                                            delay = True
                                            saved_potential_piece = potential_piece

                                elif count - 2 == len(new_order[first_key]):
                                    #print("LAST ONE!")
                                    if potential_piece not in new_order[first_key]:
                                        delay = True
                                        saved_potential_piece = potential_piece




                # check if the appended piece gives way to another lower ranking piece

                t_pieces = {1: [None], 2: tp_pieces, 3: potential_pieces}
                #print(f"t_pieces: {t_pieces}")
                new_order = self.order_recursive(threatened_pieces, new_order, 2, first_key, potential_pieces, t_pieces, count)

                if i != 0:
                    new_order[first_key].append(piece)
                    #print(f"Appending down here: {piece}")

                if delay == True:
                    potential_pieces.append(saved_potential_piece)
                    new_order[first_key].append(saved_potential_piece)

                    tp_pieces.append(piece)
                    t_pieces = {1: [None], 2: tp_pieces, 3: potential_pieces}
                    #print(f"Appending all the way down here: {saved_potential_piece}")
                    new_order = self.order_recursive(threatened_pieces, new_order, 2, first_key, potential_pieces, t_pieces, count)

        return threatened_pieces, new_order


    def please_order(self, threatened_pieces):
        threatened_pieces = self.order_simple(threatened_pieces)

        threatened_pieces, new_order = self.order_big(threatened_pieces)

        return threatened_pieces, new_order


    def detect_ordered_threats(self, previous_piece_moved, player, action):

        # DETECT FIRST ORDER THREATS!
        own_threatened_pieces = self.detect_threats(previous_piece_moved, False, player, action)
        #print(f"\nOWN THREATENED PIECES: {own_threatened_pieces}")

        # DETECT DEEPER THREATS!
        threat_depth = 1
        for key in own_threatened_pieces:
            self.detect_recursive_threats(own_threatened_pieces, key, previous_piece_moved, threat_depth, player, action, own_threatened_pieces[key][threat_depth][None], None)

        print(own_threatened_pieces)

        own_threatened_pieces, new_order = self.please_order(own_threatened_pieces)

        return own_threatened_pieces, new_order


    def evaluate_supports_and_threats(self, own_threatened_pieces, own_supported_pieces, opp_threatened_pieces, opp_supported_pieces):
        # evaluate the safety of every piece on the board, then add that together.
        #print(f"OWN THREATENED PIECES: {own_threatened_pieces}")
        #print(f"OWN SUPPORTED PIECES: {own_supported_pieces}")

        total_count = []
        for x in range(0, 2):
            if x == 0:
                threatened_pieces = own_threatened_pieces
                supported_pieces = own_supported_pieces
                pieces = self.own_pieces
            if x == 1:
                threatened_pieces = opp_threatened_pieces
                supported_pieces = opp_supported_pieces
                pieces = self.opp_pieces


            big_count = []
            for piece in pieces:
                if piece.alive == True:
                    piece_evaluation = 0
                    threats = []
                    supports = []
                    if piece in list(threatened_pieces.keys()):
                        threats = threatened_pieces[piece]
                    if piece in list(supported_pieces.keys()):
                        supports = supported_pieces[piece]

                    centre_piece = piece
                    response_count = 0

                    for i in range(0, len(threats)):
                        if len(supports) < i + 1:
                            #print('no possible responses!')
                            # there are no possible responses. They can take with no consequences regardless of ranking.
                            response_count -= piece.ranking
                            break

                        else:
                            # there are possible supporting responses.

                            if centre_piece.ranking > threats[i].ranking:
                                # they will definitely take.
                                response_count -= centre_piece.ranking
                                response_count += threats[i].ranking

                            if centre_piece.ranking <= threats[i].ranking:
                                # whether they take will depend on the subsequent rankings

                                # assuming the opponent decides to take:
                                response_count -= centre_piece.ranking
                                response_count += threats[i].ranking

                            centre_piece = supports[i] # this should be done last.


                    if response_count >= 0:
                        # the opponent will probs not do it, so piece evaluation is unchanged.
                        piece_evaluation += 0

                    if response_count < 0:
                        # negative response count is good for opponent; they will probably do it
                        piece_evaluation += response_count

                    #print(f"PIECE EVALUATION for {piece}: {piece_evaluation}")

                    big_count.append(piece_evaluation)

            total_count.append(big_count)

        defense_score = min(total_count[0])
        attack_score = min(total_count[1]) / 100
        #print(f"\nTOTAL COUNT 0: {total_count[0]}")
        #print(f"TOTAL COUNT 1: {total_count[1]}")
        score = defense_score - attack_score
        #print(f"SCORE: {score}")
        return score






    def evaluate(self, move, previous_piece_moved, depth, player):


        # 1: See if we can force checkmate
        #print("FORCE CHECKMATE")
        mate_evaluation = self.evaluate_mate(move, previous_piece_moved, depth, player)
        if mate_evaluation[0] >= 1000 - self.max_depth:
            return mate_evaluation

        self.change_depth(0)
        self.clear_array()

        #print("DEFEND CHECKMATE")
        # 2: Defend against checkmate
        self.simulate_move(move) # simulate our own move
        depth = depth + 4
        self.save_depth(depth)
        opp_moves = self.get_legal_moves(self.opponent, move[0]) # get opponent's legal moves
        for i in range(0, int(len(opp_moves) / 4)):
            self.change_depth(depth)
            self.clear_array()

            opp_move = self.generate_ordered_move(opp_moves, i)

            mate_threat_evaluation = self.evaluate_mate(opp_move, move[0], depth, self.opponent)

            if mate_threat_evaluation[0] >= 1000 - self.max_depth:
                return [-(mate_threat_evaluation[0]), depth]

        self.change_depth(0)
        self.clear_array()


        # 3: Heuristics (ditch legal move function in favour of processing time)
        #print("HEURISTICS")

        self.simulate_move(move)
        self.clear_array()

        score = 0
        if move[3] != None:
            score += move[3].ranking

        # DETECT PIECES WHICH ARE THREATENED AND SUPPORTED!
        own_threatened_pieces, ST_NO = self.detect_ordered_threats(previous_piece_moved, self.player, 'threatened')
        own_supported_pieces, SS_NO = self.detect_ordered_threats(previous_piece_moved, self.player, 'supported')
        opp_threatened_pieces, OT_NO = self.detect_ordered_threats(previous_piece_moved, self.opponent, 'threatened')
        opp_supported_pieces, OS_NO = self.detect_ordered_threats(previous_piece_moved, self.opponent, 'supported')

        #print(f"\nOWN_THREATENED: {own_threatened_pieces}")
        #print(f"\nNEW ORDER: {ST_NO}")
        #print(f"\nOWN_SUPPORTED: {own_supported_pieces}")
        #print(f"\nNEW ORDER: {SS_NO}")
        #print(f"\nOPP_THREATENED: {opp_threatened_pieces}")
        #print(f"\nNEW ORDER: {OT_NO}")
        #print(f"\nOPP_SUPPORTED: {opp_supported_pieces}")
        #print(f"\nNEW ORDER: {OS_NO}")

        # EVALUATE THE POSITION BASED ON THREATENED AND SUPPORTED PIECES
        evaluation = self.evaluate_supports_and_threats(ST_NO, SS_NO, OT_NO, OS_NO)
        score += evaluation







        return [score, depth]




    def generate_move(self, type):

        moves = self.get_legal_moves(self.player, self.original_previous_piece_moved)
        if len(moves) == 0:
            return None

        self.moves = moves

        if type == 'computer':
            evaluations = []
            for i in range(0, int(len(moves) / 4)):
                self.change_depth(0)
                self.clear_array()

                move = self.generate_ordered_move(moves, i)
                #print(f'\n\nOWN INITIAL MOVE: {move}')
                evaluation = self.evaluate(move, self.original_previous_piece_moved, 0, self.player)
                evaluations.append(evaluation[0])
                if evaluation[0] == 1000:
                    break
            self.change_depth(0)
            self.clear_array()
            max_eval = max(evaluations)
            indexes = self.get_indexes(evaluations, max_eval)
            #print(f"\n\nMAX_EVAL: {max_eval}")
            #print(f"EVALS: {evaluations}")

            best_moves = []
            for index in indexes:
                move = self.generate_ordered_move(moves, index)
                best_moves.append(move[0])
                best_moves.append(move[1])
                best_moves.append(move[2])
                best_moves.append(move[3])

            final_move = self.generate_random_legal_move(best_moves)
            #print(f"\nFINAL MOVE: {final_move}")
            final_move = self.translate_move(final_move)
            #print(f"FINAL MOVE: {final_move}\n")
            return final_move


        if type == 'random':
            move = self.generate_random_legal_move(moves)
            move = self.translate_move(move)
            return move
