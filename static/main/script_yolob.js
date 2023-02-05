
console.log("HELLObum")

import { board_array, white_king, black_king, white_pieces, black_pieces, all_pieces} from './piece_class_yolob.js'
import { game_board } from './board_yolob.js'
import { get_legal_moves, check_for_check, generate_random_legal_move, play_move, computer_engine } from './game_yolob.js'
import { channel_player } from './player.js'


export var own_alias = JSON.parse(document.getElementById('player-alias').textContent)
export var opp_alias = null

var rematch = false


function please_wait(){
    if (document.getElementById('please_wait') == null){

        const board = document.getElementById('board')
        const please_wait = document.createElement('div')

        please_wait.setAttribute('id', 'please_wait')
        please_wait.style.gridColumnStart = 3
        please_wait.style.gridColumnEnd = 7
        please_wait.style.gridRowStart = 3
        please_wait.style.gridRowEnd = 5
        please_wait.classList.add('please_wait')
        board.appendChild(please_wait)

        please_wait.innerHTML = 'Waiting for opponent...'
    }
}

please_wait()




const notification_url = 'ws://' + window.location.host + '/ws/notifications/'
const notification_socket = new WebSocket(notification_url)

const self_profile_pk = 'dummy'
if (document.getElementById('self_profile_pk') != null){
    const self_profile_pk = JSON.parse(document.getElementById('self_profile_pk').textContent)
}

const count = JSON.parse(document.getElementById('count').textContent)
if (count > 0){
    const notification_count = document.getElementById('notification_count')
    notification_count.style.display = 'block'
    notification_count.classList.add('notification_count')
}

notification_socket.onmessage = function(event){

    const data = JSON.parse(event.data)

    if (data.type == 'first_connection'){
        notification_socket.send(JSON.stringify({
            'type': 'connecting_room',
            'message': self_profile_pk
        }))
    }

    if (data.type == 'notification_sent'){
        const notification_count = document.getElementById('notification_count')
        notification_count.innerHTML = data.count
        notification_count.style.display = 'block'
        notification_count.classList.add('notification_count')
    }
}







const board = document.getElementById('board')



var turn = 'white'
var last_clicked_id = null

var white_player = null
var black_player = null
var end_game = true
var previoustime = 0
var result = null
var menu_down = false
var computer_type = 'program'
var navigating = false
var pause = false
var previous_piece_moved = null

var opponent_type = 'human'



 
const chess_room_name = JSON.parse(document.getElementById('chess-room-name').textContent)

var async_socket = '/ws/chess_room/'


if (chess_room_name.length > 9){
    if (chess_room_name.slice(0, 8) == 'computer'){
        async_socket = '/ws/computer_room/'
        opponent_type = 'computer'
    }
}



const url = 'ws://' + window.location.host + async_socket + chess_room_name + '/'
const chess_room_socket = new WebSocket(url)

chess_room_socket.onclose = function(event){
    handle_close_option_screen()
    result = 'connection failed'
    end_game = true
    game_finished(result, true)
}




