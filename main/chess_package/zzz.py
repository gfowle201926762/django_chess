import numpy


board = numpy.zeros((8, 8))

board[1][2] = 140
board[6][7] = 199
result = numpy.where(numpy.logical_and(board > 100, board < 200))

print(board)
print(result)

rows = result[0]
print(rows)


print(len(result))