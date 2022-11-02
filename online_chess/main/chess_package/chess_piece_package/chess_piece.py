

from .chess_board_package.chess_board import board

class Piece():
    def __init__(self, identifier, x, y, type, color, ranking, first_turn, alive):
        self.identifier = identifier
        self.x = x
        self.y = y
        self.type = type
        self.color = color
        self.ranking = ranking
        self.first_turn = first_turn
        self.alive = alive

    def __repr__(self):
        return '[' + str(self.color) + ' ' + str(self.type) + ' ' + str(self.identifier) + ']'

    def check_queening(self):
        
        if self.type == 'pawn' and ((self.color == 'white' and self.y == 0) or (self.color == 'black' and self.y == 7)):
            self.type = 'queen'
            self.ranking = 9

    def update_array(self):
        board.array[self.y][self.x] = self.identifier

    def check_array(self, new_y, new_x):
        if new_x >= 0 and new_x <= 7 and new_y >= 0 and new_y <= 7:
            if board.array[new_y][new_x] == 0:
                board.array[new_y][new_x] = -1

    def check_take_array(self, new_y, new_x):
        if new_x >= 0 and new_x <= 7 and new_y >= 0 and new_y <= 7:
            if self.color == 'white' and board.array[new_y][new_x] >= 17 and board.array[new_y][new_x] <= 32:
                board.array[new_y][new_x] += 100

            if self.color == 'black' and board.array[new_y][new_x] >= 1 and board.array[new_y][new_x] <= 16:
                board.array[new_y][new_x] += 100

            if self.color == 'black' and board.array[new_y][new_x] >= 17 and board.array[new_y][new_x] <= 32:
                board.array[new_y][new_x] += 300

            if self.color == 'white' and board.array[new_y][new_x] >= 1 and board.array[new_y][new_x] <= 16:
                board.array[new_y][new_x] += 300

            if self.color == 'white' and board.array[new_y][new_x] == 1 and self.type == 'castle' and self.first_turn == True:
                board.array[new_y][new_x] += 200

            if self.color == 'black' and board.array[new_y][new_x] == 17 and self.type == 'castle' and self.first_turn == True:
                board.array[new_y][new_x] += 200

    def updown(self):
        for i in range(1, 8):
            if self.y - i >= 0:
                if board.array[self.y - i][self.x] == 0:
                    self.check_array(self.y - i, self.x)
                else:
                    self.check_take_array(self.y - i, self.x)
                    break
            else:
                break

        for i in range(1, 8):
            if self.y + i <= 7:
                if board.array[self.y + i][self.x] == 0:
                    self.check_array(self.y + i, self.x)
                else:
                    self.check_take_array(self.y + i, self.x)
                    break
            else:
                break

        for i in range(1, 8):
            if self.x + i <= 7:
                if board.array[self.y][self.x + i] == 0:
                    self.check_array(self.y, self.x + i)
                else:
                    self.check_take_array(self.y, self.x + i)
                    break
            else:
                break

        for i in range(1, 8):
            if self.x - i >= 0:
                if board.array[self.y][self.x - i] == 0:
                    self.check_array(self.y, self.x - i)
                else:
                    self.check_take_array(self.y, self.x - i)
                    break
            else:
                break

        
    def diagonal(self):
        for i in range(1, 8):
            if self.y - i >= 0 and self.x + i <= 7:
                if board.array[self.y - i][self.x + i] == 0:
                    self.check_array(self.y - i, self.x + i)
                else:
                    self.check_take_array(self.y - i, self.x + i)
                    break
            else:
                break

        for i in range(1, 8):
            if self.y - i >= 0 and self.x - i >= 0:
                if board.array[self.y - i][self.x - i] == 0:
                    self.check_array(self.y - i, self.x - i)
                else:
                    self.check_take_array(self.y - i, self.x - i)
                    break
            else:
                break

        for i in range(1, 8):
            if self.y + i <= 7 and self.x - i >= 0:
                if board.array[self.y + i][self.x - i] == 0:
                    self.check_array(self.y + i, self.x - i)
                else:
                    self.check_take_array(self.y + i, self.x - i)
                    break
            else:
                break

        for i in range(1, 8):
            if self.y + i <= 7 and self.x + i <= 7:
                if board.array[self.y + i][self.x + i] == 0:
                    self.check_array(self.y + i, self.x + i)
                else:
                    self.check_take_array(self.y + i, self.x + i)
                    break
            else:
                break
        


    def move(self, previous_piece_moved):
        if self.type == 'king':
            for i in range(-1, 2):
                self.check_array(self.y + i, self.x + 1)
                self.check_array(self.y + i, self.x - 1)
                self.check_take_array(self.y + i, self.x + 1)
                self.check_take_array(self.y + i, self.x - 1)

            self.check_array(self.y + 1, self.x)
            self.check_array(self.y - 1, self.x)
            self.check_take_array(self.y + 1, self.x)
            self.check_take_array(self.y - 1, self.x)

        if self.type == 'queen':
            self.updown()
            self.diagonal()

        if self.type == 'castle':
            self.updown()

        if self.type == 'bishop':
            self.diagonal()

        if self.type == 'knight':
            for i in range(-2, 3):
                if  abs(i) == 1:
                    self.check_array(self.y + 2, self.x + i)
                    self.check_array(self.y - 2, self.x + i)
                    self.check_take_array(self.y + 2, self.x + i)
                    self.check_take_array(self.y - 2, self.x + i)
                if abs(i) == 2:
                    self.check_array(self.y + 1, self.x + i)
                    self.check_array(self.y - 1, self.x + i)
                    self.check_take_array(self.y + 1, self.x + i)
                    self.check_take_array(self.y - 1, self.x + i)

        if self.type == 'pawn':

            i = -1
            p = 0

            if self.color == 'black':
                i = 1
                p = 1

            if self.x + 1 <= 7:
                self.check_take_array(self.y + i, self.x + 1)

            if self.x - 1 >= 0:
                self.check_take_array(self.y + i, self.x - 1)

            if self.first_turn == True:
                if board.array[self.y + i][self.x] == 0 and board.array[self.y + (2 * i)][self.x] == 0:
                    self.check_array(self.y + (2 * i), self.x)

            self.check_array(self.y + i, self.x)


            # checking en passant
            if self.y == 3 + p:
                if self.x + 1 <= 7 and previous_piece_moved != None:
                    if board.array[self.y][self.x + 1] == previous_piece_moved.identifier:
                        if previous_piece_moved.type == 'pawn':
                            if (previous_piece_moved.color == 'black' and self.color == 'white') or (previous_piece_moved.color == 'white' and self.color == 'black'):
                                board.array[self.y + i][self.x + 1] = previous_piece_moved.identifier + 100 

                if self.x - 1 >= 0 and previous_piece_moved != None:
                    if board.array[self.y][self.x - 1] == previous_piece_moved.identifier:
                        if previous_piece_moved.type == 'pawn':
                            if (previous_piece_moved.color == 'black' and self.color == 'white') or (previous_piece_moved.color == 'white' and self.color == 'black'):
                                board.array[self.y + i][self.x - 1] = previous_piece_moved.identifier + 100 




