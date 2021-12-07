window.onload = () => {
  let currentlySelected = null;

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
  let hasConflict = false;

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
    let isValid = true;
    let foundGrid = [];
    let gridIndex = null;

    foundGrid = grids.filter((grid, idx, arr) => {
      if (grid.includes(index)) {
        gridIndex = idx;
        return grid;
      }
    })[0];

   console.log(foundGrid);
    
    // check if the value is present in the grid
    const indexInFoundGrid = foundGrid.indexOf(index);
    console.log(squares);
    foundGrid.forEach(indexInGrid => {
      console.log('Not the current index:' + indexInGrid != index);
      console.log('Value in squares: ' + squares[indexInGrid] + ', current value: ' + value);
      if (indexInGrid != index && squares[indexInGrid] === value) {
        isValid = false;
      }
    });

    // check if the value is present in the column
    let columnIndexesToCheck = [];
    let columnNumIndexesInGrid = [indexInFoundGrid];
    
    const firstColumnNumIndexInGrid = indexInFoundGrid + 3 > 8 ? indexInFoundGrid + 3 - 9 : indexInFoundGrid + 3;
    const secondColumnNumIndexInGrid = indexInFoundGrid + 6 > 8 ? indexInFoundGrid + 6 - 9 : indexInFoundGrid + 6;

    columnNumIndexesInGrid = [...columnNumIndexesInGrid, firstColumnNumIndexInGrid, secondColumnNumIndexInGrid];

    console.log('Column indexes in grid: ' + columnNumIndexesInGrid);
    console.log('Found grid: ' + foundGrid);

    columnNumIndexesInGrid.forEach(idx => {
      columnIndexesToCheck = [...columnIndexesToCheck, foundGrid[idx]];
    });
    
    console.log('Indexes in the current grid: ' + columnIndexesToCheck);
    const currentGridsInColumn = squareColumns.filter(column => column.includes(gridIndex))[0];
    currentGridsInColumn.forEach(otherGridIndex => {
      if (otherGridIndex != gridIndex) {
        const otherGrid = grids[otherGridIndex];
        columnNumIndexesInGrid.forEach(idx => {
          columnIndexesToCheck = [...columnIndexesToCheck, otherGrid[idx]];
        });
      }
    });

    const columnVals = [];
    columnIndexesToCheck.forEach(indexToCheck => {
      console.log(indexToCheck);
      console.log(squares[indexToCheck]);
      columnVals.push(squares[indexToCheck]);
      if (squares[indexToCheck] === value) {
        isValid = false;
      }
    });

    console.log(`Column indexes to check: ${columnIndexesToCheck}`);
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
      if (squares[indexToCheck] === value) {
        isValid = false;
      }
    });

    console.log(rowVals);
    
    return isValid;
  }

  const generateRandNumber = (squareIdx, tempNums, invalidNums) => {
    const randNum = tempNums[Math.floor(Math.random() * tempNums.length)];
    if (invalidNums.includes(randNum)) {
      return generateRandNumber(squareIdx, tempNums, invalidNums);
    } else {
      return randNum;
    }
  }

  // TODO this is correct, but we need to backtrack to change a previous value, so our current value would be valid
  // Have to keep track on what has been tried on which squares
  // When backtracking, we would swap out the current square value to the old one
  // and the old one would get a new value.
  // If there are no possible combinations with the current and the previous value,
  // we go back one index and run the same thing as below.

  // Current index = x;
  // Previous index = 9;
  // 1. Check if the previous number would be valid in the current location
  // 2. If not, we go back to the previous index.
  // 3. If valid, we incrementally try to find the next number in the that location (7)
  // 3. Switch the found number to the currently selected one (9->7 x->9)

  const backtrack = () => {
  }
  
  const generateUntilValid = (squareIdx, tempNums, invalidNums) => {
    let randNum = generateRandNumber(squareIdx, tempNums, invalidNums); 
    console.log('Generated: ' + randNum);
    const isValid = validate(squareIdx, randNum);
    if (!isValid) {
      console.log('oops');
      invalidNums = [...invalidNums, randNum];
      if (invalidNums.length === 9) {
        console.log('Exhausted all numbers');
        return '_';
      } else {
        randNum = generateUntilValid(squareIdx, tempNums, invalidNums);
      }
    }
    return randNum;
  }

  const generateNewNumber = (squareIdx, tempNums, availableNums) => {
    let invalidNums = []; 
    let randNum = generateUntilValid(squareIdx, tempNums, invalidNums);
    console.log('squareIdx: ' + squareIdx);
    squares[squareIdx] = randNum;
    invalidNums = [];
    tempNums = tempNums.filter(num => num != randNum);
    if (tempNums.length === 0) {
      tempNums = availableNums;
    }

    console.log('Squares after generation');
    console.log(squares);
  }
  
  const generateRandomPuzzle = () => {
    let gridFillNums = [];
    for (let i = 0; i < 9; i++) {
      gridFillNums = [...gridFillNums, Math.ceil(Math.random() * 5 + 1)];
    }
    console.log('Filling with: ' + gridFillNums);
    let availableNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let tempNums = availableNums;
    for (let i = 0; i <= squares.length - 1; i++) {
      generateNewNumber(squareIdx, tempNums, availableNums);
    }
    const gridsForDisplay = grids.map((grid, index, arr) => {
      const numsToRemove = 9 - gridFillNums[index];
      for (let i = 0; i < numsToRemove; i++) {
        const indexToRemove = Math.ceil(Math.random() * (grid.length - 1) + 1);
        grid = grid.filter((gridNum, gridNumIdx, gridArr) => gridNumIdx !== indexToRemove);
      }
      return grid;
    });
    const indexesToFilter = gridsForDisplay.flatMap(grid => grid);
    squares = squares.map(square => {
      if (!indexesToFilter.includes(square)) {
        return square;
      } else {
        return 0;
      }
    });
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
        const squareNum = squares[i*9+j];
        square.innerHTML = squareNum === 0 ? '_' : squareNum;
        square.setAttribute('index', i*9+j);
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
        square.setAttribute('control-row', i+1);
        square.setAttribute('control-square', j+1);
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
