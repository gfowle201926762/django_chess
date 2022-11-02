
import { all_pieces, black_pieces, white_pieces, white_king, black_king, board_array } from './piece_class_yolob.js'
import { game_board } from './board_yolob.js'

export function check_for_check(player, previous_piece_moved){
    if (player == 'white'){
        var king = white_king
        var check_value = 101
        var opp_pieces = black_pieces
    }
    if (player == 'black'){
        var king = black_king
        var check_value = 117
        var opp_pieces = white_pieces
    }

    var in_check = false
    opp_pieces.forEach(opp_piece => {
        if (opp_piece.alive == true){
            game_board.clear_array()
            opp_piece.move(previous_piece_moved)
            if (board_array[king.y][king.x] == check_value){
                in_check = true
            }
        }
    })

    return in_check
}

export function get_legal_moves(player, previous_piece_moved){
    if (player == 'white'){
        var king = white_king
        var check_value = 101
        var own_pieces = white_pieces
        var opp_pieces = black_pieces
        var castle_value = 201
        if (game_board.orientation == 'white'){
            var castle_row = 7
        }
        if (game_board.orientation == 'black'){
            var castle_row = 0
        }
        
    }
    if (player == 'black'){
        var king = black_king
        var check_value = 117
        var own_pieces = black_pieces
        var opp_pieces = white_pieces
        var castle_value = 217
        if (game_board.orientation == 'white'){
            var castle_row = 0
        }
        if (game_board.orientation == 'black'){
            var castle_row = 7
        }
    }

    var legal_moves = []

    own_pieces.forEach(own_piece => {
        if (own_piece.alive == true){

            var saved_x = own_piece.x
            var saved_y = own_piece.y
            
            game_board.clear_array()
            own_piece.move(previous_piece_moved)

            for (let row=0; row<8; row++){
                for (let col=0; col<8; col++){

                    var taken_piece = null
                    var legal_move = true

                    if (board_array[row][col] == -1 || (board_array[row][col] > 100 && board_array[row][col] < 200)){
                        own_piece.y = row
                        own_piece.x = col

                        if (board_array[row][col] > 100){
                            all_pieces.forEach(item => {
                                if (item.alive == true && item.identifier == board_array[row][col] - 100){
                                    item.alive = false
                                    taken_piece = item
                                }
                            })
                        }

                        opp_pieces.forEach(opp_piece => {
                            if (opp_piece.alive == true){
                                game_board.clear_array()
                                opp_piece.move(previous_piece_moved)
                                if (board_array[king.y][king.x] == check_value){
                                    legal_move = false
                                }
                            }
                        })

                        own_piece.x = saved_x
                        own_piece.y = saved_y
                        if (taken_piece != null){
                            taken_piece.alive = true
                        }

                        game_board.clear_array()
                        own_piece.move(previous_piece_moved)

                        if (legal_move == true){
                            legal_moves.push(own_piece)
                            legal_moves.push(row)
                            legal_moves.push(col)
                            legal_moves.push(taken_piece)
                            if (taken_piece != null){
                                if (taken_piece.identifier == 1 || taken_piece.identifier == 17){
                                    console.log("WHY IS THIS HAPPENING??")
                                    console.log(board_array[row][col])
                                }
                            }
                            
                        }
                    }

                    if (board_array[row][col] == castle_value){
                        
                        if (king.first_turn == true){
                            var castle_col = null
                            var in_check = check_for_check(player, previous_piece_moved)

                            if (in_check == false){ // only legal to castle if not in check.
                                var blocked = false

                                var increment = 0
                                if (game_board.orientation == 'black'){
                                    increment = -1
                                }

                                if (own_piece.x == 0){
                                    castle_col = 3 + increment
                                    opp_pieces.forEach(opp_piece => {
                                        if (opp_piece.alive == true){
                                            game_board.clear_array()
                                            opp_piece.move(previous_piece_moved)
                                            if (board_array[castle_row][2 + increment] != 0 || board_array[castle_row][3 + increment] != 0){
                                                blocked = true
                                            }
                                        }
                                        
                                    })
                                }

                                if (own_piece.x == 7){
                                    castle_col = 5 + increment
                                    opp_pieces.forEach(opp_piece => {
                                        if (opp_piece.alive == true){
                                            game_board.clear_array()
                                            opp_piece.move(previous_piece_moved)
                                            if (board_array[castle_row][5 + increment] != 0 || board_array[castle_row][6 + increment] != 0){
                                                blocked = true
                                            }
                                        }
                                        
                                    })
                                }
    
                                if (blocked == false){ //castling is possible!
                                    console.log(`castling is possible for ${player}!!`)
                                    legal_moves.push(own_piece) // castle
                                    legal_moves.push(castle_row)
                                    legal_moves.push(castle_col)
                                    legal_moves.push(king) // king is never taken, so good to have this as the taken value.
                                }                                
                            }

                            game_board.clear_array()
                            own_piece.move(previous_piece_moved)
                        }
                    }
                }
            }
        }

        
    })
    return legal_moves
}

