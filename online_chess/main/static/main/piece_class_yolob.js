
export var board_array = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    ]

export class piece{
    constructor(x, y, type, colour, identifier, first_turn, alive, flipped, ranking){
        this.x = x
        this.y = y
        this.type = type
        this.colour = colour
        this.identifier = identifier
        this.first_turn = first_turn
        this.alive = alive
        this.saved_x = x
        this.saved_y = y
        this.flipped = flipped
        this.ranking = ranking
    }

    check_queening(){
        if ((this.colour == 'white' && this.y == 0 && this.flipped == false) || (this.colour == 'black' && this.y == 7 && this.flipped == false)
        || (this.colour == 'white' && this.y == 7 && this.flipped == true) || (this.colour == 'black' && this.y == 0 & this.flipped == true)){
            this.type = 'queen'
            this.ranking = 9
        }
    }

    check_array(new_x, new_y){
        if (new_x >= 0 && new_x <= 7 && new_y >= 0 && new_y <= 7){
            if (board_array[new_x][new_y] == 0){
                board_array[new_x][new_y] = -1
            }
        }
    }

    check_take_array(new_x, new_y){
        if (new_x >= 0 && new_x <= 7 && new_y >= 0 && new_y <= 7){
            if (board_array[new_x][new_y] >= 17 && board_array[new_x][new_y] <= 32 && this.colour == "white"){
                board_array[new_x][new_y] += 100
            }
            else if (board_array[new_x][new_y] > 0 && board_array[new_x][new_y] < 17 && this.colour == "black"){
                board_array[new_x][new_y] += 100
            }

            // castling values
            else if (board_array[new_x][new_y] == 1 && this.colour == "white" && this.type == 'castle' && this.first_turn == true){
                board_array[new_x][new_y] += 200
            }
            else if (board_array[new_x][new_y] == 17 && this.colour == "black" && this.type == 'castle' && this.first_turn == true){
                board_array[new_x][new_y] += 200
            }
        }
    }


    draw_options(new_x, new_y){
        if (new_x >= 0 && new_x <= 7 && new_y >= 0 && new_y <= 7){
            const option = document.createElement('div')
            option.style.gridColumnStart = new_x + 1
            option.style.gridRowStart = new_y + 1
            option.classList.add('optional')
            board.appendChild(option)
            
        }
    }

    draw_takeable(new_x, new_y, takeable_piece){
        if (new_x >= 0 && new_x <= 7 && new_y >= 0 && new_y <= 7){
            const backing = document.getElementById((takeable_piece.identifier) * 100)
            backing.classList.add('takeable')
            backing.style.gridColumnStart = new_x + 1 // for en passant
            backing.style.gridRowStart = new_y + 1 // for en passant
            const element = document.getElementById(takeable_piece.identifier)
            board.removeChild(element)
            takeable_piece.draw()
        }
    }

    draw_castleable(){
        const backing = document.getElementById((this.identifier) * 100)
        backing.classList.add('castleable')
        const element = document.getElementById(this.identifier)
        board.removeChild(element)
        this.draw()
    }

    updown(){ //castle test: x=2, y=5. (x means how far to the right, y is how far down.) In the array, the first index is the row (therefore relating to the y value).
        
        for (let i=1; i<8; i++){ // up
            if (this.y - i >= 0){
                if (board_array[this.y - i][this.x] == 0){
                    this.check_array(this.y - i, this.x)
                    
                }
                else{
                    this.check_take_array(this.y - i, this.x)
                    break
                }
            }
            else{break}
        }

        for (let i=1; i<8; i++){ // down
            if (this.y + i <= 7){
                if (board_array[this.y + i][this.x] == 0){
                    this.check_array(this.y + i, this.x)
                }
                else{
                    this.check_take_array(this.y + i, this.x)
                    break
                }
            }
            else{break}
        }

        for (let i=1; i<8; i++){ // right
            if (this.x + i <= 7){
                if (board_array[this.y][this.x + i] == 0){
                    this.check_array(this.y, this.x + i)
                }
                else{
                    this.check_take_array(this.y, this.x + i)
                    break
                }
            }
            else{break}
        }

        for (let i=1; i<8; i++){ // left
            if (this.x - i >= 0){
                if (board_array[this.y][this.x - i] == 0){
                    this.check_array(this.y, this.x - i)
                }
                else{
                    this.check_take_array(this.y, this.x - i)
                    break
                }
            }
            else{break}
        }
        
    }

