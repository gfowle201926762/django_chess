
import { all_pieces, black_pieces, white_pieces, white_king, black_king, board_array } from './piece_class_yolob.js'

import { check_for_check } from './game_yolob.js'

import { channel_player } from './player.js'

import { opp_alias, own_alias } from './script_yolob.js'

const board = document.getElementById("board")

export class Board{

    constructor(orientation){
        this.original_x = null
        this.original_y = null
        this.new_x = null
        this.new_y = null
        this.taken = null
        this.orientation = orientation
        this.sequence = []
        this.no_of_plys = 0
        this.move = 0
        for (let x=1; x<9; x++){
            for (let y=1; y<9; y++){
                const board_element = document.createElement("div")
                board_element.style.gridColumnStart = x
                board_element.style.gridRowStart = y
                board.appendChild(board_element)
                if ((x % 2 == 0 && y % 2 == 0) || (x % 2 != 0 && y % 2 != 0)){
                    board_element.classList.add("lightsquare")
                }
                else{
                    board_element.classList.add("darksquare")
                }
            }
        }
    }

    draw_pieces(original_x, original_y, new_x, new_y, taken){
        this.remove_elements()

        if (original_x != undefined){
            this.draw_tracking_squares(original_x, original_y, new_x, new_y, taken)
        }
        
        all_pieces.forEach(item => {
            if (item.alive == true){
                item.draw() // create backing and the piece image.
                item.update_array()
                
            }
        })
    }

    remove_taken_pieces(){
        all_pieces.forEach(item => {
            const small_image = document.getElementById(`small_image_${item.identifier}`)
            if (small_image != null){
                small_image.remove()
            }
            const divs = document.getElementById(`${item.colour}_${item.type}_div`)
            if (divs != null){
                divs.remove()
            }
        })
    }

    draw_taken_pieces(){
        
        this.remove_taken_pieces()

        const top_take_board = document.getElementById('top_take_board')
        const bottom_take_board = document.getElementById('bottom_take_board')

        all_pieces.forEach(item => {
            if (item.alive == false){
                
                if (document.getElementById(`${item.colour}_${item.type}_div`) == null){

                    const image_type_div = document.createElement('div')
                    image_type_div.setAttribute('id', `${item.colour}_${item.type}_div`)
                    image_type_div.classList.add('taken_piece_wrapper')
                    
                    if ((this.orientation == 'white' && item.colour == 'white') || (this.orientation == 'black' && item.colour == 'black')){
                        top_take_board.append(image_type_div)
                    }

                    else if ((this.orientation == 'white' && item.colour == 'black') || (this.orientation == 'black' && item.colour == 'white')){
                        bottom_take_board.append(image_type_div)
                    }
                }

                const image = document.createElement('img')
                image.setAttribute('id', `small_image_${item.identifier}`)
                image.src = `/static/main/images/pieces/${item.colour}_${item.type}.png`

                if (item.type == 'pawn'){
                    image.classList.add('small_pawn_image')
                }
                else{
                    image.classList.add('small_image')
                }
                
                const taken_container = document.getElementById(`${item.colour}_${item.type}_div`)
                taken_container.appendChild(image)
            }

        })
    }

    remove_elements(){
        var elements = board.getElementsByClassName('piece')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
        var elements = board.getElementsByClassName('backing')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
    }

    remove_traking_squares(){
        var elements = board.getElementsByClassName('original_square')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }

