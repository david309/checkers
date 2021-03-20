const game = document.getElementById('game');

// gameboard size 8 x 8;

const gameObj = {
  lastTurn: null,
  playableCells: [],
  redLoc: [],
  blackLoc: [],
  selected: null,
  moves: [],
  redPoints: 0,
  blackPoints: 0
};

const generateBoard = () => {
  const table = document.createElement('table');
  table.setAttribute('id', 'game-table');
  let counter = 0;

  for (let i = 0; i < 8; i++) {
    const tableRow = document.createElement('tr');
    tableRow.setAttribute('id', `table-row-${i}`);

    for (let j = 0; j < 8; j++) {
      const tableData = document.createElement('td');
      tableData.setAttribute('id', `${i},${j}`);
      // tableData.classList.add(`row-${i}-col-${j}`);

      // if the row we're on is even, give the even cells a brown-cell
      if (i % 2 === 0) {
        if (counter % 2 === 0) {
          tableData.classList.add('brown-cell');
          gameObj.playableCells.push(tableData);
        }
      }

      // if the row we're on is odd, give the odd cells a brown-cell
      if (i % 2 !== 0) {
        if (counter % 2 !== 0) {
          tableData.classList.add('brown-cell');
          gameObj.playableCells.push(tableData);
        }
      }

      tableRow.appendChild(tableData);
      counter++;
    }

    table.appendChild(tableRow);
  }

  game.appendChild(table);
};

const makeChecker = (color, x, y, id) => {
  const checker = document.createElement('p');
  checker.setAttribute('id', `${color}-${id}`);
  checker.onclick = () => {
    checkMove(color, id);
  };
  document.getElementById(`${x},${y}`).appendChild(checker);
  gameObj[`${color}Loc`][`${color}-${id}`] = { x, y };
  document.getElementById(`${color}-${id}`).classList.add(`${color}-checker`);
};

const generateCheckers = () => {
  let counter = 0;
  let redCheckerId = 0;
  let blackCheckerId = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i === 0 || i === 2) && counter % 2 === 0) {
        makeChecker('red', i, j, redCheckerId);
        redCheckerId++;
      }

      if (i === 1 && counter % 2 !== 0) {
        makeChecker('red', i, j, redCheckerId);
        redCheckerId++;
      }

      if ((i === 5 || i === 7) && counter % 2 !== 0) {
        makeChecker('black', i, j, blackCheckerId);
        blackCheckerId++;
      }

      if (i === 6 && counter % 2 === 0) {
        makeChecker('black', i, j, blackCheckerId);
        blackCheckerId++;
      }

      counter++;
    }
  }
};

generateBoard();
generateCheckers();

const kingChecker = (color, id) => {
  let checkerToKing = document.getElementById(`${id}`);
  if (checkerToKing.children.length > 0) {
    return;
  }
  // console.log('KING', color, id);
  const king = document.createElement('span');
  king.classList.add(`${color}-king`);
  document.getElementById(`${id}`).appendChild(king);
};

const clearSelected = () => {
  gameObj.playableCells.forEach(cell => cell.classList.remove('select-move'));
  gameObj.playableCells.forEach(cell => (cell.onclick = null));
  gameObj.selected.classList.remove('selected');
  gameObj.moves = [];
};

