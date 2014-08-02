// Number of cells along x
var GRID_WIDTH = 50;
// Number of cells along y
var GRID_HEIGHT = 50;
// Size of each cell in pixels
var CELL_SIZE = 10;

var canvas;
var context;

function Board() {
    this.activeLocations = [];
}

function Cell(row, column) {
    this.row = row;
    this.column = column;
}

Cell.prototype.toString = function() {
    return this.row + "_" + this.column;
};

function drawGrid() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.clearRect(0, 0, GRID_WIDTH*CELL_SIZE+0.5, GRID_HEIGHT*CELL_SIZE+0.5);
    canvas.addEventListener('click', golOnClick, false);

    for (var x = 0.5; x <= GRID_HEIGHT * CELL_SIZE + 0.5; x += CELL_SIZE) {
        context.moveTo(x, 0);
        context.lineTo(x, GRID_WIDTH * CELL_SIZE);
    }

    for (var y = 0.5; y <= GRID_WIDTH * CELL_SIZE + 0.5; y += CELL_SIZE) {
        context.moveTo(0, y);
        context.lineTo(GRID_HEIGHT * CELL_SIZE, y);
    }

    context.strokeStyle = "#000";
    context.stroke();

    for (var cell in board.activeLocations) {
        c = board.activeLocations[cell];
        context.beginPath();
        context.rect(c.column*CELL_SIZE + 0.5, c.row*CELL_SIZE+0.5, CELL_SIZE, CELL_SIZE);
        context.fillStyle = 'black';
        context.fill();
    }
}

function golOnClick(e) {
    var cell = getCursorPosition(e);
    if (checkCellActive(cell)) {
        removeActiveLocation(cell);
    } else {
        addActiveLocation(cell);
    }
    drawGrid();

}

function getCursorPosition(e) {
    var x, y;

    if (e.pageX !== undefined && e.pageY !== undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var cell = new Cell(Math.floor(y/CELL_SIZE),
                        Math.floor(x/CELL_SIZE));
    return cell;
}


function doIteration() {

}

function removeActiveLocation(cell) {
    delete board.activeLocations[cell.toString()];
}

function addActiveLocation(cell) {
    board.activeLocations[cell.toString()] = cell;
}


function checkCellActive(cell) {
    return cell.toString() in board.activeLocations;
}


var board = new Board();
var on = true;


// while(on) {
//     doIteration();
// }

// Board.prototype.someFunction = function() {
//     return "something";
// };