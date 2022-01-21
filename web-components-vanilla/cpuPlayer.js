/**
 * Functions for the CPU players are stored in this file
 */
function startCPUPlayerTurn() {
	// console.log(`Ai on mode ${window.game.cpu.mode}`)
	const THINKING_TIME_SCALE = 500;
	const THINKING_TIME_OFFSET = 1000;
	const thinkingTime = () => Math.random() * THINKING_TIME_SCALE + THINKING_TIME_OFFSET;
	switch (window.game.settings.vs) {
		case 0:
			throw new Error("Shouldn't start CPU turn for two players");
		case 1:
			setTimeout(() => aiEasyCPU(), thinkingTime());
			break;
		case 2:
			setTimeout(() => aiMedCPU(), thinkingTime());
			break;
		case 3:
			setTimeout(() => aiHardCPU(), thinkingTime());
			break;
		default:
			throw new Error(`Unknown settings.vs value "${window.game.settings.vs}"`);
	}
}

// TODO : i think med and hard cpu go into mode 2 sometimes when they should not
// TODO : improve AI by not completely clearing all adjacent values as they're not as
//        likely to be there

function getPlayersTilesNodeList() {
	return document
		.querySelector('battleship-grid[player="0"]')
		.shadowRoot.querySelectorAll("grid-square");
}

// CONSTANTS
const modes = {
	SEARCHING: 0,
	SCANNING: 1,
	ATTACK: 2,
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
		if (!aiLocalScan()) window.game.cpu.mode = modes.SEARCHING;
		if (Math.random() < 0.2) window.game.cpu.mode = modes.SEARCHING;
	}
}

/**
 * MED CPU
 *
 * SEARCHING: Start of by randomly guessing tiles
 * SCANNING: If it has any hits then guess one of the 9 adjacent tiles if possible
 * SCANNING: 5% change to go back to searching
 * ATTACK: if we are on a streak of tiles (straight line) then try and keep guessing down them
 * ATTACK: if there are no more valid attack lines then go back to scanning
 */
function aiMedCPU() {
	if (window.game.cpu.mode === modes.SEARCHING) {
		const hit = aiRandomSearch();
		if (hit) {
			window.game.cpu.mode = modes.SCANNING;
		}
	} else if (window.game.cpu.mode === modes.SCANNING) {
		if (!aiLocalScan()) window.game.cpu.mode = modes.SEARCHING;
		if (Math.random() < 0.2) window.game.cpu.mode = modes.SEARCHING;
		if (checkForAttackLines()) window.game.cpu.mode = modes.ATTACK;
	} else if (window.game.cpu.mode === modes.ATTACK) {
		const continueDirectAttack = aiAttack();
		if (!continueDirectAttack) {
			aiRandomSearch();
			window.game.cpu.mode = modes.SCANNING;
		}
	}
}

/**
 * HARD CPU CPU
 *
 * Same as Medium CPU but except there is a 25% chance it directly attacks a ship location instead
 */
function aiHardCPU() {
	if (Math.random() < 0.75) {
		aiMedCPU();
	} else {
		const guess = window.game.board[0][Math.floor(Math.random() * (window.game.board[0].length - 1))]
		aiMakeGuess(guess)
	}
}


/**
 * AI Behaviour functions
 */
function shuffleArray(arr) {
	for (var i = arr.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp
	}
	return arr;
}

// Takes a guess {x,y} and makes the guess on the board, returning whether it was a hit
function aiMakeGuess(guess) {
	// For debugging purposes
	if (window.game.cpu.guesses.some(({x,y}) => x === guess.x && y === guess.y)) {
		throw new Error(`Double chosen guess ${x},${y}`)
	}
	window.game.cpu.guesses.push(guess)
	const guessAsGridRef = utils.grid.gridXYToRef(guess);
	// console.log(`Making AI guess ${guessAsGridRef}`)
	const guessedTile = Array.from(getPlayersTilesNodeList())
		.filter((elem) => elem.getAttribute('name') === guessAsGridRef)[0];
	const successGuess = window.game.board[0].some(({x,y}) => x === guess.x && y === guess.y)
	if (successGuess) window.game.cpu.hits.push(guess);
	guessedTile.click();
	return successGuess;
}

// Makes a completely random guess for any remaining tile
// Sets guesses and hits, and returns true/false depending on whether it was a hit or not
function aiRandomSearch() {
	let gotValidGuess = false;
	let guess = {};
	while (!gotValidGuess) {
		guess = {
			x: Math.floor(Math.random() * utils.grid.BOARD_DIM),
			y: Math.floor(Math.random() * utils.grid.BOARD_DIM)
		}
		if (!window.game.cpu.guesses.some(({x,y}) => x === guess.x && y === guess.y)) {
			gotValidGuess = true
		}
	}
	return aiMakeGuess(guess);
	// console.log(window.game.cpu, guessAsGridRef, guessedTile, successGuess)
}