export function generate_random_legal_move(moves){

    // moves = [oriringal piece, moving to y, moving to x, taken piece]

    var no_moves = (moves.length / 4)
    var x = Math.floor(Math.random() * no_moves)

    var move = [moves[x * 4], moves[(x * 4) + 1], moves[(x * 4) + 2], moves[(x * 4) + 3], moves[x * 4].x, moves[x * 4].y]
    // at this point, the original move piece .x and .y values are incorrect (referring to the big bug)

    return move
}

export function play_move(move){
    console.log('playing move function cunt')

    // move = [original piece, moving to y, moving to x, taken piece, moving from x, moving from y] WHAT THE FUCK>? (this comes from generate random legal move)
    
    // IF CASTLING: move = [castle, castle to x, castle to y, king, castle from x, castle from y]

    console.log(move[3])
    if (move[3] != null){
        
        if (move[3].identifier == 1 || move[3].identifier == 17){ // taken piece is king, this only happens during castling.
            console.log('castle bo')
            // move the castle.
            move[0].x = move[2]
            move[0].first_turn = false

            // move the king
            move[3].first_turn = false
            var increment = 0
            if (game_board.orientation == 'black'){
                increment = -1
            }
            if (move[2] == 3 + increment){
                move[3].x = 2 + increment
            }
            if (move[2] == 5 + increment){
                move[3].x = 6 + increment
            }

            console.log(`castle x: ${move[0].x}`)
            console.log(`king x: ${move[3].x}`)
        }
        else{
            move[0].y = move[1]
            move[0].x = move[2]
            move[0].first_turn = false
            if (move[0].type == 'pawn'){
                move[0].check_queening()
            }
            if (move[3] != null){
                console.log("DIE!")
                move[3].alive = false
            }
        }
    }

    else{
        move[0].y = move[1]
        move[0].x = move[2]
        move[0].first_turn = false
        if (move[0].type == 'pawn'){
            move[0].check_queening()
        }
        if (move[3] != null){
            move[3].alive = false
        }
    }
    
    
    
}

// what logic do you need to make a good chess game?

/*
1. check if in check mate. Already done - get legal moves, check for check, check game finished functions.

nested check mates - can you get a forced check mate in three moves if each move delivers only one option?
-- replace check game finished function with check if only one legal move function.

*/

function check_if_one_forced_move(moves){
    if (moves.length == 1){
        return true
    }
}

function convert_move(moves){
    var move = [moves[0], moves[1], moves[2], moves[3], moves[0].x, moves[0].y]
    return move
}

