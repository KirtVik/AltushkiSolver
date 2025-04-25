
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9];


const MOVES = {
    '←': -1,
    '→': 1,
    '↑': -3,
    '↓': 3,
};


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

    solution.forEach((step, index) => {
        const stepItem = document.createElement('li');
        stepItem.textContent = `Шаг ${index + 1}: Двигаться ${step.move}`;
        stepsContainer.appendChild(stepItem);
    });
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
renderReferenceGrid();
