/**
 * SETUP
 */

// TODO: This and fleetSelectionOptions should use the same source
const fleetTypes = [
	[{s:5, n:'Carrier'},{s:4, n:'Carrier'},{s:3, n:'Destroyer'},{s:3, n:'Submarine'},{s:2,n:'Patrol'}],
	[
		{s:4, n:'Ship of the Line'},{s:4, n:'Ship of the Line'},{s:4, n:'Ship of the Line'},{s:4, n:'Ship of the Line'},
		{s:3, n:'Corvette'},{s:2, n:'Privateer'},{s:2, n:'Privateer'},
	],
	[{s:5, n:'Carrier'},{s:4, n:'Warship'},{s:4, n:'Warship'},{s:3, n:'Frigate'},{s:1,n:'Missle Submarine'}],
]

/**
 * Called when we want to start the game after we've made all of the required selections
 * sets up the game board with the ships added
 */
function setupGameBoard() {
	const selectedFleet = fleetTypes[parseInt(window.game.settings.fleet)].map(({s}) => s);
	const MAX_PLACEMENT_ATTEMPTS = 20;

	const buildBoard = function(boardNumber) {
		let boardDone = false;

		while (!boardDone) {
			// TODO: Should really only set this at the end rather than reset on failure
			window.game.board[boardNumber] = []
			let placementAttempts = 0;
			let workingSelectedFleet = [...selectedFleet];
			let placingShip = workingSelectedFleet.shift();
			while (placementAttempts < MAX_PLACEMENT_ATTEMPTS && !boardDone) {
				try {
					placeShipOnBoard(boardNumber, placingShip);
					if (workingSelectedFleet.length === 0) {
						boardDone = true;
					} else {
						placingShip = workingSelectedFleet.shift();
					}
				} catch (e) {
					placementAttempts++;
				}
			}
		}
	}

	buildBoard(0);
	buildBoard(1);
	window.game.settings.playersTurn = 0;
	window.game.settings.gameDone = false;
	startTurn();
	console.log(window.game)
}



function placeShipOnBoard(boardNumber, placingShip) {
	const BOARD_DIM = 10;
	const rootPlacement = {x: Math.floor(Math.random() * BOARD_DIM), y: Math.floor(Math.random() * BOARD_DIM)};
	const nextShipSpot = getShipPlacementFn(Math.floor(Math.random() * 4));
	const newShipPlacement = [rootPlacement];
	for (let i = 1; i < placingShip; i++) {
		newShipPlacement.push(nextShipSpot(newShipPlacement[newShipPlacement.length - 1]))
	}
	if (!checkShipPlacementIsValid(boardNumber, BOARD_DIM, newShipPlacement)) {
		throw new Error("Invalid ship placement, try again")
	} else {
		window.game.board[boardNumber] = window.game.board[boardNumber].concat(newShipPlacement);
	}
}

function checkShipPlacementIsValid(boardNumber, boardDim, ship) {
	const isValidCoordinate = ({x,y}) => {
		if (x < 0 || x >= boardDim) return false;
		if (y < 0 || y >= boardDim) return false;
		if (window.game.board[boardNumber].some((element) => element.x === x && element.y === y)) {
			return false;
		}
		return true;
	}
	return ship.reduce((acum,curr) => acum && isValidCoordinate(curr), true);
}

function getShipPlacementFn(type) {
	switch (type) {
		case 0: return ({x,y}) => ({x, y: (y-1)})
		case 1: return ({x,y}) => ({x: (x+1), y})
		case 2: return ({x,y}) => ({x, y: (y+1)})
		case 3: return ({x,y}) => ({x: (x-1), y})
	}
}

/**
 * Game
 */

// Controls the turn, called when someone has finished their turn or once the game board has
// been initialised
function startTurn() {
	if (checkIfGameFinished()) return;
	addMessageToMessageBoard([`It is player ${window.game.settings.playersTurn === 0 ? "one" : "two"}'s turn!`]);

	if (window.game.settings.playersTurn === 0 ||
	    window.game.settings.playersTurn === 1 &&
	    window.game.settings.vs === 0)  {
		// Don't need to do anything if it is a non-cpu player's turn
		return;
	}
	// cpuPlayer.js
	startCPUPlayerTurn();
}

function checkIfGameFinished() {
	if (window.game.board[1].length === 0) {
		window.game.settings.gameDone = true;
		addMessageToMessageBoard(['Player One WON!!'])
		return true;
	} else if (window.game.board[0].length === 0) {
		window.game.settings.gameDone = true;
		// playerSelectionOptions from PlayerSelection.js
		const playerTwoType = playerSelectionOptions.filter(({type}) => type === window.game.settings.vs)[0].name
		addMessageToMessageBoard([`Player Two (${playerTwoType}) WON!!`])
		return true;
	}
	return false;
}
