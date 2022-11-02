


const notification_url = 'ws://' + window.location.host + '/ws/notifications/'
const notification_socket = new WebSocket(notification_url)

const self_profile_pk = JSON.parse(document.getElementById('self_profile_pk').textContent)

const count = JSON.parse(document.getElementById('count').textContent)
if (count > 0){
    const notification_count = document.getElementById('notification_count')
    notification_count.style.display = 'block'
    notification_count.classList.add('notification_count')
}


notification_socket.onmessage = function(event){
    console.log('received a message...')

    const data = JSON.parse(event.data)

    if (data.type == 'first_connection'){
        notification_socket.send(JSON.stringify({
            'type': 'connecting_room',
            'message': self_profile_pk
        }))
    }

    if (data.type == 'notification_sent'){
        console.log('notification sent in JS!')
        const notification_count = document.getElementById('notification_count')
        notification_count.innerHTML = data.count
        notification_count.style.display = 'block'
        notification_count.classList.add('notification_count')
    }
}



















var opposition = null
var request_sent = false





const search_button = document.getElementById('search_button')
search_button.addEventListener('click', handle_search)

console.log('please')
function handle_search(event){
    window.location.pathname = '/search/'
}


function handle_close_search(event){
    search_board.remove()
}


function draw_board(){
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

function handle_computer(event){
    const computer_button = document.getElementById('computer')
    const human_button = document.getElementById('human')
    const new_game = document.getElementById('new_game')

    if (opposition != 'computer'){
        computer_button.classList.add('selected')
        human_button.classList.remove('selected')
        new_game.classList.remove('reject_play')
        new_game.classList.add('play_again')
        opposition = 'computer'
    }

    else if (opposition == 'computer'){
        computer_button.classList.remove('selected')
        new_game.classList.remove('play_again')
        new_game.classList.add('reject_play')
        opposition = null
    }
    
    
}

function handle_human(event){

    const human_button = document.getElementById('human')
    const computer_button = document.getElementById('computer')
    const new_game = document.getElementById('new_game')

    if (opposition != 'human'){
        human_button.classList.add('selected')
        computer_button.classList.remove('selected')
        new_game.classList.remove('reject_play')
        new_game.classList.add('play_again')
        opposition = 'human'
    }

    else if (opposition == 'human'){
        human_button.classList.remove('selected')
        new_game.classList.remove('play_again')
        new_game.classList.add('reject_play')
        opposition = null
    }   
}

function handle_friend_challenge(event){
    
    window.location.pathname = '/search/'
}

function start_screen(){
    const board = document.getElementById('board')
    const end_screen = document.createElement('div')
    end_screen.setAttribute('id', 'end_screen')
    end_screen.style.gridColumnStart = 2
    end_screen.style.gridColumnEnd = 8
    end_screen.style.gridRowStart = 1
    end_screen.style.gridRowEnd = 9
    end_screen.classList.add('end_screen')
    board.appendChild(end_screen)


    const wrapper = document.createElement('div')
    wrapper.classList.add('initial_option')
    end_screen.appendChild(wrapper)

    const welcome = document.createElement('div')
    welcome.classList.add('start_text_wrapper')
    welcome.classList.add('header')
    welcome.innerHTML = 'New Game'
    wrapper.appendChild(welcome)

    const options = document.createElement('div')
    options.classList.add('option_wrapper')
    wrapper.appendChild(options)

    const human = document.createElement('div')
    human.setAttribute('id', 'human')
    human.classList.add('option_button')
    human.innerHTML = 'human'
    options.appendChild(human)
    human.addEventListener('click', handle_human)

    const computer = document.createElement('div')
    computer.setAttribute('id', 'computer')
    computer.classList.add('option_button')
    computer.innerHTML = 'computer'
    options.appendChild(computer)
    computer.addEventListener('click', handle_computer)


    const info_wrapper = document.createElement('div')
    info_wrapper.classList.add('initial_option')
    info_wrapper.classList.add('info_wrapper')
    info_wrapper.innerHTML = 'Challenge a friend!'
    end_screen.appendChild(info_wrapper)
    info_wrapper.addEventListener('click', handle_friend_challenge)


    const new_game = document.createElement('div')
    new_game.setAttribute('id', 'new_game')
    new_game.classList.add('text_wrapper')
    new_game.classList.add('reject_play')
    new_game.innerHTML = 'New Game'
    end_screen.appendChild(new_game)
    new_game.addEventListener('click', handle_new_game)
}

draw_board()
start_screen()



var alias = null



// start websocket connection to the lobby
const url = 'ws://' + window.location.host + '/ws/chess_lobby/'
const lobby_socket = new WebSocket(url)


// send request to play
function handle_new_game(event){
    event.preventDefault()

    if (opposition != null && request_sent == false){
        lobby_socket.send(JSON.stringify({
            'message': 'request_to_play',
            'alias': alias,
            'opposition': opposition
        }))
        const new_game = document.getElementById('new_game')
        new_game.innerHTML = 'Waiting...'
        request_sent = true
    }
}


// receiving messages
lobby_socket.onmessage = function(event){
    const data = JSON.parse(event.data)
    var message = data.message
    var type = data.type
    var opposition = data.opposition
    if (type == 'rerouting'){
        window.location.pathname = '/game/' + message + '/'
    }
}