"""white_king = Piece(1, 4, 7, 'king', 'white', 10, True, True)
white_queen = Piece(2, 3, 7, 'queen', 'white', 9, True, True)
white_castle_1 = Piece(7, 0, 7, 'castle', 'white', 5, True, True)
white_castle_2 = Piece(8, 7, 7, 'castle', 'white', 5, True, True)
white_bishop_1 = Piece(3, 2, 7, 'bishop', 'white', 3, True, True)
white_bishop_2 = Piece(4, 5, 7, 'bishop', 'white', 3, True, True)
white_knight_1 = Piece(5, 1, 7, 'knight', 'white', 3, True, True)
white_knight_2 = Piece(6, 6, 7, 'knight', 'white', 3, True, True)
white_pawn_1 = Piece(9, 0, 6, 'pawn', 'white', 1, True, True)
white_pawn_2 = Piece(10, 1, 6, 'pawn', 'white', 1, True, True)
white_pawn_3 = Piece(11, 2, 6, 'pawn', 'white', 1, True, True)
white_pawn_4 = Piece(12, 3, 6, 'pawn', 'white', 1, True, True)
white_pawn_5 = Piece(13, 4, 6, 'pawn', 'white', 1, True, True)
white_pawn_6 = Piece(14, 5, 3, 'pawn', 'white', 1, True, True)
white_pawn_7 = Piece(15, 6, 6, 'pawn', 'white', 1, True, True)
white_pawn_8 = Piece(16, 7, 6, 'pawn', 'white', 1, True, True)


black_king = Piece(17, 4, 0, 'king', 'black', 10, True, True)
black_queen = Piece(18, 0, 3, 'queen', 'black', 9, True, True)
black_castle_1 = Piece(23, 0, 0, 'castle', 'black', 5, True, True)
black_castle_2 = Piece(24, 7, 0, 'castle', 'black', 5, True, True)
black_bishop_1 = Piece(19, 2, 0, 'bishop', 'black', 3, True, True)
black_bishop_2 = Piece(20, 5, 0, 'bishop', 'black', 3, True, True)
black_knight_1 = Piece(21, 1, 0, 'knight', 'black', 3, True, True)
black_knight_2 = Piece(22, 6, 0, 'knight', 'black', 3, True, True)
black_pawn_1 = Piece(25, 0, 1, 'pawn', 'black', 1, True, True)
black_pawn_2 = Piece(26, 1, 1, 'pawn', 'black', 1, True, True)
black_pawn_3 = Piece(27, 2, 1, 'pawn', 'black', 1, True, True)
black_pawn_4 = Piece(28, 3, 1, 'pawn', 'black', 1, True, True)
black_pawn_5 = Piece(29, 4, 1, 'pawn', 'black', 1, True, True)
black_pawn_6 = Piece(30, 5, 1, 'pawn', 'black', 1, True, True)
black_pawn_7 = Piece(31, 6, 3, 'pawn', 'black', 1, True, True)
black_pawn_8 = Piece(32, 7, 1, 'pawn', 'black', 1, True, True)

white_pieces = [white_king, white_queen, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2, white_knight_1, white_knight_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_4, white_pawn_5, white_pawn_6, white_pawn_7, white_pawn_8]

black_pieces = [black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2, black_knight_1, black_knight_2,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_4, black_pawn_5, black_pawn_6, black_pawn_7, black_pawn_8]

all_pieces = white_pieces + black_pieces"""