// Gets adjacent values to a certain value (ships are not placed diagonally)

function getAdjacent({x,y}) {
	const BOARD_DIM = utils.grid.BOARD_DIM;
	return [
		{x: (x), y: (y-1)},
		{x: (x-1), y: (y)},
		{x: (x+1), y: (y)},
		{x: (x), y: (y+1)},
	].filter(({x,y}) => (x >= 0 && x < BOARD_DIM && y >= 0 && y < BOARD_DIM))
}

// Makes a random valid guess of one of the adjacent eight tiles to a valid guess
function aiLocalScan() {
	const shuffledHits = shuffleArray(window.game.cpu.hits)
	// Will potentially include values multiple times, but I don't think that is an issue
	const candidates = shuffledHits.reduce((adjacents,curr) => {
		const newAdjacents = getAdjacent(curr).
		filter(({x,y}) => !(window.game.cpu.guesses.some(({x: gx, y: gy}) => x === gx && y === gy)));
		return [...adjacents, newAdjacents]
	}, []).flat()
	if (candidates.length === 0) {
		return false
	}
	const guess = candidates[Math.floor(Math.random() * (candidates.length - 1))]
	aiMakeGuess(guess);
	return true;
}

// Finds any lines that a ship could be on because of two adjacent points
// are likely to contain more ships on the same line
function checkForAttackLines() {
	let gotAttackLine = false;
	const checkFromPoint = (xy) => {
		const adjacents =
			getAdjacent(xy).
			filter(({x,y}) => window.game.cpu.hits.some(({x: ex, y: ey}) => x === ex && y === ey))
		if (adjacents.length === 0) return false;
		window.game.cpu.attackItem = {
			...xy,
			line: (xy.x === adjacents[0].x ? 'COL' : 'ROW'),
		}
		return true;
	}

	const shuffledHits = shuffleArray(window.game.cpu.hits)

	for (let i = 0; i < shuffledHits.length; i++) {
		if (checkFromPoint(shuffledHits[i])) {
			i += shuffledHits.length;
			gotAttackLine = true;
		}
	}
	// console.log(gotAttackLine, window.game.cpu.attackItem);
	return gotAttackLine;
}

// 0 = up for COL, left for ROW & 1 = down for COL, right for ROW
function aiGetAttackFunc(lineType, rightDown) {
	const func = {
		"COL": [
			({x,y}) => ({x, y: (y-1)}),
			({x,y}) => ({x, y: (y+1)}),
		],
		"ROW": [
			({x,y}) => ({x: (x-1), y}),
			({x,y}) => ({x: (x+1), y}),
		],
	}
	return func[lineType][rightDown];
}

// Tries to attack an enemy boat by following two adjacent rows or columns
// Returns a boolean signal of whether to stay in attack mode or not
function aiAttack() {
	const getGuesses = (lineSearchFunc) => {
		const BOARD_DIM = utils.grid.BOARD_DIM;
		const candidates =  Array(BOARD_DIM).fill(0).reduce((acum, curr) => {
			const latest = acum[acum.length - 1];
			return [...acum, lineSearchFunc(latest)]
		}, [window.game.cpu.attackItem])
		.filter(({x,y}) => x >= 0 && x < BOARD_DIM && y >= 0 && y < BOARD_DIM)
		.filter(({x,y}) => !window.game.cpu.hits.some(({x: gx, y: gy}) => {
			return x === gx && y === gy
		}))
		// Now we need to filter out any that are misses and after from the line
		// of site, as if there is a miss in the line we know all the ones after
		// are not part of the ship
		const filterIndex = candidates.findIndex(({x,y}) =>
			window.game.cpu.guesses.some(({x: gx, y: gy}) => x === gx && y === gy)
		)
		// console.log({filterIndex,candidates})
		return filterIndex > -1 ? candidates.splice(0,filterIndex) : candidates;
	}
	const tryRightDown = Math.random() < 0.5 ? 0 : 1;
	let lineFunc = aiGetAttackFunc(window.game.cpu.attackItem.line, tryRightDown);
	let validGuesses = getGuesses(lineFunc);
	//	console.log({validGuesses})
	if (validGuesses.length) {
		// We have a valid guess we can try
		aiMakeGuess(validGuesses[0]);
		return true;
	} else {
		// console.log({validGuesses})
		// We don't have valid guesses, but we can try the other direction
		lineFunc = aiGetAttackFunc(window.game.cpu.attackItem.line, tryRightDown === 0 ? 1 : 0);
		validGuesses = getGuesses(lineFunc);
		if (validGuesses.length === 0) {
			// Still no more valid guesses, so stop guessing along this line
			// console.log("No more valid guesses on this line")
			delete window.game.cpu.attackItem;
			return false;
		} else {
			// We have a valid guess we can try
			aiMakeGuess(validGuesses[0]);
			return true;
		}
	}
}
