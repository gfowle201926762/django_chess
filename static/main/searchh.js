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

function draw_search_screen(){

    const board = document.getElementById('board')
    const search_screen = document.getElementById('search_screen')
    search_screen.classList.add('search_screen')
    board.appendChild(search_screen)
    search_screen.style.display = 'flex'
    
}


draw_board()
draw_search_screen()