function simulate_move(move){ // very similar to play_move, but it has to save and return the original location of the pieces.
    // move = [original piece, moving to y, moving to x, taken piece, moving from x, moving from y]
    // IF CASTLING: move = [castle, castle to x, castle to y, king, castle from x, castle from y]

    //something is wrong with this function or how it is applied - castling console.logs show up when they shouldn't

    if (move[3] != null){
        if (move[3].identifier == 1 || move[3].identifier == 17){ // taken piece is king, this only happens during castling.

            // move the castle.
            move[0].x = move[2]
            move[0].first_turn = false

            // move the king
            move[3].first_turn = false
            var increment = 0
            if (game_board.orientation == 'black'){
                increment = -1
            }
            if (move[2] == 3 + increment){
                move[3].x = 2 + increment
            }
            if (move[2] == 5 + increment){
                move[3].x = 6 + increment
            }

            console.log('\n')
            console.log(`${move[0].colour}, ${move[0].type}`)
            console.log(`${move[3].colour}, ${move[3].type}`)
            console.log(`original x: ${move[0].x}`)
            console.log(`taken x: ${move[3].x}`)
        }
        else{
            move[0].y = move[1]
            move[0].x = move[2]
            move[0].first_turn = false
            if (move[0].type == 'pawn'){
                move[0].check_queening()
            }
            if (move[3] != null){
                move[3].alive = false
            }
        }
    }

    else{
        move[0].y = move[1]
        move[0].x = move[2]
        move[0].first_turn = false
        if (move[0].type == 'pawn'){
            move[0].check_queening()
        }
        if (move[3] != null){
            move[3].alive = false
        }
    }

}


class engine{
    constructor(){
        this.max_depth = 9
        this.depth = undefined
        this.depth_count = 0
        this.original_board = [] // it cannot reference the game_board, in case that gets flipped during processing time and fucks it up
        this.saved_depth_1 = []
        this.saved_depth_2 = []
        this.saved_depth_3 = []
        this.saved_depth_4 = []
        this.saved_depth_5 = []
        this.saved_depth_6 = []
        this.saved_depth_7 = []
        this.saved_depth_8 = []
        this.saved_depth_9 = []
    }

    reorientation(){ // everything will be calculated from white's perspective. 
        
        var increment = 0
        var multiplier = -1
        if (this.orientation == 'black'){
            increment = 7
            multiplier = 1
        }
        all_pieces.forEach(piece => {
            piece.x = increment - (multiplier * piece.x)
            piece.y = increment - (multiplier * piece.y)
        })
    }

    save_original_board(){
        var increment = 0
        var multiplier = -1
        if (this.orientation == 'black'){
            increment = 7
            multiplier = 1
        }

        // at index 0 is the current move (i.e. the current board_array)
        var alive_pieces = []
        var dead_pieces = []

        all_pieces.forEach(piece => {
            if (piece.alive == true){
                alive_pieces.unshift(piece, increment - (multiplier * piece.x), increment - (multiplier * piece.y), piece.first_turn, piece.type, piece.ranking)
            }
            if (piece.alive == false){
                dead_pieces.unshift(piece)
            }

        })

        this.original_board = [alive_pieces, dead_pieces]
    }

    convert_move(moves){
        var move = [moves[0], moves[1], moves[2], moves[3], moves[0].x, moves[0].y]
        return move
    }


    save_depth(number){ // it's all from white's orientation, don't worry about flipping.
        
        var alive_pieces = []
        var dead_pieces = []

        all_pieces.forEach(piece => {
            if (piece.alive == true){
                alive_pieces.unshift(piece, piece.x, piece.y, piece.first_turn, piece.type, piece.ranking)
            }
            if (piece.alive == false){
                dead_pieces.unshift(piece)
            }

        })
        if (number == 1){
            this.saved_depth_1 = [alive_pieces, dead_pieces]
        }
        if (number == 2){
            this.saved_depth_2 = [alive_pieces, dead_pieces]
        }
        if (number == 3){
            this.saved_depth_3 = [alive_pieces, dead_pieces]
        }
        if (number == 4){
            this.saved_depth_4 = [alive_pieces, dead_pieces]
        }
        if (number == 5){
            this.saved_depth_5 = [alive_pieces, dead_pieces]
        }
        if (number == 6){
            this.saved_depth_6 = [alive_pieces, dead_pieces]
        }
        if (number == 7){
            this.saved_depth_7 = [alive_pieces, dead_pieces]
        }
        if (number == 8){
            this.saved_depth_8 = [alive_pieces, dead_pieces]
        }
        if (number == 9){
            this.saved_depth_9 = [alive_pieces, dead_pieces]
        }
    }

