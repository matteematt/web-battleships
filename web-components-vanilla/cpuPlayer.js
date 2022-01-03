/**
 * Functions for the CPU players are stored in this file
 */
function startCPUPlayerTurn() {
	const THINKING_TIME = 2000;
	switch (window.game.settings.vs) {
		case 0:
			throw new Error("Shouldn't start CPU turn for two players");
		case 1:
			setTimeout(() => aiEasyCPU(), Math.random() * THINKING_TIME);
			break;
		default:
			throw new Error(`Unknown settings.vs value "${window.game.settings.vs}"`);
	}
}

function getPlayersTilesNodeList() {
	return document
		.querySelector('battleship-grid[player="0"]')
		.shadowRoot.querySelectorAll(".grid-container div");
}

// CONSTANTS
const modes = {
	SEARCHING: 0,
	SCANNING: 1,
}

/**
 * EASY CPU
 *
 * SEARCHING: Start of by randomly guessing tiles
 * SCANNING: If it has any hits then guess one of the 9 adjacent tiles if possible
 * SCANNING: 20% chance to go back to random guessing when in scanning mode
 */
function aiEasyCPU() {
	if (window.game.cpu.mode === modes.SEARCHING) {
		const hit = aiRandomSearch();
		if (hit) {
			window.game.cpu.mode = modes.SCANNING;
		}
	} else if (window.game.cpu.mode === modes.SCANNING) {
		aiLocalScan();
		if (Math.random() < 0.2) window.game.cpu.mode = modes.SEARCHING;
	}
}

/**
 * MED CPU
 *
 * Start of by randomly guessing tiles
 * If it has any hits then guess one of the 9 adjacent tiles if possible
 * if we are on a streak of tiles (straight line) then try and keep guessing down them
 */

/**
 * HARD CPU CPU
 *
 * 25% of guessing one of your ships tiles, or randomly guess
 * If it has any hits then guess one of the 9 adjacent tiles if possible
 * if we are on a streak of tiles (straight line) then try and keep guessing down them
 */


/**
 * AI Behaviour functions
 */

// Takes a guess {x,y} and makes the guess on the board, returning whether it was a hit
function aiMakeGuess(guess) {
	window.game.cpu.guesses.push(guess)
	const guessAsGridRef = gridXYToRef(guess);
	const guessedTile = Array.from(getPlayersTilesNodeList()).filter((elem) => elem.innerHTML === guessAsGridRef)[0];
	const successGuess = window.game.board[0].some(({x,y}) => x === guess.x && y === guess.y)
	if (successGuess) window.game.cpu.hits.push(guess);
	guessedTile.click();
	return successGuess;
}

// Makes a completely random guess for any remaining tile
// Sets guesses and hits, and returns true/false depending on whether it was a hit or not
function aiRandomSearch() {
	const BOARD_DIM = 10;
	let gotValidGuess = false;
	let guess = {};
	while (!gotValidGuess) {
		guess = {x: Math.floor(Math.random() * BOARD_DIM), y: Math.floor(Math.random() * BOARD_DIM)}
		if (!game.cpu.guesses.some(({x,y}) => x === guess.x && y === guess.y)) {
			gotValidGuess = true
		}
	}
	return aiMakeGuess(guess);
	// console.log(window.game.cpu, guessAsGridRef, guessedTile, successGuess)
}

// Makes a random valid guess of one of the adjacent eight tiles to a valid guess
function aiLocalScan() {
	const BOARD_DIM = 10;
	const getAdjacent = ({x,y}) => [
		{x: (x-1), y: (y-1)},
		{x: (x), y: (y-1)},
		{x: (x+1), y: (y-1)},
		{x: (x-1), y: (y)},
		{x: (x+1), y: (y)},
		{x: (x+1), y: (y+1)},
		{x: (x), y: (y+1)},
		{x: (x-1), y: (y+1)},
	]
		.filter(({x,y}) => (x >= 0 && x < BOARD_DIM && y >= 0 && y < BOARD_DIM))
		.filter(({x,y}) => !(window.game.cpu.guesses.some(({ex,ey}) => ex === x && ey === y)));
	const randomHitChoice = window.game.cpu.hits[Math.floor(Math.random() * (window.game.cpu.hits.length - 1))]
	const adjacents = getAdjacent(randomHitChoice);
	const guess = adjacents[Math.floor(Math.random() * adjacents.length)]
	return aiMakeGuess(guess);
	// console.log(adjacents, randomHitChoice)
}
