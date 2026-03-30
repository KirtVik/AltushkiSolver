const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const MOVES = {
    '←': -1,
    '→': 1,
    '↑': -3,
    '↓': 3,
};

let targetGridState = Array(9).fill(null);
let animationInterval = null;
let currentSolution = null;
let initialTargetState = null;

class PriorityQueue {
    constructor() { this.data = []; }
    push(val) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length <= 1) return this.data.pop();
        const top = this.data[0];
        this.data[0] = this.data.pop();
        this.bubbleDown(0);
        return top;
    }
    isEmpty() { return this.data.length === 0; }
    bubbleUp(idx) {
        let parent = Math.floor((idx - 1) / 2);
        while (idx > 0 && this.data[idx].f < this.data[parent].f) {
            [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
            idx = parent;
            parent = Math.floor((idx - 1) / 2);
        }
    }
    bubbleDown(idx) {
        const len = this.data.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;
            if (left < len && this.data[left].f < this.data[smallest].f) smallest = left;
            if (right < len && this.data[right].f < this.data[smallest].f) smallest = right;
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

function calculateHeuristic(state) {
    let distance = 0;
    // Manhattan
    for (let i = 0; i < state.length; i++) {
        if (state[i] === 9) continue;
        const goalPos = GOAL.indexOf(state[i]);
        const x1 = Math.floor(i / 3), y1 = i % 3;
        const x2 = Math.floor(goalPos / 3), y2 = goalPos % 3;
        distance += Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    // Linear Conflict (simple rows/columns)
    let linearConflict = 0;
    for (let row = 0; row < 3; row++) {
        for (let c1 = 0; c1 < 3; c1++) {
            for (let c2 = c1 + 1; c2 < 3; c2++) {
                const i1 = row * 3 + c1, i2 = row * 3 + c2;
                const v1 = state[i1], v2 = state[i2];
                if (v1 !== 9 && v2 !== 9 && Math.floor((v1 - 1) / 3) === row && Math.floor((v2 - 1) / 3) === row) {
                    if (v1 > v2) linearConflict += 2;
                }
            }
        }
    }
    for (let col = 0; col < 3; col++) {
        for (let r1 = 0; r1 < 3; r1++) {
            for (let r2 = r1 + 1; r2 < 3; r2++) {
                const i1 = r1 * 3 + col, i2 = r2 * 3 + col;
                const v1 = state[i1], v2 = state[i2];
                if (v1 !== 9 && v2 !== 9 && (v1 - 1) % 3 === col && (v2 - 1) % 3 === col) {
                    if (v1 > v2) linearConflict += 2;
                }
            }
        }
    }
    return distance + linearConflict;
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
        const temp = newState[idx];
        newState[idx] = newState[ni];
        newState[ni] = temp;
        
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
        return null;
    }

    const pq = new PriorityQueue();
    pq.push({ state: start, cost: 0, f: calculateHeuristic(start), path: [] });
    const visited = new Set();
    const goalStr = GOAL.toString();

    while (!pq.isEmpty()) {
        const current = pq.pop();
        const stateStr = current.state.toString();

        // Already found a better or equal path to this state
        if (visited.has(stateStr)) continue;
        visited.add(stateStr);

        if (stateStr === goalStr) {
            return current.path;
        }

        const neighbors = getNeighbors(current.state);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i].state;
            const move = neighbors[i].move;
            const nStr = neighbor.toString();
            
            if (!visited.has(nStr)) {
                const g = current.cost + 1;
                const h = calculateHeuristic(neighbor);
                pq.push({ 
                    state: neighbor, 
                    cost: g, 
                    f: g + h, 
                    path: [...current.path, { move, state: neighbor }] 
                });
            }
        }
    }
    return null;
}