    change_depth_move(number){
        if (number == 1){
            for (let i=0; i<this.saved_depth_1[0].length / 6; i++){
                this.saved_depth_1[0][(i * 6)].alive = true
                this.saved_depth_1[0][(i * 6)].x = this.saved_depth_1[0][(i * 6) + 1]
                this.saved_depth_1[0][(i * 6)].y = this.saved_depth_1[0][(i * 6) + 2]
                this.saved_depth_1[0][(i * 6)].first_turn = this.saved_depth_1[0][(i * 6) + 3]
                this.saved_depth_1[0][(i * 6)].type = this.saved_depth_1[0][(i * 6) + 4]
                this.saved_depth_1[0][(i * 6)].ranking = this.saved_depth_1[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_1[1].length; i++){
                this.saved_depth_1[1][i].alive = false
            }
        }
        if (number == 2){
            for (let i=0; i<this.saved_depth_2[0].length / 6; i++){
                this.saved_depth_2[0][(i * 6)].alive = true
                this.saved_depth_2[0][(i * 6)].x = this.saved_depth_2[0][(i * 6) + 1]
                this.saved_depth_2[0][(i * 6)].y = this.saved_depth_2[0][(i * 6) + 2]
                this.saved_depth_2[0][(i * 6)].first_turn = this.saved_depth_2[0][(i * 6) + 3]
                this.saved_depth_2[0][(i * 6)].type = this.saved_depth_2[0][(i * 6) + 4]
                this.saved_depth_2[0][(i * 6)].ranking = this.saved_depth_2[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_2[1].length; i++){
                this.saved_depth_2[1][i].alive = false
            }
        }
        if (number == 3){
            for (let i=0; i<this.saved_depth_3[0].length / 6; i++){
                this.saved_depth_3[0][(i * 6)].alive = true
                this.saved_depth_3[0][(i * 6)].x = this.saved_depth_3[0][(i * 6) + 1]
                this.saved_depth_3[0][(i * 6)].y = this.saved_depth_3[0][(i * 6) + 2]
                this.saved_depth_3[0][(i * 6)].first_turn = this.saved_depth_3[0][(i * 6) + 3]
                this.saved_depth_3[0][(i * 6)].type = this.saved_depth_3[0][(i * 6) + 4]
                this.saved_depth_3[0][(i * 6)].ranking = this.saved_depth_3[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_3[1].length; i++){
                this.saved_depth_3[1][i].alive = false
            }
        }
        if (number == 4){
            for (let i=0; i<this.saved_depth_4[0].length / 6; i++){
                this.saved_depth_4[0][(i * 6)].alive = true
                this.saved_depth_4[0][(i * 6)].x = this.saved_depth_4[0][(i * 6) + 1]
                this.saved_depth_4[0][(i * 6)].y = this.saved_depth_4[0][(i * 6) + 2]
                this.saved_depth_4[0][(i * 6)].first_turn = this.saved_depth_4[0][(i * 6) + 3]
                this.saved_depth_4[0][(i * 6)].type = this.saved_depth_4[0][(i * 6) + 4]
                this.saved_depth_4[0][(i * 6)].ranking = this.saved_depth_4[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_4[1].length; i++){
                this.saved_depth_4[1][i].alive = false
            }
        }
        if (number == 5){
            for (let i=0; i<this.saved_depth_5[0].length / 6; i++){
                this.saved_depth_5[0][(i * 6)].alive = true
                this.saved_depth_5[0][(i * 6)].x = this.saved_depth_5[0][(i * 6) + 1]
                this.saved_depth_5[0][(i * 6)].y = this.saved_depth_5[0][(i * 6) + 2]
                this.saved_depth_5[0][(i * 6)].first_turn = this.saved_depth_5[0][(i * 6) + 3]
                this.saved_depth_5[0][(i * 6)].type = this.saved_depth_5[0][(i * 6) + 4]
                this.saved_depth_5[0][(i * 6)].ranking = this.saved_depth_5[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_5[1].length; i++){
                this.saved_depth_5[1][i].alive = false
            }
        }
        if (number == 6){
            for (let i=0; i<this.saved_depth_6[0].length / 6; i++){
                this.saved_depth_6[0][(i * 6)].alive = true
                this.saved_depth_6[0][(i * 6)].x = this.saved_depth_6[0][(i * 6) + 1]
                this.saved_depth_6[0][(i * 6)].y = this.saved_depth_6[0][(i * 6) + 2]
                this.saved_depth_6[0][(i * 6)].first_turn = this.saved_depth_6[0][(i * 6) + 3]
                this.saved_depth_6[0][(i * 6)].type = this.saved_depth_6[0][(i * 6) + 4]
                this.saved_depth_6[0][(i * 6)].ranking = this.saved_depth_6[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_6[1].length; i++){
                this.saved_depth_6[1][i].alive = false
            }
        }
        if (number == 7){
            for (let i=0; i<this.saved_depth_7[0].length / 6; i++){
                this.saved_depth_7[0][(i * 6)].alive = true
                this.saved_depth_7[0][(i * 6)].x = this.saved_depth_7[0][(i * 6) + 1]
                this.saved_depth_7[0][(i * 6)].y = this.saved_depth_7[0][(i * 6) + 2]
                this.saved_depth_7[0][(i * 6)].first_turn = this.saved_depth_7[0][(i * 6) + 3]
                this.saved_depth_7[0][(i * 6)].type = this.saved_depth_7[0][(i * 6) + 4]
                this.saved_depth_7[0][(i * 6)].ranking = this.saved_depth_7[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_7[1].length; i++){
                this.saved_depth_7[1][i].alive = false
            }
        }
        if (number == 8){
            for (let i=0; i<this.saved_depth_8[0].length / 6; i++){
                this.saved_depth_8[0][(i * 6)].alive = true
                this.saved_depth_8[0][(i * 6)].x = this.saved_depth_8[0][(i * 6) + 1]
                this.saved_depth_8[0][(i * 6)].y = this.saved_depth_8[0][(i * 6) + 2]
                this.saved_depth_8[0][(i * 6)].first_turn = this.saved_depth_8[0][(i * 6) + 3]
                this.saved_depth_8[0][(i * 6)].type = this.saved_depth_8[0][(i * 6) + 4]
                this.saved_depth_8[0][(i * 6)].ranking = this.saved_depth_8[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_8[1].length; i++){
                this.saved_depth_8[1][i].alive = false
            }
        }
        if (number == 9){
            for (let i=0; i<this.saved_depth_9[0].length / 6; i++){
                this.saved_depth_9[0][(i * 6)].alive = true
                this.saved_depth_9[0][(i * 6)].x = this.saved_depth_9[0][(i * 6) + 1]
                this.saved_depth_9[0][(i * 6)].y = this.saved_depth_9[0][(i * 6) + 2]
                this.saved_depth_9[0][(i * 6)].first_turn = this.saved_depth_9[0][(i * 6) + 3]
                this.saved_depth_9[0][(i * 6)].type = this.saved_depth_9[0][(i * 6) + 4]
                this.saved_depth_9[0][(i * 6)].ranking = this.saved_depth_9[0][(i * 6) + 5]
            }
            for (let i = 0; i<this.saved_depth_9[1].length; i++){
                this.saved_depth_9[1][i].alive = false
            }
        }
        game_board.clear_array()
        
    }

    get_all_indexes(array, value){
        var indexes = []
        for (let i=0; i<array.length; i++){
            if (array[i] == value){
                indexes.push(i)
            }
        }
        return indexes
    }

    evaluate(move, turn, previous_piece_moved, number, branching_factor){ // a single possible move is passed in. evaluate it.

        if (turn == 'white'){
            var opponent = 'black'
        }
    
        if (turn == 'black'){
            var opponent = 'white'
        }

        if (branching_factor == 1){
            this.depth = 6
        }

        if (branching_factor == 2){
            this.depth = 4
        }

        if (branching_factor == 3){
            this.depth = 2
        }

        if (number + 1 > this.depth){
            return 0
        }
        // The possible move needs to be simulated. 
        play_move(move)
        game_board.clear_array()
    
        // See if this move delivers a checkmate
        var opp_moves = get_legal_moves(opponent, previous_piece_moved)
        var in_check = check_for_check(opponent, previous_piece_moved)

        if (in_check == true && opp_moves.length == 0){            
            return 1000
        }

        else if (in_check == false && opp_moves.length == 0){
            return 0
        }

        // Threading (change branching factor if needed) FUCK YES
        else if (opp_moves.length <= branching_factor * 4){

            number ++
            var certain = true

            // loop through all of the opponent's moves (there will be as many moves as the branching factor)
            for (let i=0; i<opp_moves.length / 4; i++){


                play_move([opp_moves[i * 4], opp_moves[(i * 4) + 1], opp_moves[(i * 4) + 2], opp_moves[(i * 4) + 3]])
                game_board.clear_array()
                this.save_depth(number)

                var own_moves = get_legal_moves(turn, opp_moves[i * 4])
                var m
                var possible_response = false

                // loop through all own moves in response.
                for (let x=0; x<own_moves.length / 4; x++){
                    this.change_depth_move(number)
                    m = [own_moves[x * 4], own_moves[(x * 4) + 1], own_moves[(x * 4) + 2], own_moves[(x * 4) + 3]]
                    var move_value = this.evaluate(m, turn, m[0], number, branching_factor) //m[0] is wrong

                    // if any of the moves are NOT check mates, certain is false
                    if (move_value >= 1000 - this.depth){
                        //console.log('returning here')
                        //return 1000 - number
                        possible_response = true
                    }
                }

                if (possible_response == false){
                    certain = false
                }
            }

            if (certain == true){
                console.log('returning with certainty!')
                return 1000 - number
            }
        }

        return 0
    }

    computer_program_turn(turn, previous_piece_moved){ // get all your own legal moves.

        this.reset()
    
        var moves = get_legal_moves(turn, previous_piece_moved) // all your own legal moves
        // get legal moves returns 4 (original piece, moving to x, moving to y, taken)
    
        var m
        var all_move_values = []
        for (let i=0; i<moves.length / 4; i++){
            //need to go back to sequence[0] to reverse the simulation of the move in the evaluation.
            game_board.change_move(0)
            game_board.clear_array()
        
            //evaluate each move.
            m = [moves[i * 4], moves[(i * 4) + 1], moves[(i * 4) + 2], moves[(i * 4) + 3]]
            var move_value = this.evaluate(m, turn, moves[i * 4], 0, 1) // PREVIOUS_PIECE_MOVED WILL NEED TO BE CHANGED TO YOUR OWN PIECE WHICH WAS HYPOTHETICALLY MOVED

            all_move_values.push(move_value)
        }
    
        // Get the move(s) with the highest value.
        var max_value = Math.max(...all_move_values)
        var indexes = this.get_all_indexes(all_move_values, max_value)
    
    
        var best_moves = []
        indexes.forEach(i => {
            best_moves.push(moves[i * 4])
            best_moves.push(moves[(i * 4) + 1])
            best_moves.push(moves[(i * 4) + 2])
            best_moves.push(moves[(i * 4) + 3])
        })
    
        var final_move = generate_random_legal_move(best_moves)
        game_board.change_move(0)
    
        return final_move
    
    }

    reset(){
        this.saved_depth_1 = []
        this.saved_depth_2 = []
        this.saved_depth_3 = []
        this.saved_depth_4 = []
        this.saved_depth_5 = []
        this.saved_depth_6 = []
        this.saved_depth_7 = []
    }
}





export var computer_engine = new engine()