    diagonal(){
        for (let i=1; i<8; i++){ // up/right
            if (this.y - i >= 0 && this.x + i <= 7){
                if (board_array[this.y - i][this.x + i] == 0){
                    this.check_array(this.y - i, this.x + i)
                }
                else{
                    this.check_take_array(this.y - i, this.x + i)
                    break
                }
            }
            else{break}
        }
        for (let i=1; i<8; i++){ // up/left
            if (this.y - i >= 0 && this.x - i >= 0){
                if (board_array[this.y - i][this.x - i] == 0){
                    this.check_array(this.y - i, this.x - i)
                }
                else{
                    this.check_take_array(this.y - i, this.x - i)
                    break
                }
            }
            else{break}
        }
        for (let i=1; i<8; i++){ // down/left
            if (this.y + i <= 7 && this.x - i >= 0){
                if (board_array[this.y + i][this.x - i] == 0){
                    this.check_array(this.y + i, this.x - i)
                }
                else{
                    this.check_take_array(this.y + i, this.x - i)
                    break
                }
            }
            else{break}
        }
        for (let i=1; i<8; i++){ // down/right
            if (this.y + i <= 7 && this.x + i <= 7){
                if (board_array[this.y + i][this.x + i] == 0){
                    this.check_array(this.y + i, this.x + i)
                }
                else{
                    this.check_take_array(this.y + i, this.x + i)
                    break
                }
            }
            else{break}
        }
    }

    move(previous_piece_moved){

        
        
        if (this.type == "king"){
            for (let i=-1; i<2; i++){
                this.check_array(this.y + i, this.x - 1)
                this.check_array(this.y + i, this.x + 1)
                this.check_take_array(this.y + i, this.x - 1)
                this.check_take_array(this.y + i, this.x + 1)
            }
            this.check_array(this.y + 1, this.x)
            this.check_array(this.y - 1, this.x)
            this.check_take_array(this.y + 1, this.x)
            this.check_take_array(this.y - 1, this.x)
        }
        

        if (this.type == "queen"){
            this.diagonal()
            this.updown()
        }

        else if (this.type == "castle"){
            this.updown()
        }

        else if (this.type == "bishop"){
            this.diagonal()
        }

        else if (this.type == "knight"){
            for (let i = -2; i<3; i++){
                if (Math.abs(i) == 2){
                    this.check_array(this.y + 1, this.x + i)
                    this.check_array(this.y - 1, this.x + i)
                    this.check_take_array(this.y + 1, this.x + i)
                    this.check_take_array(this.y - 1, this.x + i)
                }
                if (Math.abs(i) == 1){
                    this.check_array(this.y + 2, this.x + i)
                    this.check_array(this.y - 2, this.x + i)
                    this.check_take_array(this.y + 2, this.x + i)
                    this.check_take_array(this.y - 2, this.x + i)
                }
            }
        }

        
        if (this.type == "pawn"){
            if ((this.colour == 'white' && this.flipped == false) || (this.colour == 'black' && this.flipped == true)){
                var i = -1
                var p = 0
            }
            if ((this.colour == "black" && this.flipped == false) || (this.colour == 'white' && this.flipped == true)){
                var i = 1
                var p = 1
            }            

            if (this.x + 1 <= 7){
                this.check_take_array(this.y + i, this.x + 1)
            }
            
            if (this.x - 1 >= 0){
                this.check_take_array(this.y + i, this.x - 1)
            }
            
            if (this.first_turn == true){
                if (board_array[this.y + i][this.x] == 0 && board_array[this.y + (2 * i)][this.x] == 0){
                    this.check_array(this.y + (2 * i), this.x)
                }
            }
            this.check_array(this.y + i, this.x)

            // en passant
            // please find a neater solution

            if (this.y == 3 + p && previous_piece_moved != null){
                if (this.x + 1 <= 7){
                    if ((board_array[this.y][this.x + 1] >= 9 && board_array[this.y][this.x + 1] <= 16) || (board_array[this.y][this.x + 1] >= 25 && board_array[this.y][this.x + 1] <= 32)){
                        // we need to check another piece. The piece at this index, and if it matches the last piece played.
                        //console.log(previous_piece_moved.identifier)
                        if (previous_piece_moved.identifier == board_array[this.y][this.x + 1]){ // the previous piece moved identifier is the same as the board index.
                            board_array[this.y + i][this.x + 1] = previous_piece_moved.identifier + 100 
                        }
                    }
                }
                if (this.x - 1 >= 0){
                    if ((board_array[this.y][this.x - 1] >= 9 && board_array[this.y][this.x - 1] <= 16) || (board_array[this.y][this.x - 1] >= 25 && board_array[this.y][this.x - 1] <= 32)){
                        // we need to check another piece. The piece at this index, and if it matches the last piece played.
                        //console.log(previous_piece_moved.identifier)
                        if (previous_piece_moved.identifier == board_array[this.y][this.x - 1]){ // the previous piece moved identifier is the same as the board index.
                            board_array[this.y + i][this.x - 1] = previous_piece_moved.identifier + 100
                        }
                    }
                }
            }

        }
        


    }

