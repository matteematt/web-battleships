const gridTemplate = document.createElement('template')

const COLS = ['1','2','3','4','5','6','7','8','9','X']
const ROWS = ['A','B','C','D','E','F','G','H','I','J']

const grid = ROWS.map((r) => COLS.map((c) => `${r}${c}`)).flat()

gridTemplate.innerHTML = `
<style>
.grid {
	background-color: var(--section-colour);
	border-radius: var(--section-radius);
	aspect-ratio: 1/1;
}
.grid-container {
	display: grid;
	grid-template-columns: repeat(10, 1fr);
	gap: 1rem;
	padding: 11px;
}
.grid-container div {
	padding: 18%;
	background-color: blue;
	aspect-ratio: 1/1;
}
.grid-container div:hover {
	background-color: green;
}
.grid-container div.miss {
	visibility: hidden;
}
.grid-container div.hit {
	background-color: red;
	color: red;
}
</style>
<div class="grid">
	<div class="grid-container">
		${grid.map((x) => `<div>${x}</div>`).join('')}
	</div>
</div>
`;

/**
 * Example
 * @param H2
 * @return {x: 1, y: 8}
 */
function gridRefToXY(gridRef) {
	return {
		x: COLS.indexOf(gridRef[1]),
		y: ROWS.indexOf(gridRef[0]),
	}
}

/**
 * Example
 * @param {x: 1, y: 8}
 * @return H2
 */
function gridXYToRef(XY) {
	return `${ROWS[XY.y]}${COLS[XY.x]}`
}

class Grid extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(gridTemplate.content.cloneNode(true));
	}

	clickGridValue(gridElement) {
		if (window.game.settings.gameDone) return;
		const boardNum = parseInt(this.getAttribute('player'));
		if (window.game.settings.playersTurn === boardNum) return;
		const xy = gridRefToXY(gridElement.innerHTML);
		let result = "MISS";
		if (window.game.board[boardNum].some(({x,y}) => x === xy.x && y === xy.y)) {
			window.game.board[boardNum] =
				window.game.board[boardNum].filter(({x,y}) => !(x === xy.x && y === xy.y))
			gridElement.classList.add('hit')
			result = "HIT";
		} else {
			gridElement.classList.add('miss')
		}
		addMessageToMessageBoard([`Player ${
			window.game.settings.playersTurn === 0 ? "one" : "two"
		} attacks ${gridElement.innerHTML} - ${result}!`]);
		window.game.settings.playersTurn = window.game.settings.playersTurn === 0 ? 1 : 0;
		// game.js
		startTurn();
	}

	connectedCallback() {
		this.shadowRoot.querySelectorAll('.grid-container div').forEach((gridSpace) =>
			gridSpace.addEventListener('click', () => this.clickGridValue(gridSpace))
		)
	}
}

window.customElements.define('battleship-grid', Grid);
