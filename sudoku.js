window.onload = () => {
  let currentlySelected = null;

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

  let generatedSquares = [];
  let conflictingIndexes = [];

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

  // TODO since there are three main logical blocks that handle the validation,
  // they can be extracted to different threads for faster performance
  const validate = (index, value) => {
    conflictingIndexes = [];
    console.log(squares);
    console.log('Validating for index:' + index);

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
        console.log('Grid conflict:' + indexInGrid);
        conflictingIndexes.push(index);
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

    console.log('Column indexes in grid: ' + columnNumIndexesInGrid);
    
    const currentGridsInColumn = squareColumns.filter(column => column.includes(gridIndex))[0];
    currentGridsInColumn.forEach(otherGridIndex => {
      if (otherGridIndex != gridIndex) {
        const otherGrid = grids[otherGridIndex];
        columnNumIndexesInGrid.forEach(idx => {
          columnIndexesToCheck = [...columnIndexesToCheck, otherGrid[idx]];
        });
      }
    });

    console.log(`Column indexes to check: ${columnIndexesToCheck}`);
    
    const columnVals = [];
    columnIndexesToCheck.forEach(indexToCheck => {
      columnVals.push(squares[indexToCheck]);
      if (indexToCheck != index && squares[indexToCheck] !== 0 && squares[indexToCheck] === value) {
        console.log('Column conflict:' + indexToCheck);
        conflictingIndexes.push(indexToCheck);
      }
    });
    
    console.log(columnVals);

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

    console.log('Row indexes in grid: ' + rowNumIndexesInGrid);

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

    console.log(`Row indexes to check: ${rowIndexesToCheck}`);

    const rowVals = [];
    rowIndexesToCheck.forEach(indexToCheck => {
      rowVals.push(squares[indexToCheck]);
      if (indexToCheck != index && squares[indexToCheck] !== 0 && squares[indexToCheck] === value) {
        console.log('Row conflict:' + indexToCheck);
        conflictingIndexes.push(index);
      }
    });

    console.log(rowVals);
    if (conflictingIndexes.length > 0) {
      const confValues = conflictingIndexes.map(idx => squares[idx]);
      console.log('Conflicting indexes: ' + conflictingIndexes + ', values: ' + confValues);
    }

    return conflictingIndexes.length === 0;
  }

  const generateRandNumber = (squareIdx, availableNums, invalidNums) => {
    const randNum = availableNums[Math.floor(Math.random() * availableNums.length)];
    if (invalidNums.includes(randNum)) {
      return generateRandNumber(squareIdx, availableNums, invalidNums);
    } else {
      return randNum;
    }
  }

  const generateUntilValid = (squareIdx, availableNums, invalidNums) => {
    let randNum = generateRandNumber(squareIdx, availableNums, invalidNums);
    console.log('Generated: ' + randNum);
    const isValid = validate(squareIdx, randNum);
    if (!isValid) {
      console.log('oops');
      invalidNums = [...invalidNums, randNum];
      if (invalidNums.length === 9) {
        console.log('Exhausted all numbers');
        // When this actually works:
        // Complete the puzzle before the time runs out
        // When the timer ends, we disable all user interaction and show the completed sudoku (for the initial version) 
        squares[squareIdx - 1] = 0;
        return 0;
      } else {
        return generateUntilValid(squareIdx, availableNums, invalidNums);
      }
    } else {
      return randNum;
    }    
  }

  const generateNewNumber = (squareIdx, availableNums) => {
    let invalidNums = [];
    const randNum = generateUntilValid(squareIdx, availableNums, invalidNums);
    invalidNums = [];
    return randNum;
  }

  const fillWithInitialNumbers = (remainingIndexes, remainingValues, availableNums) => {
    for (let i = 0; i < remainingIndexes.length; i++) {
      const idx = remainingIndexes[i];
      const generatedNum = generateNewNumber(idx, availableNums);
      squares[idx] = generatedNum;
      remainingValues[i] = generatedNum;
    }
  }

  const validateAfterGeneration = () => {
    let errorMessages = [];
    const start = new Date().getTime();
    squares.forEach((value, index, array) => {
      const isValid = validate(index, value);
      if (!isValid) {
        errorMessages.push('Invalid at index:' + index + '\r\n');
      }
    });
    console.log(`Validation took: ${new Date().getTime() - start} ms`);
    console.log('Error messages:' + errorMessages);
  }
  
  const generateRandomPuzzle = () => {
    let gridFillNums = [];
    for (let i = 0; i < 9; i++) {
      gridFillNums = [...gridFillNums, Math.ceil(Math.random() * 5 + 1)];
    }
    console.log('Filling with: ' + gridFillNums);
    const gridsForDisplay = grids.map((grid, index, arr) => {
      const numsToRemove = 9 - gridFillNums[index];
      for (let i = 0; i < numsToRemove; i++) {
        const indexToRemove = Math.ceil(Math.random() * (grid.length - 1) + 1);
        grid = grid.filter((gridNum, gridNumIdx, gridArr) => gridNumIdx !== indexToRemove);
      }
      return grid;
    });
    
    const remainingIndexesToFilter = gridsForDisplay.flatMap(grid => grid);
    let remainingIndexes = [];
    squares.forEach((value, idx, array) => {
      if (!remainingIndexesToFilter.includes(idx)) {
        remainingIndexes.push(idx);
      }
    });
    
    let remainingValues = [];
    remainingValues.length = remainingIndexes.length;
    remainingValues.fill(0);
    while (remainingValues.includes(0)) {
      fillWithInitialNumbers(remainingIndexes, remainingValues, availableNums);
    }

    console.log('Initial squares after generation');
    console.log(squares);
    validateAfterGeneration();

    return;
    
    while (squares.includes(0)) {
      for (let i = 0; i <= squares.length - 1; i++) {
        if (squares[i] === 0) {
          const generatedNum = generateNewNumber(i, availableNums);
          squares[i] = generatedNum;
          console.log('Squares after generation');
          console.log(squares);
        }
        break;
      }
      break;
    }
    console.log('Square completed');
    /*squares = squares.map((square, index, arr) => {
      if (remainingIndexes.includes(index)) {
        return square;
      } else {
        return 0;
      }
    });*/
  }

  const setSquare = (square) => {
    if (currentlySelected !== null) {
      currentlySelected.style.backgroundColor = "#202020";
    }
    currentlySelected = square.target;
    currentlySelected.style.backgroundColor = "#424242";
    console.log(currentlySelected);
  }

  const setSquareValue = (controlSquare) => {
    if (currentlySelected != null) {
      const prevNumber = currentlySelected.innerHTML;
      console.log(`current: ${currentlySelected.innerHTML}`);
      currentlySelected.innerHTML = controlSquare.innerHTML;
      console.log(`value: ${controlSquare.innerHTML}`);
      // TODO validate
      const isValid = validate(parseInt(currentlySelected.getAttribute('index')), parseInt(currentlySelected.innerHTML));
      if (!isValid) {
        currentlySelected.style.backgroundColor = "#AA0000";
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
        const squareNum = squares[i * 9 + j];
        square.innerHTML = squareNum === 0 ? '_' : squareNum;
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

  const start = new Date().getTime();
  generateRandomPuzzle();
  loadPuzzle();
  console.log(`Loading took: ${new Date().getTime() - start} ms`);
}