function showSuccessToast() {
    const existing = document.querySelector('.toast-success');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = 'Мозаика успешно собрана! 🎉';
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showErrorToast(msg) {
    const existing = document.querySelector('.toast-error');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

let currentStepPreview = null;
let previewPhaseTimeout = null;

function displaySolution(solution) {
    const stepsContainer = document.getElementById("stepsList");
    stepsContainer.innerHTML = '';

    if (!solution) {
        showErrorToast("🥲 Невозможно решить мозаику! Убедитесь, что комбинация правильная.");
        return;
    }

    const header = document.createElement('h3');
    header.textContent = 'Шаги для решения:';
    stepsContainer.before(header);

    solution.forEach((step, index) => {
        if (index === 0) return; // skip initial state
        const stepItem = document.createElement('li');
        let moveDescription = '';
        switch(step.move) {
            case '←': moveDescription = '← Влево'; break;
            case '→': moveDescription = '→ Вправо'; break;
            case '↑': moveDescription = '↑ Вверх'; break;
            case '↓': moveDescription = '↓ Вниз'; break;
        }
        
        const prevState = solution[index-1].state;
        const emptyBefore = prevState.indexOf(9);
        const emptyAfter = step.state.indexOf(9);
        const movingTileValue = prevState[emptyAfter];
        
        stepItem.innerHTML = `<span class="step-num">Шаг ${index}</span><span class="step-desc">Плитка <b>${movingTileValue}</b> ${moveDescription}</span>`;
        
        const triggerPreview = (e) => {
            if (e.type === 'touchstart') e.preventDefault(); // prevent double click
            if (animationInterval) return; 
            if (currentStepPreview === index) return; // avoid reloading same step
            currentStepPreview = index;
            
            if (previewPhaseTimeout) clearTimeout(previewPhaseTimeout);
            
            // clear states
            const allItems = stepsContainer.querySelectorAll('li');
            allItems.forEach(item => item.classList.remove('current-step', 'completed'));
            stepItem.classList.add('completed');
            
            // show state before move
            updateBoard(prevState);
            
            const tileEl = document.querySelector(`.tile[data-index="${emptyAfter}"]`);
            if (tileEl) tileEl.classList.add('moving-tile');
            
            previewPhaseTimeout = setTimeout(() => {
                updateBoard(step.state);
                const movedTile = document.querySelector(`.tile[data-index="${emptyBefore}"]`);
                if (movedTile) {
                    movedTile.classList.add('moving-tile');
                    setTimeout(() => movedTile.classList.remove('moving-tile'), 300);
                }
            }, 300);
        };

        stepItem.addEventListener('mouseenter', triggerPreview);
        stepItem.addEventListener('touchstart', triggerPreview, {passive: false});

        stepsContainer.appendChild(stepItem);
    });

    // Reset board only when leaving the whole list (PC)
    stepsContainer.addEventListener('mouseleave', () => {
        if (animationInterval) return;
        if (previewPhaseTimeout) clearTimeout(previewPhaseTimeout);
        currentStepPreview = null;
        updateBoard(solution[solution.length - 1].state);
        const allItems = stepsContainer.querySelectorAll('li');
        allItems.forEach(item => item.classList.remove('completed'));
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

function renderConstructor() {
    const sourceContainer = document.getElementById('source-blocks');
    const targetContainer = document.getElementById('target-grid');
    
    if (sourceContainer.dataset.dropReady !== 'true') {
        sourceContainer.addEventListener('dragover', dragOver);
        sourceContainer.addEventListener('dragenter', dragEnter);
        sourceContainer.addEventListener('dragleave', dragLeave);
        sourceContainer.addEventListener('drop', drop);
        sourceContainer.dataset.dropReady = 'true';
    }
    
    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
        if (!targetGridState.includes(i)) {
            sourceContainer.appendChild(createDraggableTile(i, 'source'));
        }
    }
    
    for (let i = 0; i < 9; i++) {
        const dropZone = document.createElement('div');
        dropZone.classList.add('drop-zone');
        dropZone.dataset.index = i;
        
        dropZone.addEventListener('dragover', dragOver);
        dropZone.addEventListener('dragenter', dragEnter);
        dropZone.addEventListener('dragleave', dragLeave);
        dropZone.addEventListener('drop', drop);
        
        if (targetGridState[i] !== null) {
            dropZone.appendChild(createDraggableTile(targetGridState[i], i));
        }
        
        targetContainer.appendChild(dropZone);
    }
}

function processDrop(sourceLocation, targetLocation, tileValue) {
    if (sourceLocation === targetLocation) return;
    
    const val = parseInt(tileValue);
    
    if (targetLocation === 'source') {
        if (sourceLocation !== 'source') targetGridState[parseInt(sourceLocation)] = null;
    } else {
        const tIdx = parseInt(targetLocation);
        const existingVal = targetGridState[tIdx];
        targetGridState[tIdx] = val;
        
        if (sourceLocation !== 'source') {
            targetGridState[parseInt(sourceLocation)] = existingVal;
        }
    }
    renderConstructor();
}

function createDraggableTile(val, loc) {
    const block = document.createElement('div');
    block.classList.add('draggable-tile');
    block.style.touchAction = 'none';
    block.setAttribute('draggable', 'true');
    block.dataset.value = val;
    block.dataset.location = loc;

    if (val !== 9) block.style.backgroundImage = `url('images/${val}.png')`;
    else block.classList.add('empty');

    block.addEventListener('dragstart', dragStart);
    block.addEventListener('dragend', dragEnd);
    block.addEventListener('touchstart', handleTouchStart, {passive: false});
    block.addEventListener('touchmove', handleTouchMove, {passive: false});
    block.addEventListener('touchend', handleTouchEnd);
    return block;
}

function initDraggableBlocks() {
    targetGridState = Array(9).fill(null);
    renderConstructor();
}

// ---- Desktop Drag and Drop ----
function dragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', JSON.stringify({
        value: this.dataset.value, location: this.dataset.location
    }));
}
function dragEnd() { this.classList.remove('dragging'); }
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { 
    e.preventDefault(); 
    if(this.classList.contains('drop-zone')) this.classList.add('highlight'); 
    else if(this.id === 'source-blocks') this.style.backgroundColor = 'rgba(255,255,255,0.1)';
}
function dragLeave(e) { 
    this.classList.remove('highlight'); 
    if(this.id === 'source-blocks') this.style.backgroundColor = '';
}
function drop(e) {
    e.preventDefault();
    this.classList.remove('highlight');
    if(this.id === 'source-blocks') this.style.backgroundColor = '';
    
    const dropZone = e.target.closest('.drop-zone') || e.target.closest('#source-blocks');
    if (!dropZone) return;

    let targetLocation = 'source';
    if (dropZone.classList.contains('drop-zone')) targetLocation = dropZone.dataset.index;

    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        processDrop(data.location, targetLocation, data.value);
    } catch(err) {}
}