chess_room_socket.onmessage = function(event){
    const data = JSON.parse(event.data)
    var message = data.message


    if (data.type == 'play_move'){
        if (message != null){
            game_board.change_move(0)
            all_pieces.forEach(piece => {
                if (piece.identifier == message[0]){
                    message[0] = piece
                }
                if (piece.identifier == message[3]){
                    message[3] = piece
                }
            })
            message = reorientation(message)

            computer_turn('receiving', message)
        }        
    }


    if (data.type == 'start_game'){
        const please_wait = document.getElementById('please_wait')
        if (please_wait != null){
            please_wait.remove()
        }
        
        rematch = false

        //send your alias
        const own_alias = JSON.parse(document.getElementById('player-alias').textContent)
        chess_room_socket.send(JSON.stringify({
            'type': 'alias',
            'message': own_alias,
            'own_color': message
        }))

        channel_player.color = message
        game_board.orientation = message

        if (message == 'white'){
            white_player = 'human'
            black_player = 'human'
            //black_player = data.opponent_type
        }
        if (message == 'black'){
            black_player = 'human'
            white_player = 'human'
            //white_player = data.opponent_type
        }
        

    }

    if (data.type == 'move_demanded'){
        send_move()
    }

    if (data.type == 'game_aborted'){
        if (end_game == false){
            handle_close_option_screen()
            result = 'game aborted'
            end_game = true
            game_finished(result)
        }
    }

    if (data.type == 'alias'){
        opp_alias = message
        initialise()
        start_game(false, true)
    }

    if (data.type == 'rematch_request'){
        const rematch_button = document.getElementById('rematch')
        rematch_button.innerHTML = `${opp_alias} has challenged you to a rematch!`
        rematch_button.style.fontSize = '.7rem'
        rematch = true
    }

    if (data.type == 'redirect'){
        window.location.pathname = data.message
    }

    if (data.type == 'refresh_sequence'){
        const please_wait = document.getElementById('please_wait')
        please_wait.remove()

        initialise(true)
        game_board.sequence = data.message
        game_board.no_of_plys = game_board.sequence.length / 7
        game_board.reload_sequence()
        
        last_clicked_id = null
        end_game = data.end_game
        previoustime = 0
        result = data.result
        pause = false
        navigating = false
        previous_piece_moved = data.previous_move
        white_player = 'human'
        black_player = 'human'

    }

    if (data.type == 'define_color'){
        channel_player.color = data.color
        game_board.orientation = data.color
        turn = data.turn

        if (game_board.orientation == 'black'){
            all_pieces.forEach(piece => {
                piece.flip()
            })
        }

        game_board.change_move(0)

        if (end_game == true){
            game_finished(result)
        }
    }

    if (data.type == 'refresh_alias'){
        opp_alias = data.opp_alias
        const top_player_info = document.getElementById('top_player_info')
        top_player_info.innerHTML = `Opponent: ${opp_alias}`

        chess_room_socket.send(JSON.stringify({
            'type': 'update_own_alias',
            'message': own_alias
        }))
        
    }

    if (data.type == 'rejected_play'){
        const please_wait = document.getElementById('please_wait')
        if (please_wait != null){
            please_wait.remove()
        }
        handle_close_option_screen()
        result = data.message
        end_game = true
        game_finished(result, true)
        
    }
    
}



function handle_rematch(event){

    if (rematch == false){
        chess_room_socket.send(JSON.stringify({
            'type': 'rematch',
            'message': channel_player.color
        }))
        rematch = true
        handle_close_end_screen()
        please_wait()
    }

    else if (rematch == true){
        chess_room_socket.send(JSON.stringify({
            'type': 'rematch_accepted',
            'message': channel_player.color
        }))
        rematch = false
        handle_close_end_screen()
        please_wait()
    }
    
}

function reorientation(message){

    var increment = 0
    var multiplier = -1
    if (game_board.orientation == 'black'){
        increment = 7
        multiplier = 1
    }

    message[1] = increment - (multiplier * message[1])
    message[2] = increment - (multiplier * message[2])
    message[4] = increment - (multiplier * message[4])
    message[5] = increment - (multiplier * message[5])

    return message
}
 
function send_move(message){
    if (opponent_type == 'computer'){
        var new_color = 'white'
        if (channel_player.color == 'white'){
            new_color = 'black'
        }

        var alive_pieces = []
        for(let i=0; i<game_board.sequence[0].length / 7; i++){
            var piece_information = game_board.sequence[0].slice(((i * 7) + 1), ((i * 7) + 7))
            alive_pieces = alive_pieces.concat(piece_information)
        }

        var dead_pieces = []
        for(let i=0; i<game_board.sequence[1].length / 2; i++){
            var piece_information = game_board.sequence[1].slice(((i * 2) + 1), ((i * 2) + 2))
            dead_pieces = dead_pieces.concat(piece_information)
        } 

        var ppm = null
        if (previous_piece_moved != null){
            ppm = previous_piece_moved.identifier
        }

        const sending_pieces = {
            'alive_pieces': alive_pieces,
            'dead_pieces': dead_pieces,
            'previous_piece_moved': ppm
        }

        chess_room_socket.send(JSON.stringify({
            'type': 'move',
            'message': 'message',
            'player': new_color,
            'pieces': sending_pieces,
        }))
    }


    if (opponent_type == 'human'){
        message = reorientation(message)
        chess_room_socket.send(JSON.stringify({
            'type': 'move',
            'message': message
        }))
    }
    
}

function send_sequence(sequence){
    chess_room_socket.send(JSON.stringify({
        'type': 'update_sequence',
        'message': sequence, // always oriented for white
        'previous_piece_moved': previous_piece_moved,
        'end_game': end_game,
        'result': result
    }))
}

function arrows(){
    const end_screen = document.getElementById('end_screen')
    if (end_screen != null){
        end_screen.remove()
    }
    const menu_screen = document.getElementById('drop_down')
    if (menu_screen != null){
        menu_screen.remove()
        menu_down = false
    }
    if (game_board.move == 0){
        navigating = false
    }
    if (game_board.move > 0){
        navigating = true
    }
}

function handle_start_arrow(){
    if (game_board.no_of_plys > 0){
        game_board.change_move(game_board.no_of_plys - 1)
        arrows()
    }
}

