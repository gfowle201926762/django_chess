


var opposition = null





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
    opposition = 'computer'
}

function handle_human(event){
    opposition = 'human'

    const human_button = document.getElementById()
}

function handle_friend_challenge(event){
    window.location.pathname = '/login/'
}

function handle_play_guest(event){
    window.location.pathname = '/lobby/'
}

function handle_login(event){
    window.location.pathname = '/login/'
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
    welcome.innerHTML = 'Welcome to chess!'
    wrapper.appendChild(welcome)





    const info_wrapper = document.createElement('div')
    info_wrapper.classList.add('initial_option')
    info_wrapper.classList.add('info_wrapper')
    info_wrapper.innerHTML = 'Challenge a friend!'
    end_screen.appendChild(info_wrapper)
    info_wrapper.addEventListener('click', handle_friend_challenge)


    const login = document.createElement('div')
    login.setAttribute('id', 'login')
    login.classList.add('text_wrapper')
    login.classList.add('play_again')
    login.innerHTML = 'Login to play'
    end_screen.appendChild(login)
    login.addEventListener('click', handle_login)


    const play_guest = document.createElement('div')
    play_guest.setAttribute('id', 'play_guest')
    play_guest.classList.add('text_wrapper')
    play_guest.classList.add('play_again')
    play_guest.innerHTML = 'Play as guest'
    end_screen.appendChild(play_guest)
    play_guest.addEventListener('click', handle_play_guest)
}

draw_board()
start_screen()