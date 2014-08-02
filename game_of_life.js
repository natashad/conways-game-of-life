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

Cell.prototype.isValid = function() {
    return this.row < GRID_HEIGHT && this.row >= 0 &&
           this.column < GRID_WIDTH && this.column >= 0;
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
    if (cell.isValid()) {
        if (checkCellActive(cell)) {
            removeActiveLocation(cell);
        } else {
            addActiveLocation(cell);
        }
        drawGrid();
    }

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
    drawGrid();
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

function startIterations(on) {
    this.on = on;
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
// Process interations in chunks
// function foreverLoop(maxTimePerChunk) {
//     maxTimePerChunk = maxTimePerChunk;
//     var index = 0;

//     function now() {
//         return new Date().getTime();
//     }

//     function doChunk() {
//         var startTime = now();
//         while (on && (now() - startTime) <= maxTimePerChunk) {
//             doIteration();
//             ++index;
//         }
//         // set Timeout for async iteration
//         setTimeout(doChunk, 1);
//     }
//     doChunk();
// }

foreverLoop();