function handle_end_arrow(){
    if (game_board.no_of_plys > 0){
        game_board.change_move(0)
        arrows()
    }
    
}

function handle_back_arrow(){
    if (game_board.no_of_plys - 1 > game_board.move){
        game_board.change_move(game_board.move + 1)
        arrows()
    }
}

function handle_forward_arrow(){
    if (game_board.move > 0){
        game_board.change_move(game_board.move - 1)
        arrows()
    }
}

function handle_pause_game(event){
    const pause_button = document.getElementById('pause_button')
    if (pause == false){
        pause = true
        pause_button.innerHTML = 'Resume'
    }
    else if (pause == true){
        pause = false
        pause_button.innerHTML = 'Pause'
    }
}

function handle_abort_game(){
    handle_close_option_screen()
    result = 'game aborted'
    end_game = true
    game_finished(result)
    chess_room_socket.send(JSON.stringify({
        'type': 'aborted',
        'message': 'dummy'
    }))
    // need confirmation that the abortion has been completed.
}

function handle_close_end_screen(){
    const end_screen = document.getElementById('end_screen')
    end_screen.remove()
}

function handle_close_option_screen(){
    const drop_down = document.getElementById('drop_down')
    if (drop_down){
        drop_down.remove()
    }
    
    menu_down = false
} 

function handle_menu(event){

    const menu_button = event.target

    if (menu_down == true){
        handle_close_option_screen()
    }

    else if (menu_down == false){

        const drop_down = document.createElement('div')
        drop_down.setAttribute('id', 'drop_down')
        drop_down.classList.add('drop_down')
        drop_down.style.gridColumnStart = 3
        drop_down.style.gridColumnEnd = 7
        drop_down.style.gridRowStart = 2
        drop_down.style.gridRowEnd = 7
        board.appendChild(drop_down)

        const close_container = document.createElement('div')
        close_container.classList.add('close_container')
        drop_down.appendChild(close_container)

        const close_button = document.createElement('img')
        close_button.setAttribute('id', 'close_option_screen')
        close_button.src = '/static/main/images/buttons/cross.png'
        close_button.classList.add('close_end_screen')
        close_container.appendChild(close_button)
        close_button.addEventListener('click', handle_close_option_screen, {once: true})

        const button_container = document.createElement('div')
        button_container.classList.add('drop_down_container')
        drop_down.appendChild(button_container)

        const abort_button = document.createElement('div')
        abort_button.setAttribute('id', 'abort_button')
        abort_button.classList.add('drop_down_button')
        if (end_game == false){
            abort_button.innerHTML = 'Abort game'
        }
        if (end_game == true){
            abort_button.innerHTML = 'New game'
        }
        
        button_container.appendChild(abort_button)
        abort_button.addEventListener('click', handle_abort_game, {once: true})

        const pause_button = document.createElement('div')
        pause_button.setAttribute('id', 'pause_button')
        pause_button.classList.add('drop_down_button')
        if (pause == false){
            pause_button.innerHTML = 'Pause'
        }
        if (pause == true){
            pause_button.innerHTML = 'Resume'
        }
        button_container.appendChild(pause_button)
        pause_button.addEventListener('click', handle_pause_game)


        menu_down = true
    }

    

    
}

function handle_flip(){
    if (end_game == false){
        game_board.flip_board()
    }
    
}

function handle_play_again(event){
    window.location.pathname = '/lobby/'
}

function game_finished(result, disallowed){
    if (document.getElementById('end_screen') == null){

        const board = document.getElementById('board')
        const end_screen = document.createElement('div')

        end_screen.setAttribute('id', 'end_screen')
        end_screen.style.gridColumnStart = 3
        end_screen.style.gridColumnEnd = 7
        end_screen.style.gridRowStart = 2
        end_screen.style.gridRowEnd = 7
        end_screen.classList.add('end_screen')
        board.appendChild(end_screen)

        const close_container = document.createElement('div')
        close_container.classList.add('close_container')
        end_screen.appendChild(close_container)

        const close_button = document.createElement('img')
        close_button.setAttribute('id', 'close_end_screen')
        close_button.src = '/static/main/images/buttons/cross.png'
        close_button.classList.add('close_end_screen')
        close_container.appendChild(close_button)
        close_button.addEventListener('click', handle_close_end_screen, {once: true})

        const announcement = document.createElement('div')
        announcement.innerHTML = 'The game has ended!'
        announcement.classList.add('text_wrapper')
        end_screen.appendChild(announcement)

        const info = document.createElement('div')
        info.innerHTML = `${result}`
        info.classList.add('text_wrapper')
        end_screen.appendChild(info)

        if (disallowed != true){
            const rematch = document.createElement('div')
            rematch.setAttribute('id', 'rematch')
            rematch.innerHTML = 'Rematch'
            rematch.classList.add('text_wrapper')
            rematch.classList.add('play_again')
            end_screen.appendChild(rematch)
            rematch.addEventListener('click', handle_rematch, {once: true})
        }
        

        const play_again = document.createElement('div')
        play_again.innerHTML = "Back to lobby"
        play_again.classList.add('text_wrapper')
        play_again.classList.add('play_again')
        play_again.addEventListener('click', handle_play_again, {once: true})
        end_screen.appendChild(play_again)
    }

    
}

