
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9];


const MOVES = {
    '←': -1,
    '→': 1,
    '↑': -3,
    '↓': 3,
};


let targetGridState = Array(9).fill(null);


function manhattan(state) {
    let distance = 0;
    for (let i = 0; i < state.length; i++) {
        if (state[i] === 9) continue;
        const goalPos = GOAL.indexOf(state[i]);
        const [x1, y1] = [Math.floor(i / 3), i % 3];
        const [x2, y2] = [Math.floor(goalPos / 3), goalPos % 3];
        distance += Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    return distance;
}


function getNeighbors(state) {
    const neighbors = [];
    const idx = state.indexOf(9);
    const x = Math.floor(idx / 3);
    const y = idx % 3;

    for (let move in MOVES) {
        let delta = MOVES[move];
        let ni = idx + delta;

        if (move === '←' && y === 0) continue;
        if (move === '→' && y === 2) continue;
        if (move === '↑' && x === 0) continue;
        if (move === '↓' && x === 2) continue;

        const newState = [...state];
        [newState[idx], newState[ni]] = [newState[ni], newState[idx]];
        neighbors.push({ state: newState, move });
    }
    return neighbors;
}


function isSolvable(state) {
    let inv = 0;
    const arr = state.filter(x => x !== 9);
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] > arr[j]) inv++;
        }
    }
    return inv % 2 === 0;
}


function solve(start) {
    if (!isSolvable(start)) {
        alert("Эта конфигурация не решается.");
        return null;
    }

    const heap = [{ state: start, cost: 0, path: [] }];
    const visited = new Set();

    while (heap.length) {
        heap.sort((a, b) => a.cost - b.cost);
        const { state, cost, path } = heap.shift();

        if (visited.has(state.toString())) continue;
        visited.add(state.toString());

        if (state.toString() === GOAL.toString()) {
            return path;
        }

        for (const { state: neighbor, move } of getNeighbors(state)) {
            if (!visited.has(neighbor.toString())) {
                const newCost = cost + 1 + manhattan(neighbor);
                heap.push({
                    state: neighbor,
                    cost: newCost,
                    path: [...path, { move, state: neighbor }]
                });
            }
        }
    }
    return null;
}


function displaySolution(solution) {
    const stepsContainer = document.getElementById("stepsList");
    stepsContainer.innerHTML = '';

    if (!solution) {
        alert("Невозможно решить задачу.");
        return;
    }
    

    const header = document.createElement('h3');
    header.textContent = 'Шаги для решения:';
    stepsContainer.before(header);

    solution.forEach((step, index) => {
        const stepItem = document.createElement('li');
        

        let moveDescription = '';
        switch(step.move) {
            case '←': moveDescription = 'Переместить ячейку ←'; break;
            case '→': moveDescription = 'Переместить ячейку →'; break;
            case '↑': moveDescription = 'Переместить ячейку ↑'; break;
            case '↓': moveDescription = 'Переместить ячейку ↓'; break;
        }
        
        stepItem.textContent = `Шаг ${index + 1}: ${moveDescription}`;
        stepsContainer.appendChild(stepItem);
    });
    

    stepsContainer.scrollIntoView({ behavior: 'smooth' });
}


function updateBoard(state) {
    const tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        const index = parseInt(tile.getAttribute('data-index'));
        const val = state[index];

        if (val === 9) {
            tile.classList.add('empty');
            tile.style.backgroundImage = '';
        } else {
            tile.classList.remove('empty');
            tile.style.backgroundImage = `url('images/${val}.png')`;
            tile.style.backgroundSize = 'cover';
            tile.style.backgroundPosition = 'center';
        }
    });
}


function getUserMatrix() {
    return [
        Number(document.getElementById('tile1').value),
        Number(document.getElementById('tile2').value),
        Number(document.getElementById('tile3').value),
        Number(document.getElementById('tile4').value),
        Number(document.getElementById('tile5').value),
        Number(document.getElementById('tile6').value),
        Number(document.getElementById('tile7').value),
        Number(document.getElementById('tile8').value),
        Number(document.getElementById('tile9').value),
    ];
}


document.getElementById('solveButton').addEventListener('click', function() {
    const start = getUserMatrix(); 
    updateBoard(start);
    const solution = solve(start);
    displaySolution(solution);

    if (solution) {
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < solution.length) {
                updateBoard(solution[stepIndex].state);
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 1000); 
    }
});
function readCustomMatrix() {
    const inputs = document.querySelectorAll('#custom-input-grid input');
    const values = Array.from(inputs).map(inp => parseInt(inp.value));
    

    if (values.length !== 9 || values.some(v => isNaN(v)) || new Set(values).size !== 9) {
        alert("Введите 9 уникальных чисел от 1 до 9");
        return;
    }

    updateBoard(values);

}