    draw(){
        const backing = document.createElement('div')
        backing.style.gridColumnStart = this.x + 1
        backing.style.gridRowStart = this.y + 1
        backing.setAttribute("id", `${this.identifier * 100}`)
        backing.classList.add('backing')
        board.appendChild(backing)

        const image = document.createElement("img")
        image.style.gridColumnStart = this.x + 1
        image.style.gridRowStart = this.y + 1
        image.classList.add('piece')
        image.setAttribute("id", `${this.identifier}`)
        board.appendChild(image)
        image.src = `/static/main/images/pieces/${this.colour}_${this.type}.png`
    }

    update_array(){
        board_array[this.y][this.x] = this.identifier
    }

    reset(){
        this.alive = true
        this.first_turn = true
        if ((this.identifier >= 9 && this.identifier <= 16) || (this.identifier >= 25 && this.identifier <= 32)){
            this.type = 'pawn'
            this.ranking = 1
        }
        this.x = this.saved_x
        this.y = this.saved_y
        this.flipped = false
    }

    flip(){
        this.y = 7 - this.y
        this.x = 7 - this.x
        if (this.flipped == true){
            this.flipped = false
        }
        else if (this.flipped == false){
            this.flipped = true
        }
        
    }
}

// PIECE INSTANCES //
/*
export var white_king = new piece(4, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(3, 7, "queen", "white", 2, true, true, false, 9)
export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, true, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, true, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, true, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, true, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, true, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, true, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)

export var black_king = new piece(4, 0, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(2, 0, "bishop", "black", 19, true, true, false, 3)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, true, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, true, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, true, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, true, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, true, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, true, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, true, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)
*/


// TESTING INSTANCES //

// Simple taking test case
/*
export var white_king = new piece(4, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(3, 7, "queen", "white", 2, true, true, false, 9)
export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, true, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, true, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, true, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 4, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, true, false, 1)
export var white_pawn_5 = new piece(4, 5, "pawn", "white", 13, true, true, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, true, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)

export var black_king = new piece(4, 0, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(2, 0, "bishop", "black", 19, true, true, false, 3)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, true, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, true, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, true, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, true, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 3, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 2, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, true, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, true, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, true, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)
*/

//simple testing case more flavour, white human to move one go, then test black.
//not recognised in the order!
//I really CBA do this any more...