function computer_turn(computer_type, moves){
    if (computer_type == 'random'){
        var move = generate_random_legal_move(moves)
    }
    if (computer_type == 'program'){
        var move = computer_engine.computer_program_turn(turn, previous_piece_moved)
    }
    if (computer_type == 'receiving'){
        var move = moves
    }

    play_move(move)
    game_board.clear_array()
    game_board.remove_traking_squares()
    var taking = null
    var castling = false
    if (move[3] == null){
        taking = false
    }
    if (move[3] != null){
        if (move[3].type == 'king'){
            taking = false
            castling = true
            console.log('castling!')
        }
        else{
            taking = true
        }
    }
    var increment = 0
    if (game_board.orientation == 'black'){
        increment = -1
    }
    if (castling == true){
        console.log('CASTLING = TRUE')
        game_board.draw_pieces(4 + increment, move[3].y,  move[3].x, move[3].y, false)
        game_board.update_sequence(4 + increment, move[3].y,  move[3].x, move[3].y, false)
    }

    if (castling == false){
        game_board.draw_pieces(move[4], move[5], move[2], move[1], taking) // we need [4] and [5] because the [0] piece .x and .y have already changed to their new locations.
        game_board.update_sequence(move[4], move[5], move[2], move[1], taking)
    }

    previous_piece_moved = move[0]
    
    game_board.draw_taken_pieces()
    if (turn == 'white'){
        turn = 'black'
    }
    else if (turn == 'black'){
        turn = 'white'
    }

}

function check_game_finished(moves, in_check){

    if (moves.length == 0 && in_check == true){
        console.log(`${turn} is in checkmate!!`)
        if (turn == 'white'){
            result = 'black won by checkmate!'
        }
        if (turn == 'black'){
            result = 'white won by checkmate!'
        }
        end_game = true
    }

    if (moves.length == 0 && in_check == false){
        console.log(`stalemate! ${turn} cannot move`)
        result = 'stalemate'
        end_game = true
    }

    var count = 0
    all_pieces.forEach(item => {
        if (item.alive == true){
            count += 1
        }
    })
    if (count == 2){
        console.log('stalemate! Only two kings.')
        result = 'stalemate'
        end_game = true
    }

}

function handleloop(currentTime){

    var requestid = window.requestAnimationFrame(handleloop)
    var time_elapsed = (currentTime - previoustime) / 1000

    if (time_elapsed >= (1 / 5000)){

        var moves = get_legal_moves(turn, previous_piece_moved)
        var in_check = check_for_check(turn, previous_piece_moved)
        check_game_finished(moves, in_check)

        if (end_game == false && menu_down == false && navigating == false && pause == false){
            
            computer_turn(computer_type, moves)
        }

        else if (end_game == true){
            window.cancelAnimationFrame(requestid)
            game_finished(result)
        }

        previoustime = currentTime
    }
}