const checkMove = (color, id) => {
  if (gameObj.selected) {
    clearSelected();
  }

  const colorCategory = gameObj[`${color}Loc`];
  const position = colorCategory[`${color}-${id}`];
  const boardPosition = document.getElementById(`${position.x},${position.y}`);
  const selected = document.getElementById(`${color}-${id}`);
  selected.classList.add('selected');
  gameObj.selected = selected;

  // const cellPosId = cellPos.id.split(',');
  const posObj = {
    x: Number(boardPosition.id.split(',')[0]),
    y: Number(boardPosition.id.split(',')[1])
  };

  let checkSpot = (x, y) => document.getElementById(`${x},${y}`);

  const makeMove = (color, selected, moveTo, x, y) => {
    // console.log('selected-ID', selected.id);
    moveTo.appendChild(selected);
    gameObj[`${color}Loc`][`${selected.id}`] = { x: x, y: y };
    if (color === 'red' && x === 7) {
      kingChecker(color, selected.id);
    }

    if (color === 'black' && x === 0) {
      kingChecker(color, selected.id);
    }
    clearSelected();
  };

  // if (gameObj.moves)
  if (color === 'red') {
    // pieces that can only move right because they're on the edge of the board
    if (position.y === 0) {
      let move = checkSpot(posObj.x + 1, posObj.y + 1);
      let kingMove = checkSpot(position.x - 1, position.y + 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('red-king')
      ) {
        if (kingMove && kingMove.children.length === 0) {
          // next move is an empty square (free to move to)
          kingMove.classList.add('select-move');
          kingMove.onclick = () => {
            makeMove('red', selected, kingMove, position.x - 1, position.y + 1);
          };
          gameObj.moves.push(kingMove);
        } else {
          if (kingMove && kingMove.children.length > 0) {
            let classes = kingMove.children[0];
            if (classes && classes.classList.contains('black-checker')) {
              // there is an enemy in an adjascent square
              let kingMove_1 = checkSpot(position.x - 2, position.y + 2);
              if (kingMove_1 && kingMove_1.children.length === 0) {
                // we can jump the enemy in our way!
                kingMove_1.classList.add('select-move');
                kingMove_1.onclick = () => {
                  makeMove(
                    'red',
                    selected,
                    kingMove_1,
                    position.x - 2,
                    position.y + 2
                  );
                  kingMove.children[0].remove();
                };
                gameObj.moves.push(kingMove_1);
              }
            }
          }
        }
      }

      if (move && move.children.length === 0) {
        move.classList.add('select-move');
        move.onclick = () => {
          makeMove('red', selected, move, position.x + 1, position.y + 1);
        };
        gameObj.moves.push(move);
      } else {
        let classes = move.children[0];

        if (classes.classList.contains('black-checker')) {
          let move1_1 = checkSpot(position.x + 2, position.y + 2);

          if (move1_1 && move1_1.children.length === 0) {
            move1_1.classList.add('select-move');
            move1_1.onclick = () => {
              makeMove('red', selected, move1_1, position.x + 2, position.y + 2);
              move.children[0].remove();
            };
            gameObj.moves.push(move1_1);
          }
        }
      }
    }

    // pieces that can have 2 moves, up right, or up left
    if (position.y > 0 && position.y < 7) {
      // let move1 =
      //   position.x + 1 <= 7 ? checkSpot(position.x + 1, position.y + 1) : null;
      let move1 = checkSpot(position.x + 1, position.y + 1);
      let move2 = checkSpot(position.x + 1, position.y - 1);
      let kingMove1 = checkSpot(position.x - 1, position.y + 1);
      let kingMove2 = checkSpot(position.x - 1, position.y - 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('red-king')
      ) {
        if (kingMove1 && kingMove1.children.length === 0) {
          kingMove1.classList.add('select-move');
          kingMove1.onclick = () => {
            makeMove('red', selected, kingMove1, position.x - 1, position.y + 1);
          };
          gameObj.moves.push(kingMove1);
        } else {
          // square is occupied
          if (kingMove1 && kingMove1.children.length > 0) {
            let classes = kingMove1.children[0];
            if (classes !== null && classes.classList.contains('black-checker')) {
              let kingMove1_1 = checkSpot(position.x - 2, position.y + 2);

              if (kingMove1_1 && kingMove1_1.children.length === 0) {
                kingMove1_1.classList.add('select-move');
                kingMove1_1.onclick = () => {
                  makeMove(
                    'red',
                    selected,
                    kingMove1_1,
                    position.x - 2,
                    position.y + 2
                  );
                  kingMove1.children[0].remove();
                };
                gameObj.moves.push(kingMove1_1);
              }
            }
          }
        }

        if (kingMove2 && kingMove2.children.length === 0) {
          // next move is an empty square
          kingMove2.classList.add('select-move');
          kingMove2.onclick = () => {
            makeMove('red', selected, kingMove2, position.x - 1, position.y - 1);
          };
          gameObj.moves.push(kingMove2);
        } else {
          // square is occupied or doesnt exist
          if (kingMove2 && kingMove2.children.length > 0) {
            let classes = kingMove2.children[0];
            if (classes && classes.classList.contains('black-checker')) {
              // the square is occupied by an enemy
              let kingMove2_1 = checkSpot(position.x - 2, position.y - 2);

              if (kingMove2_1 && kingMove2_1.children.length === 0) {
                // we can jump the enemy next to us
                kingMove2_1.classList.add('select-move');
                kingMove2_1.onclick = () => {
                  makeMove(
                    'red',
                    selected,
                    kingMove2_1,
                    position.x - 2,
                    position.y - 2
                  );
                  kingMove2.children[0].remove();
                };
                gameObj.moves.push(kingMove2_1);
              }
            }
          }
        }
      }

      // making sure the move isn't already occupied by a piece
      if (move1 && move1.children.length === 0) {
        move1.classList.add('select-move');
        move1.onclick = () => {
          makeMove('red', selected, move1, position.x + 1, position.y + 1);
        };
        gameObj.moves.push(move1);
      } else {
        if (move1 && move1.children.length > 0) {
          // spot is taken
          let classes = move1.children[0];
          // if spot is taken by enemy
          if (classes.classList.contains('black-checker')) {
            let move1_1 = checkSpot(position.x + 2, position.y + 2);
            // can we jump them?
            if (move1_1 && move1_1.children.length === 0) {
              move1_1.classList.add('select-move');
              move1_1.onclick = () => {
                makeMove('red', selected, move1_1, position.x + 2, position.y + 2);
                move1.children[0].remove();
              };
              gameObj.moves.push(move1_1);
            }
          }
        }
      }

      if (move2 && move2.children.length === 0) {
        move2.classList.add('select-move');
        move2.onclick = () => {
          makeMove('red', selected, move2, position.x + 1, position.y - 1);
        };
        gameObj.moves.push(move2);
      } else {
        if (move2 && move2.children.length > 0) {
          let classes = move2.children[0];
          if (classes.classList.contains('black-checker')) {
            let move2_1 = checkSpot(position.x + 2, position.y - 2);
            if (move2_1 && move2_1.children.length === 0) {
              // we can jump them!
              move2_1.classList.add('select-move');
              move2_1.onclick = () => {
                makeMove('red', selected, move2_1, position.x + 2, position.y - 2);
                move2.children[0].remove();
              };
              gameObj.moves.push(move2_1);
            }
          }
        }
      }
    }

    // pieces that can only move left because they're on the edge of the board
    if (position.y === 7) {
      let move = checkSpot(posObj.x + 1, posObj.y - 1);
      let kingMove = checkSpot(position.x - 1, position.y - 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('red-king')
      ) {
        if (kingMove && kingMove.children.length === 0) {
          // next move is an empty square (free to move to)
          kingMove.classList.add('select-move');
          kingMove.onclick = () => {
            makeMove('red', selected, kingMove, position.x - 1, position.y - 1);
          };
          gameObj.moves.push(kingMove);
        } else {
          if (kingMove && kingMove.children.length > 0) {
            let classes = kingMove.children[0];
            if (classes && classes.classList.contains('black-checker')) {
              // there is an enemy in an adjascent square
              let kingMove_1 = checkSpot(position.x - 2, position.y - 2);
              if (kingMove_1 && kingMove_1.children.length === 0) {
                // we can jump the enemy in our way!
                kingMove_1.classList.add('select-move');
                kingMove_1.onclick = () => {
                  makeMove(
                    'red',
                    selected,
                    kingMove_1,
                    position.x - 2,
                    position.y - 2
                  );
                };
                gameObj.moves.push(kingMove_1);
              }
            }
          }
        }
      }

      if (move && move.children.length === 0) {
        move.classList.add('select-move');
        move.onclick = () => {
          makeMove('red', selected, move, position.x + 1, position.y - 1);
        };
        gameObj.moves.push(move);
      } else {
        if (move && move.children.length > 0) {
          let classes = move.children[0];
          if (classes.classList.contains('black-checker')) {
            let move1_1 = checkSpot(position.x + 2, position.y - 2);

            if (move1_1 && move1_1.children.length === 0) {
              move1_1.classList.add('select-move');
              move1_1.onclick = () => {
                makeMove('red', selected, move1_1, position.x + 2, position.y - 2);
                move.children[0].remove();
              };
              gameObj.moves.push(move1_1);
            }
          }
        }
      }
    }
  }

  //
  //
  //
  //
  //

  if (color === 'black') {
    // pieces that can only move right because they're on the edge of the board
    if (position.y === 0) {
      let move = checkSpot(posObj.x - 1, posObj.y + 1);
      let kingMove = checkSpot(position.x + 1, position.y + 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('black-king')
      ) {
        if (kingMove && kingMove.children.length === 0) {
          // next move is an empty square (free to move to)
          kingMove.classList.add('select-move');
          kingMove.onclick = () => {
            makeMove('black', selected, kingMove, position.x + 1, position.y + 1);
          };
          gameObj.moves.push(kingMove);
        } else {
          if (kingMove && kingMove.children.length > 0) {
            let classes = kingMove.children[0];
            if (classes && classes.classList.contains('red-checker')) {
              // there is an enemy in an adjascent square
              let kingMove_1 = checkSpot(position.x + 2, position.y + 2);
              if (kingMove_1 && kingMove_1.children.length === 0) {
                // we can jump the enemy in our way!
                kingMove_1.classList.add('select-move');
                kingMove_1.onclick = () => {
                  makeMove(
                    'black',
                    selected,
                    kingMove_1,
                    position.x + 2,
                    position.y + 2
                  );
                  kingMove.children[0].remove();
                };
                gameObj.moves.push(kingMove_1);
              }
            }
          }
        }
      }

      if (move && move.children.length === 0) {
        move.classList.add('select-move');
        move.onclick = () => {
          makeMove('black', selected, move, position.x - 1, position.y + 1);
        };
        gameObj.moves.push(move);
      } else {
        if (move && move.children.length > 0) {
          let classes = move.children[0];

          if (classes.classList.contains('red-checker')) {
            let move1_1 = checkSpot(position.x - 2, position.y + 2);

            if (move1_1 && move1_1.children.length === 0) {
              move1_1.classList.add('select-move');
              move1_1.onclick = () => {
                makeMove('black', selected, move1_1, position.x - 2, position.y + 2);
                move.children[0].remove();
              };
              gameObj.moves.push(move1_1);
            }
          }
        }
      }
    }

    // pieces that can have 2 moves, up right, or up left
    if (position.y > 0 && position.y < 7) {
      let move1 = checkSpot(position.x - 1, position.y + 1);
      let move2 = checkSpot(position.x - 1, position.y - 1);
      let kingMove1 = checkSpot(position.x + 1, position.y + 1);
      let kingMove2 = checkSpot(position.x + 1, position.y - 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('black-king')
      ) {
        if (kingMove1 && kingMove1.children.length === 0) {
          kingMove1.classList.add('select-move');
          kingMove1.onclick = () => {
            makeMove('black', selected, kingMove1, position.x + 1, position.y + 1);
          };
          gameObj.moves.push(kingMove1);
        } else {
          // square is occupied
          if (kingMove1 && kingMove1.children.length > 0) {
            let classes = kingMove1.children[0];
            if (classes !== null && classes.classList.contains('red-checker')) {
              let kingMove1_1 = checkSpot(position.x + 2, position.y + 2);

              if (kingMove1_1 && kingMove1_1.children.length === 0) {
                kingMove1_1.classList.add('select-move');
                kingMove1_1.onclick = () => {
                  makeMove(
                    'black',
                    selected,
                    kingMove1_1,
                    position.x + 2,
                    position.y + 2
                  );
                  kingMove1.children[0].remove();
                };
                gameObj.moves.push(kingMove1_1);
              }
            }
          }
        }

        // down-left
        if (kingMove2 && kingMove2.children.length === 0) {
          // next move is an empty square
          kingMove2.classList.add('select-move');
          kingMove2.onclick = () => {
            makeMove('black', selected, kingMove2, position.x + 1, position.y - 1);
          };
          gameObj.moves.push(kingMove2);
        } else {
          // square is occupied or doesnt exist
          if (kingMove2 && kingMove2.children.length > 0) {
            let classes = kingMove2.children[0];
            if (classes && classes.classList.contains('red-checker')) {
              // the square is occupied by an enemy
              let kingMove2_1 = checkSpot(position.x + 2, position.y - 2);

              if (kingMove2_1 && kingMove2_1.children.length === 0) {
                // we can jump the enemy next to us
                kingMove2_1.classList.add('select-move');
                kingMove2_1.onclick = () => {
                  makeMove(
                    'black',
                    selected,
                    kingMove2_1,
                    position.x + 2,
                    position.y - 2
                  );
                  kingMove2.children[0].remove();
                };
                gameObj.moves.push(kingMove2_1);
              }
            }
          }
        }
      }

      // making sure the move isn't already occupied by a piece
      if (move1 && move1.children.length === 0) {
        move1.classList.add('select-move');
        move1.onclick = () => {
          makeMove('black', selected, move1, position.x - 1, position.y + 1);
        };
        gameObj.moves.push(move1);
      } else {
        if (move1 && move1.children.length > 0) {
          let classes = move1.children[0];
          if (classes.classList.contains('red-checker')) {
            let move1_1 = checkSpot(position.x - 2, position.y + 2);
            // can we jump them?
            if (move1_1 && move1_1.children.length === 0) {
              move1_1.classList.add('select-move');
              move1_1.onclick = () => {
                makeMove('black', selected, move1_1, position.x - 2, position.y + 2);
                move1.children[0].remove();
              };
              gameObj.moves.push(move1_1);
            }
          }
        }
      }

      if (move2 && move2.children.length === 0) {
        move2.classList.add('select-move');
        move2.onclick = () => {
          makeMove('black', selected, move2, position.x - 1, position.y - 1);
        };
        gameObj.moves.push(move2);
      } else {
        if (move2 && move2.children.length > 0) {
          let classes = move2.children[0];
          if (classes.classList.contains('red-checker')) {
            let move2_1 = checkSpot(position.x - 2, position.y - 2);
            if (move2_1 && move2_1.children.length === 0) {
              // we can jump them!
              move2_1.classList.add('select-move');
              move2_1.onclick = () => {
                makeMove('black', selected, move2_1, position.x - 2, position.y - 2);
                move2.children[0].remove();
              };
              gameObj.moves.push(move2_1);
            }
          }
        }
      }
    }

    // pieces that can only move left because they're on the edge of the board
    if (position.y === 7) {
      let move = checkSpot(posObj.x - 1, posObj.y - 1);
      let kingMove = checkSpot(position.x + 1, position.y - 1);

      // is the selected piece a king?
      if (
        selected.children.length > 0 &&
        selected.children[0].classList.contains('black-king')
      ) {
        if (kingMove && kingMove.children.length === 0) {
          // next move is an empty square (free to move to)
          kingMove.classList.add('select-move');
          kingMove.onclick = () => {
            makeMove('black', selected, kingMove, position.x + 1, position.y - 1);
          };
          gameObj.moves.push(kingMove);
        } else {
          if (kingMove && kingMove.children.length > 0) {
            let classes = kingMove.children[0];
            if (classes && classes.classList.contains('red-checker')) {
              // there is an enemy in an adjascent square
              let kingMove_1 = checkSpot(position.x + 2, position.y - 2);
              if (kingMove_1 && kingMove_1.children.length === 0) {
                // we can jump the enemy in our way!
                kingMove_1.classList.add('select-move');
                kingMove_1.onclick = () => {
                  makeMove(
                    'black',
                    selected,
                    kingMove_1,
                    position.x + 2,
                    position.y - 2
                  );
                };
                gameObj.moves.push(kingMove_1);
              }
            }
          }
        }
      }

      if (move.children.length === 0) {
        move.classList.add('select-move');
        move.onclick = () => {
          makeMove('black', selected, move, position.x - 1, position.y - 1);
        };
        gameObj.moves.push(move);
      } else {
        let classes = move.children[0];

        if (classes.classList.contains('red-checker')) {
          let move1_1 = checkSpot(position.x - 2, position.y - 2);

          if (move1_1 && move1_1.children.length === 0) {
            move1_1.classList.add('select-move');
            move1_1.onclick = () => {
              makeMove('black', selected, move1_1, position.x - 2, position.y - 2);
              move.children[0].remove();
            };
            gameObj.moves.push(move1_1);
          }
        }
      }
    }
  }
};