# check mate possibility

"""black_king = Piece(17, 0, 0, 'king', 'black', 10, True, True)
white_king = Piece(1, 4, 7, 'king', 'white', 10, True, True)
white_queen = Piece(2, 3, 7, 'queen', 'white', 9, True, True)
white_castle_1 = Piece(7, 0, 7, 'castle', 'white', 5, True, True)

white_pieces = [white_king, white_queen, white_castle_1]
black_pieces = [black_king]
all_pieces = white_pieces + black_pieces"""


# checkmate in 4 (white to move)
"""white_king = Piece(1, 4, 7, 'king', 'white', 10, True, True)
white_queen = Piece(2, 3, 7, 'queen', 'white', 9, True, True)
white_castle_1 = Piece(7, 0, 7, 'castle', 'white', 5, True, True)
white_bishop_2 = Piece(4, 5, 7, 'bishop', 'white', 3, True, True)
white_pawn_1 = Piece(9, 0, 6, 'pawn', 'white', 1, True, True)
white_pawn_2 = Piece(10, 1, 6, 'pawn', 'white', 1, True, True)
white_pawn_3 = Piece(11, 2, 6, 'pawn', 'white', 1, True, True)
white_pawn_6 = Piece(14, 5, 3, 'pawn', 'white', 1, True, True)
white_pawn_7 = Piece(15, 6, 6, 'pawn', 'white', 1, True, True)
white_pawn_8 = Piece(16, 7, 6, 'pawn', 'white', 1, True, True)


black_king = Piece(17, 4, 0, 'king', 'black', 10, True, True)
black_queen = Piece(18, 0, 3, 'queen', 'black', 9, True, True)
black_castle_1 = Piece(23, 0, 0, 'castle', 'black', 5, True, True)
black_bishop_1 = Piece(19, 2, 0, 'bishop', 'black', 3, True, True)
black_pawn_1 = Piece(25, 0, 1, 'pawn', 'black', 1, True, True)
black_pawn_2 = Piece(26, 1, 1, 'pawn', 'black', 1, True, True)
black_pawn_3 = Piece(27, 2, 1, 'pawn', 'black', 1, True, True)
black_pawn_6 = Piece(30, 5, 1, 'pawn', 'black', 1, True, True)
black_pawn_7 = Piece(31, 6, 3, 'pawn', 'black', 1, True, True)
black_pawn_8 = Piece(32, 7, 1, 'pawn', 'black', 1, True, True)

white_pieces = [white_king, white_queen, white_castle_1, white_bishop_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_6, white_pawn_7, white_pawn_8]

black_pieces = [black_king, black_queen, black_bishop_1, black_castle_1,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_6, black_pawn_7, black_pawn_8]

all_pieces = [white_king, white_queen, white_castle_1, white_bishop_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_6, white_pawn_7, white_pawn_8, black_king, black_queen, black_bishop_1, black_castle_1,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_6, black_pawn_7, black_pawn_8]"""