function handleclick(event){
    const piece = event.target
    if ((turn == channel_player.color) && end_game == false){
        
        if (turn == 'white'){
            var own_pieces = white_pieces
            var opp_pieces = black_pieces
            var own_upper_bound = 16
            var own_lower_bound = 1
            var opp_upper_bound = 32
            var opp_lower_bound = 17
            var opp_take_upper_bound = 132
            var opp_take_lower_bound = 117
            var next_turn = 'black'
            var castleable = 201
        }

        if (turn == 'black'){
            var own_pieces = black_pieces
            var opp_pieces = white_pieces
            var own_upper_bound = 32
            var own_lower_bound = 17
            var opp_upper_bound = 16
            var opp_lower_bound = 1
            var opp_take_upper_bound = 116
            var opp_take_lower_bound = 101
            var next_turn = 'white'
            var castleable = 217
        }

        if (end_game == false && menu_down == false && game_board.move == 0){

            if (piece.classList.contains('piece')){
                if (piece.id <= own_upper_bound && piece.id >= own_lower_bound){ //selecting own pieces
                    own_pieces.forEach(own_piece => {
                        if (piece.id == own_piece.identifier && piece.id == last_clicked_id && own_piece.alive == true){
                            game_board.remove_options()
                            game_board.clear_array()
                            game_board.draw_pieces()
                            last_clicked_id = null
                        }
                        else if (piece.id == own_piece.identifier){

                            if (board_array[own_piece.y][own_piece.x] == castleable){

                                var in_check = check_for_check(turn, previous_piece_moved)
                                var blocked = false

                                if (in_check == false){

                                    var increment = 0
                                    
                                    if (game_board.orientation == 'black'){
                                        increment = -1
                                    }
                                    var castle_piece = null
                                    own_pieces.forEach(castle => {

                                        if (castle.identifier == last_clicked_id){
                                            castle_piece = castle
                                            
                                            if (own_piece.first_turn == false || castle.first_turn == false){
                                                blocked = true
                                            }

                                            
                                            if (castle.x == 0){
                                                opp_pieces.forEach(opp_piece => {
                                                    if (opp_piece.alive == true){
                                                        game_board.clear_array()
                                                        opp_piece.move(previous_piece_moved)
                                                        if (board_array[castle.y][2 + increment] != 0 || board_array[castle.y][3 + increment] != 0){
                                                            blocked = true
                                                        }
                                                    }
                                                    
                                                })
                                                
                                            }
                                            if (castle.x == 7){
                                                
                                                opp_pieces.forEach(opp_piece => {
                                                    if (opp_piece.alive == true){
                                                        game_board.clear_array()
                                                        opp_piece.move(previous_piece_moved)
                                                        if (board_array[castle.y][5 + increment] != 0 || board_array[castle.y][6 + increment] != 0){
                                                            blocked = true
                                                        }
                                                    }
                                                    
                                                })
                                                
                                            }
                                            
                                        }
                                    })


                                    if (blocked == false){
                                        if (castle_piece.x == 0){
                                            castle_piece.x = 3 + increment
                                            original_x = own_piece.x
                                            own_piece.x = 2 + increment
                                        }
                                        if (castle_piece.x == 7){
                                            castle_piece.x = 5 + increment
                                            original_x = own_piece.x
                                            own_piece.x = 6 + increment
                                        }
                                        castle_piece.first_turn = false
                                        own_piece.first_turn = false
                                        
                                        
                                        game_board.remove_options()
                                        game_board.remove_traking_squares()
                                        game_board.clear_array()
                                        game_board.draw_pieces(4 + increment, own_piece.y, own_piece.x, own_piece.y, false)
                                        game_board.update_sequence(4 + increment, own_piece.y, own_piece.x, own_piece.y, false)
                                        last_clicked_id = null
                                        previous_piece_moved = own_piece
                                        
                                        message = [castle_piece.identifier, castle_piece.y, castle_piece.x, own_piece.identifier, own_piece.x, own_piece.y]
                                        send_move(message)
                                        send_sequence(game_board.sequence)

                                        turn = next_turn
                                        var moves = get_legal_moves(turn, previous_piece_moved)
                                        var in_check = check_for_check(turn, previous_piece_moved)
                                        check_game_finished(moves, in_check)

                                        if (end_game == true){
                                            game_finished(result)
                                        }
                                    }
                                    game_board.clear_array() // is this necessary?

                                    

                                    if (((turn == 'white' && white_player == 'computer') || (turn == 'black' && black_player == 'computer')) && end_game == false && blocked == false){
                                        computer_turn(computer_type, moves)
                                        
                                        var moves = get_legal_moves(turn, previous_piece_moved)
                                        var in_check = check_for_check(turn, previous_piece_moved)
                                        check_game_finished(moves, in_check)

                                        if (end_game == true){
                                            game_finished(result)
                                        }
                                    }
                                }


                                if (in_check == true || blocked == true){
                                    game_board.remove_options()
                                    game_board.clear_array()
                                    game_board.draw_pieces()
                                    own_piece.move(previous_piece_moved) // without image changing; just the array is updated
                                    game_board.check_for_check_draw(own_piece, turn, previous_piece_moved)
                                    // simulate all the moves defined in the array, and check if they are legal.
                                    last_clicked_id = piece.id
                                }
                                
                            }

                            else{
                                game_board.remove_options()
                                game_board.clear_array()
                                game_board.draw_pieces()
                                own_piece.move(previous_piece_moved) // without image changing; just the array is updated
                                game_board.check_for_check_draw(own_piece, turn, previous_piece_moved)
                                // simulate all the moves defined in the array, and check if they are legal.
                                last_clicked_id = piece.id
                            }
                        }
                    })
                }

                else if (piece.id >= opp_lower_bound && piece.id <= opp_upper_bound){ // selecting opposition piece
                    if (board_array[piece.style.gridRowStart - 1][piece.style.gridColumnStart - 1] >= opp_take_lower_bound && board_array[piece.style.gridRowStart - 1][piece.style.gridColumnStart - 1] <= opp_take_upper_bound){
                        //console.log('selecting opposition piece')
                        opp_pieces.forEach(item => {
                            if (item.alive == true && item.y == piece.style.gridRowStart - 1 && item.x == piece.style.gridColumnStart - 1){

                                var taken_x = item.x
                                var taken_y = item.y
                                var original_x = null
                                var original_y = null
                                var message

                                item.alive = false
                                own_pieces.forEach(own_piece => {
                                    if (own_piece.identifier == last_clicked_id){

                                        original_x = own_piece.x
                                        original_y = own_piece.y

                                        own_piece.x = item.x
                                        own_piece.y = item.y
                                        own_piece.first_turn = false
                                        previous_piece_moved = own_piece
                                        if (own_piece.type == 'pawn'){
                                            own_piece.check_queening()
                                        }

                                        message = [own_piece.identifier, own_piece.y, own_piece.x, item.identifier, original_x, original_y]

                                    }
                                })
                                game_board.remove_options()
                                game_board.remove_traking_squares()
                                game_board.clear_array()
                                game_board.draw_pieces(original_x, original_y, taken_x, taken_y, true)
                                game_board.update_sequence(original_x, original_y, taken_x, taken_y, true)
                                game_board.draw_taken_pieces()
                                
                                last_clicked_id = null

                                //send to the websocket
                                send_move(message)
                                send_sequence(game_board.sequence)
                                
                                turn = next_turn

                                //console.log("\n\n")
                                var moves = get_legal_moves(turn, previous_piece_moved)
                                var in_check = check_for_check(turn, previous_piece_moved)

                                check_game_finished(moves, in_check)
                                //console.log(moves)
                                //console.log(in_check)

                                if (end_game == true){
                                    game_finished(result)
                                }

                                else if (((turn == 'white' && white_player == 'computer') || (turn == 'black' && black_player == 'computer')) && end_game == false){
                                    
                                    computer_turn(computer_type, moves)
                                        
                                    var moves = get_legal_moves(turn, previous_piece_moved)
                                    var in_check = check_for_check(turn, previous_piece_moved)
                                    check_game_finished(moves, in_check)

                                    if (end_game == true){
                                        game_finished(result)
                                    }
                                }
                                
                            }
                        })

                        
                    }

                    

                    else{
                        game_board.remove_options()
                        game_board.clear_array()
                        last_clicked_id = null
                    }
                } 
            }

            else if (piece.classList.contains('optional')){
                // moving own piece to optional square
                var original_x = null
                var original_y = null
                var message = null
                own_pieces.forEach(item => {
                    if (item.identifier == last_clicked_id){
                        original_x = item.x
                        original_y = item.y
                        item.x = piece.style.gridColumnStart - 1
                        item.y = piece.style.gridRowStart - 1
                        item.first_turn = false
                        previous_piece_moved = item
                        if (item.type == 'pawn'){
                            item.check_queening()
                        }
                        message = [item.identifier, item.y, item.x, null, original_x, original_y]
                    }
                })
                turn = next_turn
                game_board.remove_options()
                game_board.remove_traking_squares()
                game_board.clear_array()
                game_board.draw_pieces(original_x, original_y, piece.style.gridColumnStart - 1, piece.style.gridRowStart - 1, false)
                game_board.update_sequence(original_x, original_y, piece.style.gridColumnStart - 1, piece.style.gridRowStart - 1, false)
                last_clicked_id = null


                var moves = get_legal_moves(turn, previous_piece_moved)
                var in_check = check_for_check(turn, previous_piece_moved)
                check_game_finished(moves, in_check)
                

                //send to the websocket
                send_move(message)
                send_sequence(game_board.sequence)
                

                

                if (end_game == true){
                    game_finished(result)
                }

                else if (((turn == 'white' && white_player == 'computer') || (turn == 'black' && black_player == 'computer')) && end_game == false){
                    computer_turn(computer_type, moves)

                    var moves = get_legal_moves(turn, previous_piece_moved)
                    var in_check = check_for_check(turn, previous_piece_moved)
                    check_game_finished(moves, in_check)

                    if (end_game == true){
                        game_finished(result)
                    }
                }
            }

            else if (piece.classList.contains('takeable')){ // selecting an en passant option.

                var own_piece = null
                var opp_piece = null

                var taken_x = null
                var taken_y = null
                var original_x = null
                var original_y = null
                var original_piece

                own_pieces.forEach(own_piece => {
                    if (own_piece.identifier == last_clicked_id){
                        original_piece = own_piece
                        original_x = own_piece.x
                        original_y = own_piece.y

                        own_piece.x = piece.style.gridColumnStart - 1
                        own_piece.y = piece.style.gridRowStart - 1
                        own_piece.first_turn = false
                        previous_piece_moved = own_piece
                        if (own_piece.type == 'pawn'){
                            own_piece.check_queening()
                        }
                    }
                })

                if ((turn == 'white' && game_board.orientation == 'white') || (turn == 'black' && game_board.orientation == 'black')){
                    var i = 1
                }

                if ((turn == "black" && game_board.orientation == 'white') || (turn == 'white' && game_board.orientation == 'black')){
                    var i = -1
                }  

                var col = piece.style.gridColumnStart - 1
                var row = piece.style.gridRowStart - 1 // the taken piece is + 1 (if going up); the taken piece is -1 (if going down)

                var message
                opp_pieces.forEach(opp_piece => {
                    if (opp_piece.alive == true && opp_piece.x == col && opp_piece.y == row + i){
                        opp_piece.alive = false
                        taken_x = opp_piece.x
                        taken_y = opp_piece.y - i
                        message = [original_piece.identifier, original_piece.y, original_piece.x, opp_piece.identifier, original_x, original_y]
                    }
                })
                
                game_board.remove_options()
                game_board.remove_traking_squares()
                game_board.clear_array()
                game_board.draw_pieces(original_x, original_y, taken_x, taken_y, true)
                game_board.update_sequence(original_x, original_y, taken_x, taken_y, true)
                game_board.draw_taken_pieces()

                //send to the websocket
                send_move(message)
                send_sequence(game_board.sequence)
                
                
                last_clicked_id = null
                
                turn = next_turn

                var moves = get_legal_moves(turn, previous_piece_moved)
                var in_check = check_for_check(turn, previous_piece_moved)

                check_game_finished(moves, in_check)


                if (end_game == true){
                    game_finished(result)
                }

                else if (((turn == 'white' && white_player == 'computer') || (turn == 'black' && black_player == 'computer')) && end_game == false){
                    computer_turn(computer_type, moves)

                    var moves = get_legal_moves(turn, previous_piece_moved)
                    var in_check = check_for_check(turn, previous_piece_moved)
                    check_game_finished(moves, in_check)

                    if (end_game == true){
                        game_finished(result)
                    }
                }
                
            }

            else{
                game_board.remove_options()
                game_board.clear_array()
                game_board.draw_pieces()
                last_clicked_id = null
            }
        }
    }
    
}