// ---- Touch Drag and Drop ----
let draggedTouchItem = null;
let touchStartX = 0, touchStartY = 0, oriX = 0, oriY = 0;

function handleTouchStart(e) {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX; touchStartY = touch.clientY;
    
    const rect = this.getBoundingClientRect();
    oriX = rect.left; oriY = rect.top;
    
    draggedTouchItem = this.cloneNode(true);
    draggedTouchItem.classList.add('dragging');
    draggedTouchItem.style.position = 'fixed';
    draggedTouchItem.style.zIndex = '1000';
    draggedTouchItem.style.width = this.offsetWidth + 'px';
    draggedTouchItem.style.height = this.offsetHeight + 'px';
    draggedTouchItem.style.margin = '0';
    draggedTouchItem.style.left = oriX + 'px';
    draggedTouchItem.style.top = oriY + 'px';
    
    draggedTouchItem.originalNode = this;
    draggedTouchItem.dataset.location = this.dataset.location;
    document.body.appendChild(draggedTouchItem);
    
    this.style.opacity = '0.3';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!draggedTouchItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    draggedTouchItem.style.left = (oriX + (touch.clientX - touchStartX)) + 'px';
    draggedTouchItem.style.top = (oriY + (touch.clientY - touchStartY)) + 'px';
}

function handleTouchEnd(e) {
    if (!draggedTouchItem) return;
    
    const touch = e.changedTouches[0];
    draggedTouchItem.style.display = 'none';
    const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (draggedTouchItem.originalNode) draggedTouchItem.originalNode.style.opacity = '1';
    
    const tileValue = parseInt(draggedTouchItem.dataset.value);
    const sourceLocation = draggedTouchItem.dataset.location;
    
    draggedTouchItem.remove(); 
    draggedTouchItem = null;
    
    if (dropElement) {
        const dropZone = dropElement.closest('.drop-zone') || dropElement.closest('#source-blocks');
        if (dropZone) {
            let targetLoc = 'source';
            if (dropZone.classList.contains('drop-zone')) targetLoc = dropZone.dataset.index;
            processDrop(sourceLocation, targetLoc, tileValue);
        }
    }
}

// ---- Control Actions ----
function buildPuzzle() {
    if (targetGridState.includes(null)) {
        showErrorToast('⚠️ Пожалуйста, заполните все ячейки мозаики!');
        return;
    }
    
    const tempState = [...targetGridState];
    const attemptSolution = solve(tempState);
    
    if (!attemptSolution) {
        displaySolution(null);
        return;
    }
    
    initialTargetState = tempState;
    currentSolution = attemptSolution;
    
    updateBoard(initialTargetState);
    displaySolution(currentSolution);
    
    document.getElementById('replayPuzzleButton').style.display = 'flex';
    runAnimation(currentSolution, initialTargetState);
}

let animationTimeout = null;
let currentSpeed = 1200; // Normal speed defaults

