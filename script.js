let user1;
let user2;

//display controller
const displayController = (() => { 
    const boardBox = document.querySelectorAll('.field')
    const startGameBtn = document.querySelector('#start-game')
    const homeCtn = document.querySelector('.container-home')
    const gameCtn = document.querySelector('.container-game')
    const resultCtn = document.querySelector('.container-result')
    const reminderCtn = document.querySelector('.container-reminder')
    const continueBtn = document.querySelector('#continue')

    const popupForm = document.querySelector('#popup-form')
    const resetBtn = document.querySelector('.reset')
    const topText = document.querySelector('.announcement-text')
    const reminderText = document.querySelector('.reminder-text')
    const newgame = document.querySelector('#next-game')
    const nextgame = document.querySelector('#next_game')
    const winnerText = document.querySelector('.player-win')
    const winnerImg = document.querySelector('.winner-img-ctn')

    const player1Img = document.createElement('img')
    player1Img.setAttribute('src', './assets/ratio.png')
    player1Img.classList.add('winner-img')

    const player2Img = document.createElement('img')
    player2Img.setAttribute('src', './assets/aven.png')
    player2Img.classList.add('winner-img')

    const player1NameDisplay = document.querySelectorAll('.player1-name')
    const player2NameDisplay = document.querySelectorAll('.player2-name')

    const player1_score = document.querySelectorAll('.player1_pts')
    const player2_score = document.querySelectorAll('.player2_pts')

    const form = document.querySelector('#form')
    const startBtn = document.querySelector('#submit')

    startGameBtn.addEventListener('click', () => {
        popupForm.classList.remove('disappear')
    })

    boardBox.forEach((box) => {
        box.addEventListener('click', (e) => {
            boxIndex = e.target.dataset.index
            let [y,x] = convertCoordinates(boxIndex)
            play(y,x)
            render()
        })
    })

    startBtn.addEventListener('click', () => {
        event.preventDefault()
        homeCtn.classList.add('disappear')
        popupForm.classList.add('disappear')
        gameCtn.classList.remove('disappear')

        user1 = createUser(form.player1.value, 'o')
        user2 = createUser(form.player2.value, 'x')
    
        user1.getTurn()
        board.gameStart()
        updateText(`${form.player1.value}'s Turn `)

        player1NameDisplay.forEach((nameDisplay) => {
            nameDisplay.textContent = user1.userName
        })

        player2NameDisplay.forEach((nameDisplay) => {
            nameDisplay.textContent = user2.userName
        })
    })

    resetBtn.addEventListener('click', () => {
        resetGame()
        render()
    })

    newgame.addEventListener('click', () => {
        if (winnerImg.firstElementChild) {
            winnerImg.removeChild(winnerImg.firstElementChild)
        }
        resetGame()
        render()
        resultCtn.classList.add('disappear')
        nextgame.classList.add('disappear')
    })

    nextgame.addEventListener('click', () => {
        if (winnerImg.firstElementChild) {
            winnerImg.removeChild(winnerImg.firstElementChild)
        }
        resetGame()
        render()
        nextgame.classList.add('disappear')
    })

    continueBtn.addEventListener('click', () => {
        reminderCtn.classList.add('disappear')
    })

    resultCtn.addEventListener('click', () => {
        resultCtn.classList.add('disappear')
    })

    const updateText = (text) => {
        topText.textContent = text
    }

    const popup_result = (winner) => {
        if (winner == user1.userName) {
            winnerImg.appendChild(player1Img)
            winnerText.textContent = `${winner} Won`
        }

        if (winner == user2.userName) {
            winnerImg.appendChild(player2Img)
            winnerText.textContent = `${winner} Won`
        }

        else if (winner == 'Draw') {
            winnerText.textContent = 'Draw'
        }

        player1_score.forEach((a) => {
            a.textContent = `${user1.grabScore()} pts`
        })
        player2_score.forEach((a) => {
            a.textContent = `${user2.grabScore()} pts`
        })

        nextgame.classList.remove('disappear')
        resultCtn.classList.remove('disappear')

    }



    const popup_reminder = (text) => {
        reminderText.textContent = text
        reminderCtn.classList.remove('disappear')
    }

    return { updateText, popup_result, popup_reminder }
})();