function initialise(refresh){


    if (refresh != true){
        game_board.remove_elements()
        game_board.remove_traking_squares()
        game_board.remove_taken_pieces()
        
        //white_player = null
        //black_player = null

        game_board.orientation = channel_player.color
        game_board.sequence = []
        game_board.no_of_plys = 0
        game_board.move = 0
    }
    
    

    if (document.getElementById('top_take_board') == null){
        const board_wrapper = document.getElementById('board_wrapper')
        
        // create top and bottom board wrapper
        const top_board_wrapper = document.createElement('div')
        top_board_wrapper.classList.add('above_below_board_wrapper')
        top_board_wrapper.setAttribute('id', 'top_board_wrapper')
        board_wrapper.insertBefore(top_board_wrapper, board_wrapper.firstChild)


        const bottom_board_wrapper = document.createElement('div')
        bottom_board_wrapper.classList.add('above_below_board_wrapper')
        bottom_board_wrapper.setAttribute('id', 'bottom_board_wrapper')
        board_wrapper.appendChild(bottom_board_wrapper)

        // creating top and bottom player wrappers
        const top_player_wrapper = document.createElement('div')
        top_player_wrapper.classList.add('player_wrapper')
        top_player_wrapper.setAttribute('id', 'top_player_wrapper')
        top_board_wrapper.appendChild(top_player_wrapper)

        const bottom_player_wrapper = document.createElement('div')
        bottom_player_wrapper.classList.add('player_wrapper')
        bottom_player_wrapper.setAttribute('id', 'bottom_player_wrapper')
        bottom_board_wrapper.appendChild(bottom_player_wrapper)

        // creating top and bottom player info containers
        const top_player_info = document.createElement('div')
        top_player_info.classList.add('player_info')
        top_player_info.setAttribute('id', 'top_player_info')
        top_player_info.innerHTML = `Opponent: ${opp_alias}`
        top_player_wrapper.appendChild(top_player_info)

        const bottom_player_info = document.createElement('div')
        bottom_player_info.classList.add('player_info')
        bottom_player_info.setAttribute('id', 'bottom_player_info')
        bottom_player_info.innerHTML = `You: ${own_alias}`
        bottom_player_wrapper.appendChild(bottom_player_info)

        // creating top and bottom takeboards
        const top_take_board = document.createElement('div')
        top_take_board.setAttribute('id', 'top_take_board')
        top_take_board.classList.add('take_board')
        top_player_wrapper.appendChild(top_take_board)

        const bottom_take_board = document.createElement('div')
        bottom_take_board.setAttribute('id', 'bottom_take_board')
        bottom_take_board.classList.add('take_board')
        bottom_player_wrapper.appendChild(bottom_take_board)

        // creating back / forward arrows to go in the bottom board wrapper.
        const start_arrow = document.createElement('img')
        start_arrow.setAttribute('id', 'start_arrow')
        start_arrow.classList.add('board_buttons')
        start_arrow.src = '/static/main/images/buttons/start-arrow.png'
        bottom_board_wrapper.appendChild(start_arrow)
        start_arrow.addEventListener('click', handle_start_arrow)

        const left_arrow = document.createElement('img')
        left_arrow.setAttribute('id', 'left_arrow')
        left_arrow.classList.add('board_buttons')
        left_arrow.src = '/static/main/images/buttons/left-arrow.png'
        bottom_board_wrapper.appendChild(left_arrow)
        left_arrow.addEventListener('click', handle_back_arrow)

        const right_arrow = document.createElement('img')
        right_arrow.setAttribute('id', 'right_arrow')
        right_arrow.classList.add('board_buttons')
        right_arrow.src = '/static/main/images/buttons/right-arrow.png'
        bottom_board_wrapper.appendChild(right_arrow)
        right_arrow.addEventListener('click', handle_forward_arrow)

        const end_arrow = document.createElement('img')
        end_arrow.setAttribute('id', 'end_arrow')
        end_arrow.classList.add('board_buttons')
        end_arrow.src = '/static/main/images/buttons/end-arrow.png'
        bottom_board_wrapper.appendChild(end_arrow)
        end_arrow.addEventListener('click', handle_end_arrow)

        

        

        // create buttons to go in the side menu (settings and flip board) -- and a container to orgaise them horizontally
        const menu_collection = document.createElement('div')
        menu_collection.classList.add('menu_collection')
        top_board_wrapper.appendChild(menu_collection)

        const menu_button = document.createElement('img')
        menu_button.setAttribute('id', 'menu_button')
        menu_button.src = '/static/main/images/buttons/settings.png'
        menu_button.classList.add('board_buttons')
        menu_collection.appendChild(menu_button)
        menu_button.addEventListener('click', handle_menu)

        const flip_button = document.createElement('img')
        flip_button.setAttribute('id', 'flip_button')
        flip_button.classList.add('board_buttons')
        flip_button.src = '/static/main/images/buttons/flip_button.png'
        menu_collection.appendChild(flip_button)
        flip_button.addEventListener('click', handle_flip)
        
    }

}