        var elements = board.getElementsByClassName('new_taken_square')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }

        var elements = board.getElementsByClassName('new_free_square')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
    }

    remove_options(){
        var elements = board.getElementsByClassName('optional')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
        var elements = board.getElementsByClassName('takeable')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
        var elements = board.getElementsByClassName('castleable')
        while (elements[0]){
            elements[0].parentNode.removeChild(elements[0])
        }
        
    }

    clear_array(){
        for (let row=0; row<8; row++){
            for (let col=0; col<8; col++){
                board_array[row][col] = 0
            }
        }
        all_pieces.forEach(item => {
            if (item.alive == true){
                item.update_array()
            }
        })
    }

    check_for_check_draw(item, turn, previous_piece_moved){
        if (turn == 'white'){
            var pieces = black_pieces
            var king = white_king
            var king_check = 101
            if (game_board.orientation == 'white'){
                var castle_row = 7
            }
            if (game_board.orientation == 'black'){
                var castle_row = 0
            }
            var castle_value = 201
        }
        if (turn == 'black'){
            var pieces = white_pieces
            var king = black_king
            var king_check = 117
            if (game_board.orientation == 'white'){
                var castle_row = 0
            }
            if (game_board.orientation == 'black'){
                var castle_row = 7
            }
            var castle_value = 217
        }
        
        var saved_y = item.y
        var saved_x = item.x
        var taken_pieces = []
    
        for (let row = 0; row<8; row++){
            for (let col=0; col<8; col++){
    
                var taken_piece = null
                var saved_take_x = null
                var saved_take_y = null
    
                if (board_array[row][col] >= 101 && board_array[row][col] <= 132){
                    all_pieces.forEach(piece => {
                        if (piece.alive == true && piece.identifier == board_array[row][col] - 100){ // temporarily eliminate taken piece
                            taken_piece = piece
                            saved_take_x = piece.x
                            saved_take_y = piece.y
                            taken_piece.alive = false
                        }
                    })
                }

                
    
                if (board_array[row][col] == -1 || (board_array[row][col] >= 101 && board_array[row][col] <= 132)){
                    item.y = row
                    item.x = col
                    this.clear_array() // item has now moved to new location. (or has it? lmao)
                    var checked = false
                    pieces.forEach(piece => {
                        if (piece.alive == true){
                            piece.move(previous_piece_moved)
                            if (board_array[king.y][king.x] == king_check){
                                checked = true
                            }
                            this.clear_array()
                        }
                    })
                    if (checked == false && taken_piece == null){
                        item.draw_options(col, row)
                    }
                    item.y = saved_y
                    item.x = saved_x
                    if (taken_piece != null){
                        taken_piece.x = saved_take_x
                        taken_piece.y = saved_take_y
                        taken_piece.alive = true
                    }
                    this.clear_array()
                    item.move(previous_piece_moved)
                    
                    if (checked == false && taken_piece != null){
                        item.draw_takeable(col, row, taken_piece)
                    }
    
                    if (checked == true && taken_piece != null){
                        taken_pieces.push(taken_piece)
                    }
                }

                if (board_array[row][col] == castle_value){
                    if (king.first_turn == true){
                        var in_check = check_for_check(turn, previous_piece_moved)
                        if (in_check == false){
                            var blocked = false
                            var increment = 0
                            if (game_board.orientation == 'black'){
                                increment = -1
                            }
                            if (item.x == 0){
                                pieces.forEach(opp_piece => {
                                    if (opp_piece.alive == true){
                                        this.clear_array()
                                        opp_piece.move(previous_piece_moved)
                                        if (board_array[castle_row][2 + increment] != 0 || board_array[castle_row][3 + increment] != 0){
                                            blocked = true
                                        }
                                    }
                                    
                                })
                            }
                            else if (item.x == 7){
                                pieces.forEach(opp_piece => {
                                    if (opp_piece.alive == true){
                                        this.clear_array()
                                        opp_piece.move(previous_piece_moved)
                                        if (board_array[castle_row][5 + increment] != 0 || board_array[castle_row][6 + increment] != 0){
                                            blocked = true
                                        }
                                    }
                                    
                                })
                            }

                            if (blocked == false){ //castling is possible!
                                king.draw_castleable()
                            }

                            this.clear_array()
                            item.move(previous_piece_moved)
                            
                        }
                    }
                }
            }
        }
    
        // remove takeable values in array where the take was illegal.
        taken_pieces.forEach(piece => {
            board_array[piece.y][piece.x] = piece.identifier // this will not clear an en passant move. Doesn't matter if we go optional.
        })
    }

    draw_tracking_squares(original_x, original_y, new_x, new_y, taken){

        this.original_x = original_x
        this.original_y = original_y
        this.new_x = new_x
        this.new_y = new_y
        this.taken = taken

        const original_square = document.createElement('div')
        original_square.classList.add('original_square')
        original_square.style.gridColumnStart = original_x + 1 
        original_square.style.gridRowStart = original_y + 1
        board.appendChild(original_square)

        if (taken == true){
            const new_taken_square = document.createElement('div')
            new_taken_square.classList.add('new_taken_square')
            new_taken_square.style.gridColumnStart = new_x + 1 
            new_taken_square.style.gridRowStart = new_y + 1
            board.appendChild(new_taken_square)
        }

        else if (taken == false){
            const new_free_square = document.createElement('div')
            new_free_square.classList.add('new_free_square')
            new_free_square.style.gridColumnStart = new_x + 1 
            new_free_square.style.gridRowStart = new_y + 1
            board.appendChild(new_free_square)
        }
    } 

    flip_board(flip){
        all_pieces.forEach(piece => {
            piece.flip()
        })
        if (this.original_x != null){ // flipping tracking squares
            this.remove_traking_squares()
            this.original_y = 7 - this.original_y
            this.original_x = 7 - this.original_x
            this.new_y = 7 - this.new_y
            this.new_x = 7 - this.new_x
            this.draw_tracking_squares(this.original_x, this.original_y, this.new_x, this.new_y, this.taken)
        }
        this.clear_array()
        this.draw_pieces()
        const top_player_info = document.getElementById('top_player_info')
        const bottom_player_info = document.getElementById('bottom_player_info')

        var own_self = `You: ${own_alias}`
        var opp_self = `Opponent: ${opp_alias}`

        if (channel_player.color == 'black'){
            own_self = `Opponent: ${opp_alias}`
            opp_self = `You: ${own_alias}`
        }

        if (flip != false){
            if (this.orientation == 'white'){
                top_player_info.innerHTML = own_self
                bottom_player_info.innerHTML = opp_self
                this.orientation = 'black'
            }
            else if (this.orientation == 'black'){
                top_player_info.innerHTML = opp_self
                bottom_player_info.innerHTML = own_self
                this.orientation = 'white'
            }
        }
        

        this.draw_taken_pieces()

        

        
    
        
    }

    update_sequence(original_x, original_y, new_x, new_y, taken){

        // if orientated to black, save it the other way up.
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
                alive_pieces.unshift(piece, increment - (multiplier * piece.x), increment - (multiplier * piece.y), piece.first_turn, piece.type, piece.ranking, piece.identifier)
            }
            if (piece.alive == false){
                dead_pieces.unshift(piece, piece.identifier)
            }

        })
        if (original_x != 'undefined'){
            this.sequence.unshift(alive_pieces, dead_pieces, increment - (multiplier * original_x), increment - (multiplier * original_y), increment - (multiplier * new_x), increment - (multiplier * new_y), taken)
        }

        if (original_x == 'undefined'){
            this.sequence.unshift(alive_pieces, dead_pieces, 'undefined', 'undefined', 'undefined', 'undefined', false)
        }
        
        this.no_of_plys = this.sequence.length / 7
    }

    reload_sequence(){

        for (let x=0; x<this.sequence.length / 7; x++){
            for (let i=0; i<(this.sequence[(x * 7)].length / 7); i++){
                all_pieces.forEach(piece => {
                    if (piece.identifier == this.sequence[(x * 7)][(i * 7) + 6]){
                        this.sequence[(x * 7)][(i * 7)] = piece
                    }
                })
            }
    
            for (let i=0; i<(this.sequence[(x * 7) + 1].length / 2); i++){
                all_pieces.forEach(piece => {
                    if (piece.identifier == this.sequence[(x * 7) + 1][(i * 2) + 1]){
                        this.sequence[(x * 7) + 1][(i * 2)] = piece
                    }
                })
            }
        }
    }

    change_move(direction){
        if (this.sequence.length > 0){
            this.move = direction

            var increment = 0
            var multiplier = -1
            if (this.orientation == 'black'){
                increment = 7
                multiplier = 1
            }
 
            
            for (let i=0; i<(this.sequence[(this.move * 7)].length / 7); i++){
                
                this.sequence[(this.move * 7)][i * 7].alive = true
                this.sequence[(this.move * 7)][i * 7].x = increment - (multiplier * this.sequence[(this.move * 7)][(i * 7) + 1])
                this.sequence[(this.move * 7)][i * 7].y = increment - (multiplier * this.sequence[(this.move * 7)][(i * 7) + 2])
                this.sequence[(this.move * 7)][i * 7].first_turn = this.sequence[(this.move * 7)][(i * 7) + 3]
                this.sequence[(this.move * 7)][i * 7].type = this.sequence[(this.move * 7)][(i * 7) + 4]
                this.sequence[(this.move * 7)][i * 7].ranking = this.sequence[(this.move * 7)][(i * 7) + 5]
            }

            // WHY IS THERE A PLUS ONE? because dead pieces are indexed at 1 you moron.
            for (let i=0; i<(this.sequence[(this.move * 7) + 1].length / 2); i++){
                this.sequence[(this.move * 7) + 1][i * 2].alive = false
            }

            // if the current orientation is black, draw the previous moves from black's perspective
            
            this.clear_array()
            this.remove_options()
            this.remove_traking_squares()
            this.draw_pieces(increment - (multiplier * this.sequence[(this.move * 7) + 2]), increment - (multiplier * this.sequence[(this.move * 7) + 3]), increment - (multiplier * this.sequence[(this.move * 7) + 4]), increment - (multiplier * this.sequence[(this.move * 7) + 5]), this.sequence[(this.move * 7) + 6])
            this.draw_taken_pieces()

        }
    }

}

export var game_board = new Board('white')