function renderReferenceGrid() {
    const container = document.getElementById("reference-grid");
    for (let i = 1; i <= 9; i++) {
        const tile = document.createElement("div");
        tile.classList.add("reference-tile");
        tile.dataset.label = i;
        if (i !== 9) tile.style.backgroundImage = `url('images/${i}.png')`;
        container.appendChild(tile);
    }
}


function initDraggableBlocks() {
    const sourceContainer = document.getElementById('source-blocks');
    const targetContainer = document.getElementById('target-grid');
    

    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    

    for (let i = 1; i <= 9; i++) {
        const block = document.createElement('div');
        block.classList.add('draggable-tile');
        block.setAttribute('draggable', 'true');
        block.dataset.value = i;
        

        if (i !== 9) {
            block.style.backgroundImage = `url('images/${i}.png')`;
        } else {
            block.classList.add('empty');
        }
        

        block.addEventListener('dragstart', dragStart);
        block.addEventListener('dragend', dragEnd);
        
        sourceContainer.appendChild(block);
    }
    

    for (let i = 0; i < 9; i++) {
        const dropZone = document.createElement('div');
        dropZone.classList.add('drop-zone');
        dropZone.dataset.index = i;
        

        dropZone.addEventListener('dragover', dragOver);
        dropZone.addEventListener('dragenter', dragEnter);
        dropZone.addEventListener('dragleave', dragLeave);
        dropZone.addEventListener('drop', drop);
        
        targetContainer.appendChild(dropZone);
    }
    

    targetGridState = Array(9).fill(null);
}


function dragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.value);
}

function dragEnd() {
    this.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('highlight');
}

function dragLeave() {
    this.classList.remove('highlight');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('highlight');
    
    const tileValue = parseInt(e.dataTransfer.getData('text/plain'));
    const dropIndex = parseInt(this.dataset.index);
    

    if (targetGridState[dropIndex] !== null) {
        return;
    }
    

    targetGridState[dropIndex] = tileValue;
    

    const newTile = document.createElement('div');
    newTile.classList.add('draggable-tile');
    newTile.dataset.value = tileValue;
    
    if (tileValue !== 9) {
        newTile.style.backgroundImage = `url('images/${tileValue}.png')`;
    } else {
        newTile.classList.add('empty');
    }
    

    this.innerHTML = '';
    this.appendChild(newTile);
    

    const sourceBlock = document.querySelector(`#source-blocks .draggable-tile[data-value="${tileValue}"]`);
    if (sourceBlock) {
        sourceBlock.remove();
    }
}

function buildPuzzle() {

    if (targetGridState.includes(null)) {
        alert('Пожалуйста, заполните все ячейки мозаики!');
        return;
    }
    

    for (let i = 0; i < 9; i++) {
        document.getElementById(`tile${i+1}`).value = targetGridState[i];
    }
    

    updateBoard(targetGridState);
    const solution = solve(targetGridState);
    displaySolution(solution);
    
    if (solution) {

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < solution.length) {

                const stepItems = document.querySelectorAll('#stepsList li');
                stepItems.forEach((item, idx) => {
                    if (idx === stepIndex) {
                        item.classList.add('current-step');
                    } else {
                        item.classList.remove('current-step');
                    }
                });
                

                const currentState = stepIndex > 0 ? solution[stepIndex-1].state : targetGridState;
                const nextState = solution[stepIndex].state;
                const emptyBefore = currentState.indexOf(9);
                const emptyAfter = nextState.indexOf(9);
                

                const movingTileValue = currentState[emptyAfter];
                

                const tiles = document.querySelectorAll('.tile');
                tiles.forEach(tile => {
                    const index = parseInt(tile.getAttribute('data-index'));
                    

                    if (index === emptyAfter) {
                        tile.classList.add('moving-tile');
                        setTimeout(() => {
                            tile.classList.remove('moving-tile');
                        }, 800);
                    }
                });
                

                updateBoard(nextState);
                stepIndex++;
            } else {
                clearInterval(interval);

                const completionMessage = document.createElement('div');
                completionMessage.classList.add('completion-message');
                completionMessage.textContent = 'Мозаика собрана!';
                document.querySelector('#puzzle').after(completionMessage);
                setTimeout(() => {
                    completionMessage.classList.add('show');
                }, 100);
            }
        }, 1200);
    }
}


function resetPuzzle() {

    const stepsContainer = document.getElementById("stepsList");
    stepsContainer.innerHTML = '';
    

    const header = stepsContainer.previousElementSibling;
    if (header && header.tagName === 'H3') {
        header.remove();
    }
    

    const completionMessage = document.querySelector('.completion-message');
    if (completionMessage) {
        completionMessage.remove();
    }
    

    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.remove('empty');
        tile.classList.remove('moving-tile');
        tile.style.backgroundImage = '';
    });
    

    initDraggableBlocks();
}


window.addEventListener('DOMContentLoaded', () => {
    
    initDraggableBlocks();
    

    document.getElementById('buildPuzzleButton').addEventListener('click', buildPuzzle);
    document.getElementById('resetPuzzleButton').addEventListener('click', resetPuzzle);
});
