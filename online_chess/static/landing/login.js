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


function draw_login_screen(){
    const board = document.getElementById('board')
    const login_screen = document.createElement('div')
    login_screen.classList.add('login_screen')
    board.appendChild(login_screen)

    const form = document.getElementById('form')
    form.style.display = 'flex'

    login_screen.appendChild(form) 

    

}
console.log('h')

draw_board()
draw_login_screen()
