// Number of cells along x
var GRID_WIDTH = 80;
// Number of cells along y
var GRID_HEIGHT = 80;
// Size of each cell in pixels
var CELL_SIZE = 10;

var canvas;
var context;
// is a path currently being drawn
var drawing = false;

// if a path is being drawn, is it for active cells?
var drawingActives = true;


var oscillator1 = [[0,0],[1,0],[2,0]];
var oscillator2 = [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]];
var still1 = [[0,0],[0,1],[1,0],[1,1]];
var cross = [[1,0], [1,1], [0,1], [2,1], [1,2]];
var glider = [[2,0], [2,1], [2,2], [1,2], [0,1]];

var shapes = [oscillator1, oscillator2, still1, cross, glider];

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

Cell.prototype.isValid = function() {
    return this.row < GRID_HEIGHT && this.row >= 0 &&
           this.column < GRID_WIDTH && this.column >= 0;
};


function drawBoard() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.width = GRID_WIDTH*CELL_SIZE + 1;
    canvas.height = GRID_HEIGHT*CELL_SIZE + 1;
    context.clearRect(0, 0, GRID_WIDTH*CELL_SIZE+0.5, GRID_HEIGHT*CELL_SIZE+0.5);
    canvas.addEventListener('mousedown', golOnClick, false);
    canvas.addEventListener('mousemove', golOnMouseMove, false);
    // putting this on the document in case the mouse is dragged outside the canvas and released.
    document.addEventListener('mouseup', golOnMouseUp, false);

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
    drawing = true;
    if (cell.isValid()) {
        if (checkCellActive(cell)) {
            drawingActives = false;
        } else {
            drawingActives = true;
        }
    }
    golOnMouseMove(e);

}

function golOnMouseMove(e) {
    if (!drawing) {
        return;
    }
    var cell = getCursorPosition(e);
    if (cell.isValid()) {
        if (drawingActives) {
            addActiveLocation(cell);
        } else {
            removeActiveLocation(cell);
        }
        drawBoard();
    }
}

function golOnMouseUp(e) {
    drawing = false;
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
    console.log("iterating");

    var new_activeLocations = [];

    for (var cell in board.activeLocations) {
        count = 0;
        n1s = getNeighbours(board.activeLocations[cell]);
        for (var neigh in n1s) {
            if (neigh in board.activeLocations) {
                count++;
            } else {
                // If the neighbour is dead, check if it has 3 live neighbours.
                count2 = 0;
                for (var n2 in getNeighbours(n1s[neigh])) {
                    if (n2 in board.activeLocations) {
                        count2++;
                    }
                }
                if (count2 === 3) {
                    new_activeLocations[neigh] = n1s[neigh];
                }
            }
        }
        if (count === 2 || count === 3) {
            new_activeLocations[cell.toString()] = board.activeLocations[cell];
        }
    }

    board.activeLocations = new_activeLocations;
    drawBoard();
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

function toggleIterations() {
    this.on = !this.on;
    var text = this.on ? "Stop" : "Start";
    document.getElementById("on_off_button").innerHTML = text;
    document.getElementById("on_off_button").setAttribute('class', 'on_' + this.on);
}

function clearBoard() {
    board.activeLocations = [];
    drawBoard();
}

var board = new Board();
var on = false;


function foreverLoop() {
    var index = 0;

    function doOne() {
        if (on) {
            doIteration();
            ++index;
        }
        // set Timeout for async iteration
        setTimeout(doOne, 300);
    }
    doOne();
}

function drawAShape() {
    clearBoard();
    var shape = shapes[Math.floor(Math.random() * shapes.length)];
    var offset_x = Math.floor(Math.random() * GRID_WIDTH);
    var offset_y = Math.floor(Math.random() * GRID_HEIGHT);

    for (var i = 0; i < shape.length; i++) {
        addActiveLocation(new Cell((shape[i][0] + offset_x)%GRID_WIDTH, (shape[i][1] + offset_y)%GRID_HEIGHT));
    }


    drawBoard();

}

function getNeighbours(cell) {

    var neighbours = [];

    for (var row = -1; row < 2; row++) {
        for (var col = -1; col < 2; col++) {
            if (row === 0 && col === 0) {
                continue;
            }
            var x = cell.row + row;
            var y = cell.column + col;

            x = x < 0 ? GRID_HEIGHT-1 : x%GRID_HEIGHT;
            y = y < 0 ? GRID_WIDTH-1 : y%GRID_WIDTH;
            neigh_cell = new Cell(x, y);
            neighbours[neigh_cell.toString()] = neigh_cell;

        }
    }

    return neighbours;
}

foreverLoop();

// TODO: Refactor Code
// TODO: Display basic shapes on the page.