function start_game(refresh, test){
    
    const screen = document.getElementById('end_screen')
    if (screen){
        screen.remove()
    }

    game_board.orientation = channel_player.color

    if (refresh != true){
        console.log("THIS IS HAPPENING")
        all_pieces.forEach(piece => {
            if (test == false){
                piece.reset()
            }
            
            if (game_board.orientation == 'black'){
                piece.flip()
            }
        })
    }
    

    game_board.clear_array()
    game_board.draw_pieces()

    last_clicked_id = null
    end_game = false
    previoustime = 0
    result = null
    pause = false
    navigating = false
    previous_piece_moved = null

    if (refresh != true){
        game_board.update_sequence('undefined', 'undefined', 'undefined', 'undefined', false)
        send_sequence(game_board.sequence)
        turn = 'white'
    }
    
    

    if (turn == 'white' && white_player == 'computer' && black_player == 'human'){
        var moves = get_legal_moves(turn, previous_piece_moved)
        computer_turn(computer_type, moves)

        var moves = get_legal_moves(turn, previous_piece_moved)
        var in_check = check_for_check(turn, previous_piece_moved)
        check_game_finished(moves, in_check)

        if (end_game == true){
            game_finished(result)
        }

    }
    
    if (white_player == 'computer' && black_player == 'computer'){
        window.requestAnimationFrame(handleloop)
    }
}






document.addEventListener('click', handleclick)


