window.onload = () => {
 let currentlySelected = null;
  let currentConflicts = [];

  const availableNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let squares = [];
  squares.length = 81;
  squares.fill(0);
  // starting 3x3 grid indexes in a column
  let grids = [[0, 1, 2, 9, 10, 11, 18, 19, 20], [27, 28, 29, 36, 37, 38, 45, 46, 47], [54, 55, 56, 63, 64, 65, 72, 73, 74]];
  // ordering of the columns of grids inside the whole square 
  const squareColumns = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  // ordering of the columns inside a grid
  const gridColumns = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];

  let solution = [];

  let conflictingIndexes = [];
  let disabledIndexes = [];

  let initialIndexes = [];
  for (let i = 0; i < 18; i++) {
    initialIndexes.push(i);
  }

  const generateGridsInColumn = (addIndex) => {
    let tempGrid = [];
    grids.forEach(grid => {
      let columnGrid = [];
      grid.forEach(index => {
        const nextIndex = index + addIndex;
        columnGrid = [...columnGrid, nextIndex];
      });
      tempGrid = [...tempGrid, columnGrid];
    });
    return tempGrid;
  }

  const secondColumn = generateGridsInColumn(3);
  const thirdColumn = generateGridsInColumn(6);
  grids = [...grids, ...secondColumn];
  grids = [...grids, ...thirdColumn];


  const showTimesUpDialog = () => {
    const dialog = document.querySelector('#timesup-dialog');
    const closeButton = document.querySelector('#close-timesup-dialog');
    dialog.addEventListener('close', (event) => {
      window.close();
    });
    dialog.showModal();
  }

  const loadStart = new Date().getTime();
  let isSolved = false;
  let currentTime = [];
  const timer = setInterval(() => {
    const limit = 7.2 - (new Date().getTime() - loadStart) / 1000 / 60;
    const current = limit.toPrecision(4).split('.').map(num => parseInt(num));
    const mins = current[0];
    let secs = current[1] >= 170 ? `${60 * current[1]}`.substring(0, 2) : '0' + `${60 * current[1]}`.substring(0, 1);
    if (current[1] <= 15) {
      secs = '00';
    }

    if (secs !== currentTime[1]) {
      currentTime = [mins, secs];
      document.querySelector('#current-time').innerHTML = currentTime.join(':');
    }

    if (isSolved) {
      clearInterval(timer);
    }

    if (limit <= 0 && !isSolved) {
      clearInterval(timer);
      showTimesUpDialog();
    }
  }, 300);

  const validate = (index, value) => {
    conflictingIndexes = [];

    let foundGrid = [];
    let gridIndex = null;

    foundGrid = grids.filter((grid, idx, arr) => {
      if (grid.includes(index)) {
        gridIndex = idx;
        return grid;
      }
    })[0];

    // check if the value is present in the grid
    const indexInFoundGrid = foundGrid.indexOf(index);
    foundGrid.forEach(indexInGrid => {
      if (indexInGrid != index && squares[indexInGrid] !== 0 && squares[indexInGrid] === value) {
        conflictingIndexes.push(indexInGrid);
      }
    });

    // check if the value is present in the column
    let columnIndexesToCheck = [];
    let columnNumIndexesInGrid = [indexInFoundGrid];

    const firstColumnNumIndexInGrid = indexInFoundGrid + 3 > 8 ? indexInFoundGrid + 3 - 9 : indexInFoundGrid + 3;
    const secondColumnNumIndexInGrid = indexInFoundGrid + 6 > 8 ? indexInFoundGrid + 6 - 9 : indexInFoundGrid + 6;

    columnIndexesToCheck = [...columnIndexesToCheck, foundGrid[firstColumnNumIndexInGrid]];
    columnIndexesToCheck = [...columnIndexesToCheck, foundGrid[secondColumnNumIndexInGrid]];

    columnNumIndexesInGrid = [...columnNumIndexesInGrid, firstColumnNumIndexInGrid, secondColumnNumIndexInGrid];

    const currentGridsInColumn = squareColumns.filter(column => column.includes(gridIndex))[0];
    currentGridsInColumn.forEach(otherGridIndex => {
      if (otherGridIndex != gridIndex) {
        const otherGrid = grids[otherGridIndex];
        columnNumIndexesInGrid.forEach(idx => {
          columnIndexesToCheck = [...columnIndexesToCheck, otherGrid[idx]];
        });
      }
    });

    columnIndexesToCheck.forEach(indexToCheck => {
      if (indexToCheck != index && squares[indexToCheck] !== 0 && squares[indexToCheck] === value) {
        conflictingIndexes.push(indexToCheck);
      }
    });

    // check if the value is present in the row
    const indexInGridColumns = gridColumns.filter(column => column.includes(indexInFoundGrid))[0].indexOf(indexInFoundGrid);

    let rowIndexesToCheck = [];
    let rowNumIndexesInGrid = [indexInFoundGrid];

    gridColumns.forEach(column => {
      if (!column.includes(indexInFoundGrid)) {
        let indexToCheck = foundGrid[column[indexInGridColumns]];
        rowNumIndexesInGrid = [...rowNumIndexesInGrid, column[indexInGridColumns]];
        rowIndexesToCheck = [...rowIndexesToCheck, indexToCheck];
      }
    });

    const indexInSquareColumns = currentGridsInColumn.indexOf(gridIndex);

    squareColumns.forEach(column => {
      const gridIndexToCheck = column[indexInSquareColumns];
      if (gridIndexToCheck != gridIndex) {
        rowNumIndexesInGrid.forEach(indexInGrid => {
          let indexToCheck = grids[gridIndexToCheck][indexInGrid];
          rowIndexesToCheck = [...rowIndexesToCheck, indexToCheck];
        });
      };
    });

    rowIndexesToCheck.forEach(indexToCheck => {
      if (indexToCheck != index && squares[indexToCheck] !== 0 && squares[indexToCheck] === value) {
        conflictingIndexes.push(indexToCheck);
      }
    });

    if (conflictingIndexes.length > 0) {
      const confValues = conflictingIndexes.map(idx => squares[idx]);
    }

    return conflictingIndexes.length === 0;
  }

  const generateRandNumber = (squareIdx, invalidNums) => {
    const randNum = availableNums[Math.floor(Math.random() * availableNums.length)];
    if (invalidNums.includes(randNum)) {
      return generateRandNumber(squareIdx, invalidNums);
    } else {
      return randNum;
    }
  }

  const fillWithInitialNumbers = () => {
    for (let i = 0; i < initialIndexes.length; i++) {
      const idx = initialIndexes[i];
      let invalidNums = [];
      if (squares[idx] === 0) {
        for (let j = 1; j < 10; j++) {
          const selectedNum = generateRandNumber(idx, invalidNums);
          const isValid = validate(idx, selectedNum);
          if (isValid) {
            squares[idx] = selectedNum;
            fillWithInitialNumbers();
            if (invalidNums.length === 9) {
              squares[idx] = 0;
            }
          } else {
            invalidNums.push(selectedNum);
          }
        }
        return;
      }
    }
  }

  const generateIndexesToSolve = () => {
    let indexesToSolve = [];
    squares.forEach((value, idx, array) => {
      if (!initialIndexes.includes(idx)) {
        indexesToSolve.push(idx);
      }
    });
    return indexesToSolve;
  }

  const generateInitialNums = () => {
    const indexesToSolve = generateIndexesToSolve();
    fillWithInitialNumbers();
    return indexesToSolve;
  }

  const solve = (indexesToSolve, time) => {
    if (new Date().getTime() - time > 60) {
      return;
    }
    for (let i = 0; i < indexesToSolve.length; i++) {
      const idx = indexesToSolve[i];
      if (squares[idx] === 0) {
        let invalidNums = [];
        for (let j = 1; j < 10; j++) {
          const isValid = validate(idx, j);
          if (isValid) {
            squares[idx] = j;
            solve(indexesToSolve, time);
            if (invalidNums.length === 9) {
              squares[idx] = 0;
            }
          } else {
            invalidNums.push(j);
          }
        }
        return;
      }
    }
  }

  const generateRandomPuzzle = () => {
    while (squares.includes(0)) {
      squares.fill(0);
      const indexesToSolve = generateInitialNums();
      const start = new Date().getTime();
      solve(indexesToSolve, start);
      if (!squares.includes(0)) {
        solution = squares;
        break;
      }
    }

    const idxToRemoveInGrids = [];
    for (let i = 1; i < 10; i++) {
      idxToRemoveInGrids.push(5);
    }

    let indexesToRemove = [];

    let invalidIndexes = [];
    const getRandGridIdx = (indexesToRemove) => {
      let index = Math.ceil(Math.random() * 7) + 1;
      if (!indexesToRemove.includes(index) && !invalidIndexes.includes(index)) {
        invalidIndexes.push(index);
        getRandGridIdx(indexesToRemove);
      }
      return index;
    }

    grids.forEach((value, gridIdx, arr) => {
      const numsToRemove = idxToRemoveInGrids[gridIdx];
      for (let i = 0; i < numsToRemove; i++) {
        const index = getRandGridIdx(indexesToRemove);
        indexesToRemove.push(value[index]);
        invalidIndexes = [];
      }
    });

    squares = squares.map((value, idx, arr) => {
      if (indexesToRemove.includes(idx)) {
        return 0;
      } else {
        return value;
      }
    });
  }

  const validateAllSquares = () => {
    let conflicts = [];
    const start = new Date().getTime();
    squares.forEach((value, index, array) => {
      const isValid = validate(index, value);
      if (!isValid) {
        conflicts.push(index);
      }
    });
    return conflicts;
  }

  const setSquare = (square) => {
    if (currentlySelected !== null) {
      currentlySelected.style.backgroundColor = "#202020";
    }
    if (!square.target.classList.contains('disabled')) {
      currentlySelected = square.target;
    }
    if (currentlySelected !== null && currentlySelected.id !== 'invalid') {
      currentlySelected.style.backgroundColor = "#A2A2A2";
    }
  }

  const showSolvedDialog = () => {
    const dialog = document.querySelector('#success-dialog');
    const successMessage = document.querySelector('#success-message');
    const time = (new Date().getTime() - loadStart) / 1000 / 60;
    successMessage.innerHTML = successMessage.innerHTML.replace('$TIME', time.toPrecision(1));
    const closeButton = document.querySelector('#close-dialog');
    dialog.addEventListener('close', (event) => {
      window.close();
    });
    dialog.showModal();
    chrome.storage.local.set({ 'disabled': true }, () => {
    });
  }

  const setSquareValue = (controlSquare) => {
    if (currentlySelected != null && !currentlySelected.classList.contains('disabled')) {
      const prevNumber = currentlySelected.innerHTML;
      currentlySelected.innerHTML = controlSquare.innerHTML;
      const currentIndex = parseInt(currentlySelected.getAttribute('index'));
      const currentValue = parseInt(currentlySelected.innerHTML);
      squares[currentIndex] = currentValue;
      
      if (currentConflicts.length > 0) {
        let conflictsToRemove = [];
        currentConflicts.forEach((elem, idx, arr) => {
          const index = parseInt(elem.getAttribute('index'));
          const value = parseInt(elem.innerHTML);
          const isValid = validate(index, value);
          if (isValid) {
            elem.id = '';
            conflictsToRemove.push(idx);
          }
        });
        conflictsToRemove.forEach(idx => {
          currentConflicts = currentConflicts.slice(idx, 1);
        });
      }
      
      const isValid = validate(currentIndex, currentValue);
      if (!isValid) {
        currentlySelected.id = 'invalid';
        conflictingIndexes.forEach(idx => {
          const conflictingElem = document.querySelector(`span[index='${idx}']`);
          if (conflictingElem.classList.contains('disabled')) {
            conflictingElem.id = 'conflict';
          }
          currentConflicts.push(conflictingElem);
        });
      } else {
        currentlySelected.style.backgroundColor = "#00A200";
        currentlySelected.id = '';
      }
    }
    if (!squares.includes(0)) {
      isSolved = validateAllSquares().length === 0;
      if (isSolved) {
        showSolvedDialog();
      }
    }
  }

  const sudokuContainer = document.querySelector('#sudoku-container');

  const loadPuzzle = async () => {
    const sudokuPuzzle = document.querySelector('#sudoku-puzzle');
    for (let i = 0; i < 9; i++) {
      const row = document.createElement('div');
      for (let j = 0; j < 9; j++) {
        const square = document.createElement('span');
        const squareValue = squares[i * 9 + j];
        square.innerHTML = squareValue === 0 ? '_' : squareValue;
        if (squareValue !== 0) {
          square.classList.add('disabled');
          disabledIndexes.push(i * 9 + j);
        }
        square.setAttribute('index', i * 9 + j);
        square.addEventListener('click', (square) => setSquare(square));
        row.appendChild(square);
      };
      sudokuPuzzle.appendChild(row);
    };

    const sudokuControls = document.querySelector('#sudoku-controls');
    let prev = 0;
    for (let i = 1; i <= 3; i++) {
      const row = document.createElement('div');
      for (let j = 1; j <= 3; j++) {
        const square = document.createElement('span');
        prev++;
        square.innerHTML = prev;
        square.setAttribute('control-row', i + 1);
        square.setAttribute('control-square', j + 1);
        square.addEventListener('click', () => setSquareValue(square));
        row.appendChild(square);
      };
      sudokuControls.appendChild(row);
    };
    sudokuContainer.appendChild(sudokuControls);
  }

  generateRandomPuzzle();
  loadPuzzle();
}