function runAnimation(solution, startState) {
    if (animationInterval) { clearInterval(animationInterval); animationInterval = null; }
    if (animationTimeout) { clearTimeout(animationTimeout); animationTimeout = null; }
    
    let stepIndex = 1;

    document.getElementById('replayPuzzleButton').style.display = 'none';
    const animControls = document.getElementById('animationControls');
    if (animControls) animControls.style.display = 'flex';

    const stepItems = document.querySelectorAll('#stepsList li');
    stepItems.forEach(item => item.classList.remove('current-step'));
    
    updateBoard(startState);

    function nextFrame() {
        if (stepIndex < solution.length) {
            // Highlight the correct step list item
            stepItems.forEach((item, idx) => {
                if (idx === stepIndex - 1) item.classList.add('current-step');
                else item.classList.remove('current-step');
            });
            
            const prevState = solution[stepIndex - 1].state;
            const nextState = solution[stepIndex].state;
            const emptyAfter = nextState.indexOf(9);
            const emptyBefore = prevState.indexOf(9);
            
            // Set board to previous state first
            updateBoard(prevState);
            
            // Pulse the tile that is about to move
            const tile = document.querySelector(`.tile[data-index="${emptyAfter}"]`);
            if (tile) tile.classList.add('moving-tile');
            
            // After 30% of the frame time, swap state to simulate movement
            setTimeout(() => {
                updateBoard(nextState);
                const movedTile = document.querySelector(`.tile[data-index="${emptyBefore}"]`);
                if (movedTile) {
                    movedTile.classList.add('moving-tile');
                    setTimeout(() => movedTile.classList.remove('moving-tile'), currentSpeed * 0.4);
                }
            }, currentSpeed * 0.3);
            
            stepIndex++;
            animationTimeout = setTimeout(nextFrame, currentSpeed);
        } else {
            animationTimeout = null;
            if (animControls) animControls.style.display = 'none';
            document.getElementById('replayPuzzleButton').style.display = 'flex';
            showSuccessToast();
        }
    }
    
    animationTimeout = setTimeout(nextFrame, 400); // initial brief delay
}

function replayPuzzle() {
    if (!initialTargetState || !currentSolution) return;
    
    updateBoard(initialTargetState);
    const stepItems = document.querySelectorAll('#stepsList li');
    stepItems.forEach((item) => item.classList.remove('current-step'));
    
    runAnimation(currentSolution, initialTargetState);
}

function resetPuzzle() {
    if (animationInterval) { clearInterval(animationInterval); animationInterval = null; }
    if (animationTimeout) { clearTimeout(animationTimeout); animationTimeout = null; }
    currentSolution = null;
    initialTargetState = null;
    document.getElementById('replayPuzzleButton').style.display = 'none';
    const animControls = document.getElementById('animationControls');
    if (animControls) animControls.style.display = 'none';
    
    const stepsContainer = document.getElementById("stepsList");
    stepsContainer.innerHTML = '';
    
    const header = stepsContainer.previousElementSibling;
    if (header && header.tagName === 'H3') header.remove();
    
    const completionMessage = document.querySelector('.completion-message');
    if (completionMessage) completionMessage.remove();
    
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
    document.getElementById('replayPuzzleButton').addEventListener('click', replayPuzzle);
    
    // Animation Speed Controls
    const setAnimSpeed = (speed, id) => {
        currentSpeed = speed;
        ['animSpeedSlow', 'animSpeedNormal', 'animSpeedFast'].forEach(btn => {
            const el = document.getElementById(btn);
            if (el) {
                if (btn === id) el.classList.add('active');
                else el.classList.remove('active');
            }
        });
    };
    
    const slowBtn = document.getElementById('animSpeedSlow');
    if (slowBtn) slowBtn.addEventListener('click', () => setAnimSpeed(1800, 'animSpeedSlow'));
    
    const normalBtn = document.getElementById('animSpeedNormal');
    if (normalBtn) normalBtn.addEventListener('click', () => setAnimSpeed(1200, 'animSpeedNormal'));
    
    const fastBtn = document.getElementById('animSpeedFast');
    if (fastBtn) fastBtn.addEventListener('click', () => setAnimSpeed(500, 'animSpeedFast'));
    
    const skipBtn = document.getElementById('animSkip');
    if (skipBtn) skipBtn.addEventListener('click', () => {
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
            
            if (currentSolution) {
                updateBoard(currentSolution[currentSolution.length - 1].state);
                const stepItems = document.querySelectorAll('#stepsList li');
                stepItems.forEach(item => item.classList.remove('current-step'));
            }
            
            const animControls = document.getElementById('animationControls');
            if (animControls) animControls.style.display = 'none';
            document.getElementById('replayPuzzleButton').style.display = 'flex';
            
            showSuccessToast();
        }
    });
});