export var white_king = new piece(4, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(3, 7, "queen", "white", 2, true, true, false, 9)
export var white_bishop_1 = new piece(5, 4, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(4, 6, "bishop", "white", 4, true, true, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, true, false, 3)
export var white_knight_2 = new piece(5, 5, "knight", "white", 6, true, true, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 4, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 4, "pawn", "white", 12, true, true, false, 1)
export var white_pawn_5 = new piece(4, 5, "pawn", "white", 13, true, true, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, true, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)

export var black_king = new piece(4, 0, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(2, 0, "bishop", "black", 19, true, true, false, 3)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, true, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, true, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, true, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, true, false, 5)
export var black_pawn_1 = new piece(0, 3, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 3, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 2, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, true, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, true, false, 1)
export var black_pawn_6 = new piece(5, 2, "pawn", "black", 30, true, true, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)






// Detect evaluations (simple p, b, q)
/*
export var white_king = new piece(0, 7, "king", "white", 1, true, true, false, 10)
export var white_pawn_1 = new piece(4, 4, "pawn", "white", 9, true, true, false, 1)
export var white_queen = new piece(3, 3, "queen", "white", 2, true, true, false, 9)

export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, false, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, false, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, false, false, 5)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, false, false, 1)

export var black_bishop_1 = new piece(5, 5, "bishop", "black", 19, true, true, false, 3)

export var black_king = new piece(4, 0, "king", "black", 17, true, false, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, false, false, 9)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, false, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, false, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, false, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, false, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, false, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, false, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, false, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, false, false, 1)
*/

//
// Detect evaluations (simple p, b, q | p, b, q)
/*
export var white_king = new piece(0, 7, "king", "white", 1, true, false, false, 10)
export var white_pawn_1 = new piece(5, 5, "pawn", "white", 9, true, true, false, 1)
export var white_bishop_1 = new piece(6, 6, "bishop", "white", 3, true, true, false, 3)
export var white_queen = new piece(7, 7, "queen", "white", 2, true, true, false, 9)

export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, false, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, false, false, 5)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, false, false, 1)

export var black_pawn_1 = new piece(4, 4, "pawn", "black", 25, true, true, false, 1)
export var black_bishop_1 = new piece(3, 3, "bishop", "black", 19, true, true, false, 3)
export var black_queen = new piece(2, 2, "queen", "black", 18, true, true, false, 9)

export var black_king = new piece(4, 0, "king", "black", 17, true, false, false, 10)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, false, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, false, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, false, false, 5)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, false, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, false, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, false, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, false, false, 1)
*/




// Detect threatened pieces
/*
export var white_king = new piece(0, 7, "king", "white", 1, true, true, false, 10)
export var white_knight_1 = new piece(5, 6, "knight", "white", 5, true, true, false, 3)
export var white_castle_1 = new piece(0, 6, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(1, 6, "castle", "white", 8, true, true, false, 5)

export var white_queen = new piece(3, 7, "queen", "white", 2, true, false, false, 9)
export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, false, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, false, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, false, false, 1)


export var black_king = new piece(4, 6, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(2, 3, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(3, 4, "bishop", "black", 19, true, true, false, 3)
export var black_pawn_1 = new piece(4, 5, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(6, 5, "pawn", "black", 26, true, true, false, 1)
export var black_bishop_2 = new piece(7, 4, "bishop", "black", 20, true, true, false, 3)
export var black_castle_1 = new piece(5, 5, "queen", "black", 23, true, true, false, 9)
export var black_castle_2 = new piece(5, 4, "castle", "black", 24, true, true, false, 5)
export var black_pawn_5 = new piece(5, 3, "castle", "black", 29, true, true, false, 5)
export var black_knight_1 = new piece(3, 5, "knight", "black", 21, true, true, false, 3)
export var black_knight_2 = new piece(3, 7, "knight", "black", 22, true, true, false, 3)
export var black_pawn_3 = new piece(3, 6, "queen", "black", 27, true, true, false, 9)
export var black_pawn_4 = new piece(2, 6, "castle", "black", 28, true, true, false, 5)


export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, false, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, false, false, 1)
*/

// Detect threatened pieces
/*
export var white_king = new piece(0, 7, "king", "white", 1, true, true, false, 10)
export var white_knight_1 = new piece(5, 6, "knight", "white", 5, true, true, false, 3)
export var white_castle_1 = new piece(0, 6, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(1, 6, "castle", "white", 8, true, true, false, 5)

export var white_queen = new piece(3, 7, "queen", "white", 2, true, false, false, 9)
export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, false, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, false, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, false, false, 1)


export var black_king = new piece(4, 6, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(2, 3, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(3, 4, "bishop", "black", 19, true, true, false, 3)
export var black_pawn_1 = new piece(4, 5, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(6, 5, "pawn", "black", 26, true, true, false, 1)
export var black_bishop_2 = new piece(7, 4, "bishop", "black", 20, true, true, false, 3)
export var black_castle_1 = new piece(5, 5, "queen", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(5, 4, "castle", "black", 24, true, true, false, 5)
export var black_pawn_5 = new piece(5, 3, "castle", "black", 29, true, true, false, 5)
export var black_knight_1 = new piece(3, 5, "knight", "black", 21, true, true, false, 3)
export var black_knight_2 = new piece(3, 7, "knight", "black", 22, true, true, false, 3)
export var black_pawn_3 = new piece(3, 6, "queen", "black", 27, true, true, false, 9)
export var black_pawn_4 = new piece(2, 6, "castle", "black", 28, true, true, false, 5)


export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, false, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, false, false, 1)
*/








// stalemate

/*
export var white_king = new piece(2, 2, "king", "white", 1, true, true)
export var white_pawn_1 = new piece(1, 2, "pawn", "white", 9, true, true)

export var black_king = new piece(2, 0, "king", "black", 17, true, true)
export var black_pawn_1 = new piece(2, 1, "pawn", "black", 25, true, true)

export const white_pieces = [white_king, white_pawn_1]
export const black_pieces = [black_king, black_pawn_1]
export const all_pieces = [white_king, white_pawn_1, black_king, black_pawn_1]*/


// checkmate

/*export var white_king = new piece(4, 7, "king", "white", 1, true, true)
export var white_queen = new piece(4, 0, "queen", "white", 2, true, true)
export var white_queen_1 = new piece(5, 1, "queen", "white", 2, true, true)
export var white_knight_1 = new piece(2, 5, "knight", "white", 5, true, true)

export var black_king = new piece(3, 2, "king", "black", 17, true, true)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, true)

export const white_pieces = [white_king, white_queen, white_queen_1, white_knight_1]
export const black_pieces = [black_king, black_bishop_2]
export const all_pieces = [white_king, white_queen, white_queen_1, white_knight_1, black_king, black_bishop_2]*/

// castling possibility

/*
export var white_king = new piece(4, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(4, 4, "queen", "white", 2, true, true, false, 9)
export var white_castle_2 = new piece(0, 7, "castle", "white", 8, true, true, false, 5)
export var white_pawn_8 = new piece(0, 6, "pawn", "white", 16, true, true, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, true, false, 1)

export var black_king = new piece(4, 0, "king", "black", 17, true, true, false, 10)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, true, false, 5)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, true, false, 1)

export const white_pieces = [white_king, white_castle_2, white_pawn_8, white_pawn_5]
export const black_pieces = [black_king, black_castle_2, black_pawn_8]
export const all_pieces = [white_king, white_castle_2, white_pawn_8, white_pawn_5, black_king, black_castle_2, black_pawn_8]
*/



// does en passant count as a legal move to prevent stalemate?
/*
export var white_king = new piece(0, 0, "king", "white", 1, true, true, false, 10)
export var white_pawn_3 = new piece(3, 3, "pawn", "white", 11, true, true, false, 1)

export var black_king = new piece(7, 7, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(1, 2, "queen", "black", 18, true, true, false, 9)
export var black_pawn_1 = new piece(3, 2, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(4, 1, "pawn", "black", 26, true, true, false, 1)

export const white_pieces = [white_king, white_pawn_3]
export const black_pieces = [black_king, black_queen, black_pawn_1, black_pawn_2]
export const all_pieces = [white_king, white_pawn_3, black_king, black_queen, black_pawn_1, black_pawn_2]*/



// Checkmate possibility
/*
export var black_king = new piece(0, 0, "king", "black", 17, true, true, false, 10)

export var white_king = new piece(6, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(6, 1, "queen", "white", 2, true, true, false, 9)
export var white_castle_1 = new piece(7, 3, "castle", "white", 7, true, true, false, 5)

export const white_pieces = [white_king, white_queen, white_castle_1]
export const black_pieces = [black_king]
export const all_pieces = [white_king, white_queen, white_castle_1, black_king]
*/


//checkmate in 4 (white to move)
// doesn't work because on the 4th move the black king has a choice of going to two squares
// if it goes to either two squares, checkmate is possible, but its still two squares

/*
export var white_king = new piece(6, 7, "king", "white", 1, false, true, false, 10)
export var white_queen = new piece(6, 3, "queen", "white", 2, true, true, false, 9)
export var white_castle_1 = new piece(3, 7, "castle", "white", 7, true, true, false, 5)
export var white_bishop_2 = new piece(1, 6, "bishop", "white", 4, true, true, false, 3)

export var white_castle_2 = new piece(3, 7, "castle", "white", 8, true, false, false, 5)
export var white_bishop_1 = new piece(1, 6, "bishop", "white", 3, true, false, false, 3)

export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(1, 5, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, true, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)

export var black_king = new piece(6, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(1, 2, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(6, 2, "bishop", "black", 19, true, true, false, 3)
export var black_castle_1 = new piece(5, 3, "castle", "black", 23, true, true, false, 5)
export var black_bishop_2 = new piece(6, 2, "bishop", "black", 20, true, false, false, 3)
export var black_castle_2 = new piece(5, 3, "castle", "black", 24, true, false, false, 5)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)

export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, true, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 3, "pawn", "black", 32, true, true, false, 1)
*/


//checkate in 4 moves (white to move) THIS SHOULD WORK!!
/*
export var white_king = new piece(6, 7, "king", "white", 1, false, true, false, 10)
export var white_queen = new piece(5, 1, "queen", "white", 2, true, true, false, 9)
export var white_knight_1 = new piece(7, 4, "knight", "white", 5, true, true)
export var white_bishop_2 = new piece(7, 2, "bishop", "white", 4, true, true, false, 3)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, true, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)

export var black_king = new piece(7, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(1, 6, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(2, 2, "bishop", "black", 19, true, true, false, 3)
export var black_castle_1 = new piece(6, 0, "castle", "black", 23, true, true, false, 5)

export var black_pawn_1 = new piece(0, 2, "pawn", "black", 25, true, true, false, 1)

export var black_pawn_6 = new piece(5, 2, "pawn", "black", 30, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)

export const white_pieces = [white_king, white_queen, white_knight_1, white_bishop_2,
white_pawn_1, white_pawn_3, white_pawn_6, white_pawn_7, white_pawn_8]

export const black_pieces = [black_king, black_queen, black_bishop_1, black_castle_1,
black_pawn_1, black_pawn_6, black_pawn_8]

export const all_pieces = [white_king, white_queen, white_knight_1, white_bishop_2,
white_pawn_1, white_pawn_3, white_pawn_6, white_pawn_7, white_pawn_8, black_king, black_queen, black_bishop_1, black_castle_1,
black_pawn_1, black_pawn_6, black_pawn_8]
*/

//checkmate in 4 (white to move)
/*
export var white_king = new piece(6, 7, "king", "white", 1, false, true, false, 10)
export var white_queen = new piece(3, 5, "queen", "white", 2, true, true, false, 9)
export var white_castle_1 = new piece(1, 1, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(3, 1, "castle", "white", 8, true, true, false, 5)

export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(5, 5, "pawn", "white", 10, true, true, false, 1)

export var black_king = new piece(7, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(7, 5, "queen", "black", 18, true, true, false, 9)
export var black_castle_1 = new piece(5, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(0, 0, "castle", "black", 24, true, true, false, 5)

export var black_pawn_1 = new piece(6, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(7, 2, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(6, 5, "pawn", "black", 27, true, true, false, 1)

export const white_pieces = [white_king, white_queen, white_castle_1, white_castle_2,
white_pawn_1, white_pawn_2]

export const black_pieces = [black_king, black_queen, black_castle_1, black_castle_2,
black_pawn_1, black_pawn_2, black_pawn_3]

export const all_pieces = [white_king, white_queen, white_castle_1, white_castle_2,
white_pawn_1, white_pawn_2, black_king, black_queen, black_castle_1, black_castle_2,
black_pawn_1, black_pawn_2, black_pawn_3]
*/


// checkmate in 3 (white to move)
/*
export var white_king = new piece(7, 7, "king", "white", 1, false, true, false, 10)
export var white_queen = new piece(6, 5, "queen", "white", 2, true, true, false, 9)
export var white_bishop_1 = new piece(4, 3, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(2, 4, "bishop", "white", 4, true, true, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)

export var white_castle_1 = new piece(3, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(5, 3, "castle", "white", 8, true, true, false, 5)

export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(2, 5, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)


export var black_king = new piece(7, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(4, 1, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(3, 0, "bishop", "black", 19, true, true, false, 3)
export var black_bishop_2 = new piece(4, 2, "bishop", "black", 20, true, true, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)


export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)


export var black_castle_1 = new piece(5, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(0, 0, "castle", "black", 24, true, true, false, 5)

export var black_pawn_1 = new piece(0, 2, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 3, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)

export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)

*/

// checkmate in 2 moves
/*
export var white_king = new piece(7, 7, "king", "white", 1, false, true, false, 10)
export var white_bishop_1 = new piece(4, 3, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(2, 4, "bishop", "white", 4, true, true, false, 3)

export var white_castle_1 = new piece(3, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(5, 3, "castle", "white", 8, true, true, false, 5)

export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(2, 5, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)

export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, true, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, true, false, 1)


export var black_king = new piece(7, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(6, 1, "queen", "black", 18, true, true, false, 9)
export var black_bishop_1 = new piece(3, 0, "bishop", "black", 19, true, true, false, 3)
export var black_bishop_2 = new piece(4, 2, "bishop", "black", 20, true, true, false, 3)

export var black_castle_1 = new piece(5, 0, "castle", "black", 23, true, true, false, 5)
export var black_castle_2 = new piece(0, 0, "castle", "black", 24, true, true, false, 5)

export var black_pawn_1 = new piece(0, 2, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 3, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)

export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)

export const white_pieces = [white_king, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_7, white_pawn_8]

export const black_pieces = [black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_8]

export const all_pieces = [white_king, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2,
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_7, white_pawn_8, black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2,
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_8]
*/


// checkmate via en passant
/*
export var white_queen = new piece(3, 7, "queen", "white", 2, true, false, false, 9)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, false, false, 5)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, false, false, 9)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, false, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var white_king = new piece(6, 7, "king", "white", 1, false, true, false, 10)
export var white_bishop_1 = new piece(0, 5, "bishop", "white", 3, false, true, false, 3)
export var white_knight_1 = new piece(5, 5, "knight", "white", 5, false, true, false, 3)
export var white_castle_1 = new piece(4, 1, "castle", "white", 7, false, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, false, true, false, 1)
export var white_pawn_4 = new piece(3, 4, "pawn", "white", 12, false, true, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, false, true, false, 1)
export var white_pawn_7 = new piece(6, 4, "pawn", "white", 15, false, true, false, 1)
export var white_pawn_8 = new piece(7, 4, "pawn", "white", 16, false, true, false, 1)
export var black_king = new piece(6, 2, "king", "black", 17, false, true, false, 10)
export var black_bishop_1 = new piece(2, 4, "bishop", "black", 19, false, true, false, 3)
export var black_castle_1 = new piece(2, 0, "castle", "black", 23, false, true, false, 5)
export var black_castle_2 = new piece(4, 0, "castle", "black", 24, false, true, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_6 = new piece(5, 2, "pawn", "black", 30, false, true, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, true, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, true, false, 1)

export const white_pieces = [white_king, white_queen, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2, white_knight_1, white_knight_2, 
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_4, white_pawn_5, white_pawn_6, white_pawn_7, white_pawn_8]
    
export const black_pieces = [black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2, black_knight_1, black_knight_2, 
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_4, black_pawn_5, black_pawn_6, black_pawn_7, black_pawn_8]

export const all_pieces = white_pieces.concat(black_pieces)
*/

// checkmate via castling
/*
export var white_king = new piece(4, 7, "king", "white", 1, true, true, false, 10)
export var white_queen = new piece(3, 7, "queen", "white", 2, true, false, false, 9)
export var white_bishop_1 = new piece(2, 1, "bishop", "white", 3, true, true, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, false, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, false, false, 3)
export var white_castle_1 = new piece(0, 7, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(4, 0, "castle", "white", 8, false, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, false, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, false, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, false, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 5, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 5, "pawn", "white", 16, true, false, false, 1)

export var black_king = new piece(7, 6, "king", "black", 17, true, true, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, false, false, 9)
export var black_bishop_1 = new piece(2, 0, "bishop", "black", 19, true, false, false, 3)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, false, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, false, false, 5)
export var black_castle_2 = new piece(7, 0, "castle", "black", 24, true, false, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, false, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, false, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, false, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 5, "pawn", "black", 31, false, true, false, 1)
export var black_pawn_8 = new piece(7, 5, "pawn", "black", 32, false, true, false, 1)
*/





// avoid simple checkmate
/*
export var white_king = new piece(1, 7, "king", "white", 1, false, true, false, 10)
export var white_queen = new piece(3, 7, "queen", "white", 2, true, false, false, 9)
export var white_bishop_1 = new piece(2, 7, "bishop", "white", 3, true, false, false, 3)
export var white_bishop_2 = new piece(5, 7, "bishop", "white", 4, true, true, false, 3)
export var white_knight_1 = new piece(1, 7, "knight", "white", 5, true, false, false, 3)
export var white_knight_2 = new piece(6, 7, "knight", "white", 6, true, true, false, 3)
export var white_castle_1 = new piece(3, 2, "castle", "white", 7, true, true, false, 5)
export var white_castle_2 = new piece(7, 7, "castle", "white", 8, true, true, false, 5)
export var white_pawn_1 = new piece(0, 6, "pawn", "white", 9, true, true, false, 1)
export var white_pawn_2 = new piece(1, 6, "pawn", "white", 10, true, true, false, 1)
export var white_pawn_3 = new piece(2, 6, "pawn", "white", 11, true, true, false, 1)
export var white_pawn_4 = new piece(3, 6, "pawn", "white", 12, true, false, false, 1)
export var white_pawn_5 = new piece(4, 6, "pawn", "white", 13, true, false, false, 1)
export var white_pawn_6 = new piece(5, 6, "pawn", "white", 14, true, false, false, 1)
export var white_pawn_7 = new piece(6, 6, "pawn", "white", 15, true, false, false, 1)
export var white_pawn_8 = new piece(7, 6, "pawn", "white", 16, true, false, false, 1)

export var black_king = new piece(0, 0, "king", "black", 17, false, true, false, 10)
export var black_queen = new piece(3, 0, "queen", "black", 18, true, false, false, 9)
export var black_bishop_1 = new piece(2, 0, "bishop", "black", 19, true, false, false, 3)
export var black_bishop_2 = new piece(5, 0, "bishop", "black", 20, true, false, false, 3)
export var black_knight_1 = new piece(1, 0, "knight", "black", 21, true, false, false, 3)
export var black_knight_2 = new piece(6, 0, "knight", "black", 22, true, false, false, 3)
export var black_castle_1 = new piece(0, 0, "castle", "black", 23, true, false, false, 5)
export var black_castle_2 = new piece(4, 0, "castle", "black", 24, true, true, false, 5)
export var black_pawn_1 = new piece(0, 1, "pawn", "black", 25, true, true, false, 1)
export var black_pawn_2 = new piece(1, 1, "pawn", "black", 26, true, true, false, 1)
export var black_pawn_3 = new piece(2, 1, "pawn", "black", 27, true, true, false, 1)
export var black_pawn_4 = new piece(3, 1, "pawn", "black", 28, true, false, false, 1)
export var black_pawn_5 = new piece(4, 1, "pawn", "black", 29, true, false, false, 1)
export var black_pawn_6 = new piece(5, 1, "pawn", "black", 30, true, false, false, 1)
export var black_pawn_7 = new piece(6, 1, "pawn", "black", 31, true, false, false, 1)
export var black_pawn_8 = new piece(7, 1, "pawn", "black", 32, true, false, false, 1)
*/







export const white_pieces = [white_king, white_queen, white_castle_1, white_castle_2, white_bishop_1, white_bishop_2, white_knight_1, white_knight_2, 
white_pawn_1, white_pawn_2, white_pawn_3, white_pawn_4, white_pawn_5, white_pawn_6, white_pawn_7, white_pawn_8]
    
export const black_pieces = [black_king, black_queen, black_castle_1, black_castle_2, black_bishop_1, black_bishop_2, black_knight_1, black_knight_2, 
black_pawn_1, black_pawn_2, black_pawn_3, black_pawn_4, black_pawn_5, black_pawn_6, black_pawn_7, black_pawn_8]

export const all_pieces = white_pieces.concat(black_pieces)