//user factory
function createUser(name, marker) {
    const userName = name;
    const userMarker = marker;

    let score = 0;
    const getScore = () => score++;
    const grabScore = () => score;

    let turn = 0;
    const getTurn = () => turn++;
    const loseTurn = () => turn--;
    const turnValue = () => turn;
    const resetTurn = () => turn = 0;

    return { 
        userName,
        userMarker, 
        getScore, 
        grabScore,
        getTurn, 
        loseTurn, 
        turnValue, 
        resetTurn 
    }
}

//board and game controller
const board = (function () {
    let boardArray = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]

    let gameActive;

    const gameStart = () => gameActive = true;
    const gameEnd = () => gameActive = false;
    const getGameStatus = () => gameActive;
    const grabBoard = () => boardArray;

    const fill = (currentUser, y, x) => {
        boardArray[y][x] = currentUser.userMarker
    }

    const clearBoard = () => {
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                boardArray[i][j] = ''
            }
        } 
    }

    return { grabBoard, fill, clearBoard, gameStart, gameEnd, getGameStatus }

})();

//Start game
function startGame() {
    const user1 = createUser('Player1', 'O')
    const user2 = createUser('Player2', 'x')

    user1.getTurn()
    board.gameStart()

    return { user1, user2 }
}


//check current players turn
function findTurn() {
    const currentUser = user1.turnValue() == 1 ? user1 : user2
    const otherUser = currentUser == user1? user2 : user1

    currentUser.loseTurn()
    otherUser.getTurn()
    return [ currentUser, otherUser ]
}

//trigger on click 
function play(y, x) {
    if (board.getGameStatus()) {

        if (board.grabBoard()[y][x] != '') {
            displayController.popup_reminder('That box is filled, please fill another one')
        } 
    
        else {
            let [ currentUser, otherUser ] = findTurn()
            board.fill(currentUser, y, x)
        
            checkGame(currentUser, otherUser)
        }
    }
    else {
        displayController.popup_reminder('Game has ended')
    }
}

//Check game status
function checkGame(currentUser, otherUser) {
    let winCondition = currentUser.userMarker.repeat(3)
    const checkBoard = board.grabBoard()

    let status = check_condition(winCondition, checkBoard)
    
    switch (status) {
        case 'Win':
            currentUser.getScore()
            displayController.updateText(`${currentUser.userName} Won`);
            displayController.popup_result(currentUser.userName)
            board.gameEnd();
            break;
        case 'Draw':
            displayController.updateText('Draw. Game Ended');
            displayController.popup_result('Draw')
            board.gameEnd();
            break;
        case 'none':
            displayController.updateText(`${otherUser.userName}'s Turn`);
            break;
    }
}

//Check for wins
function check_condition(winCondition, checkBoard) {
    // Check rows and columns
    for (let i = 0; i < 3; i++) {
        let row = checkBoard[i].join('');
        let col = checkBoard.map(row => row[i]).join('');
        if (row === winCondition || col === winCondition) {
            return 'Win';
        }
    }

    // Check diagonals
    let diagonal1 = checkBoard.map((row, i) => row[i]).join('');
    let diagonal2 = checkBoard.map((row, i) => row[2 - i]).join('');
    if (diagonal1 === winCondition || diagonal2 === winCondition) {
        return 'Win';
    }

    // Check for draw
    return check_draw(checkBoard);
}

//Check for draw
function check_draw(checkBoard) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (checkBoard[i][j] == '') {
                return 'none'
            }
            else {continue}
        }
    } 

    return 'Draw'
}

//Reset game
function resetGame() {
    board.clearBoard()
    user1.resetTurn()
    user2.resetTurn()
    user1.getTurn()
    board.gameStart()
}

//Convert index into x and y
function convertCoordinates(index) {
    if (index == 0) {
        return [0,0]
    }
    if (index == 1) {
        return [0,1]
    }
    if (index == 2) {
        return [0,2]
    }
    if (index == 3) {
        return [1,0]
    }
    if (index == 4) {
        return [1,1]
    }
    if (index == 5) {
        return [1,2]
    }
    if (index == 6) {
        return [2,0]
    }
    if (index == 7) {
        return [2,1]
    }
    if (index == 8) {
        return [2,2]
    }
}

//Render board
function render() {
    const boardBox = document.querySelectorAll('.field')
    let tempArray = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            tempArray.push(board.grabBoard()[i][j])
        }
    }

    for (let i = 0; i < 9; i++) {
        boardBox[i].textContent = tempArray[i]
    }
}

