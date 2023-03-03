let currentPlayer = "X";
let gameOver = false;
let moves = 0;
const cells = new Array(9).fill("");

let type='win';

const message = document.getElementById("message");
const board = document.getElementById("board");

let gamename = document.getElementById("gamename");
let savegame = document.getElementById("savegame");

board.addEventListener("click", event => {
    const cell = event.target;
    const index = cell.getAttribute("data-index");
    play(cell, index);
});

function createBoard() {
    var gamebaord = loadboard.split(',');

    if(gamebaord.length>1) gameOver=true; //means there is a game to be loaded and stop play.

    for (let i = 0; i < 3; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        board.appendChild(row);

        for (let j = 0; j < 3; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            var index = i * 3 + j;
            cell.textContent = gamebaord[index]
            cell.setAttribute("data-index", index);
            row.appendChild(cell);
        }
    }
}

async function showPrevious() {
    await getGameData();
}



function play(cell, index) {
    if (cell.textContent === "" && !gameOver) {
        cell.textContent = currentPlayer;
        cells[index] = currentPlayer;
        moves++;
        if (checkWin(currentPlayer)) {
            gameOver = true;
            message.textContent = `${currentPlayer} wins!`;
            type='win';

        } else if (moves === cells.length) {
            gameOver = true;
            message.textContent = "It's a tie!";
            type='draw';
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            message.textContent = `${currentPlayer}'s turn`;
        }
        if(gameOver) {
            gamename.disabled = false;
            savegame.disabled = false;
        }
    }
}

function checkWin(player) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (cells[a] === player && cells[b] === player && cells[c] === player) {
            // Save game data to MongoDB
            return true;
        }
    }

    return false;
}
// Save game data to MongoDB
function saveGameData() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cells)
    };
    fetch('/api/save/'+currentPlayer+'/'+type+'/'+gamename.value, options)
        .then(response => {
            if (!response.ok) throw new Error(response.status);
        })
        .catch(error => console.log(error));
}

async function getGameData() {
    const options = {
        method: 'GET'
    };
    const response = await fetch('/api/games',options);
    const json = await response.json();
    await renderHTMLFromJSON(json);
}

function renderHTMLFromJSON(jsonData) {

    let output = '';
    // Loop through the JSON data and build the HTML
    jsonData.forEach((row) => {
        let message = row.type == 'draw'?'Its was a draw!':row.player+' Won!';
        output += `<div class="card" data-id="${row._id}">
              <a href="/board/${row._id}">${row.name} ${message}</a>
           </div>`;
    });

    // Render the HTML in the document body
    document.getElementById("boards").innerHTML = output;
}