# checkmate via enpassant

white_king = Piece(1, 6, 7, 'king', 'white', 10, True, True)
white_queen = Piece(2, 3, 7, 'queen', 'white', 9, True, False)
white_castle_1 = Piece(7, 4, 1, 'castle', 'white', 5, True, True)
white_castle_2 = Piece(8, 7, 7, 'castle', 'white', 5, True, False)
white_bishop_1 = Piece(3, 0, 5, 'bishop', 'white', 3, True, True)
white_bishop_2 = Piece(4, 5, 7, 'bishop', 'white', 3, True, False)
white_knight_1 = Piece(5, 5, 5, 'knight', 'white', 3, True, True)
white_knight_2 = Piece(6, 6, 7, 'knight', 'white', 3, True, False)
white_pawn_1 = Piece(9, 0, 6, 'pawn', 'white', 1, True, True)
white_pawn_2 = Piece(10, 1, 6, 'pawn', 'white', 1, True, False)
white_pawn_3 = Piece(11, 2, 6, 'pawn', 'white', 1, True, False)
white_pawn_4 = Piece(12, 3, 4, 'pawn', 'white', 1, True, True)
white_pawn_5 = Piece(13, 4, 6, 'pawn', 'white', 1, True, False)
white_pawn_6 = Piece(14, 5, 6, 'pawn', 'white', 1, True, True)
white_pawn_7 = Piece(15, 6, 4, 'pawn', 'white', 1, True, True)
white_pawn_8 = Piece(16, 7, 4, 'pawn', 'white', 1, True, True)


black_king = Piece(17, 6, 2, 'king', 'black', 10, True, True)
black_queen = Piece(18, 0, 3, 'queen', 'black', 9, True, False)
black_castle_1 = Piece(23, 2, 0, 'castle', 'black', 5, True, True)
black_castle_2 = Piece(24, 4, 0, 'castle', 'black', 5, True, True)
black_bishop_1 = Piece(19, 2, 4, 'bishop', 'black', 3, True, True)
black_bishop_2 = Piece(20, 5, 0, 'bishop', 'black', 3, True, False)
black_knight_1 = Piece(21, 1, 0, 'knight', 'black', 3, True, False)
black_knight_2 = Piece(22, 6, 0, 'knight', 'black', 3, True, False)
black_pawn_1 = Piece(25, 0, 1, 'pawn', 'black', 1, True, True)
black_pawn_2 = Piece(26, 1, 1, 'pawn', 'black', 1, True, True)
black_pawn_3 = Piece(27, 2, 1, 'pawn', 'black', 1, True, True)
black_pawn_4 = Piece(28, 3, 1, 'pawn', 'black', 1, True, False)
black_pawn_5 = Piece(29, 4, 1, 'pawn', 'black', 1, True, False)
black_pawn_6 = Piece(30, 5, 2, 'pawn', 'black', 1, True, True)
black_pawn_7 = Piece(31, 6, 1, 'pawn', 'black', 1, True, True)
black_pawn_8 = Piece(32, 7, 1, 'pawn', 'black', 1, True, True)

white_pieces = [white_king, white_queen, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2, white_knight_1, white_knight_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_4, white_pawn_5, white_pawn_6, white_pawn_7, white_pawn_8]

black_pieces = [black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2, black_knight_1, black_knight_2,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_4, black_pawn_5, black_pawn_6, black_pawn_7, black_pawn_8]

all_pieces = white_pieces + black_pieces