const gridTemplate = document.createElement('template')

gridTemplate.innerHTML = `
<style>
.grid {
	background-color: var(--primary-colour-two);
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
	background-color: var(--grid-colour-base);
	aspect-ratio: 1/1;
}
.grid-container div:hover {
	background-color: var(--grid-colour-hover);
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
		${utils.grid.grid.map((x) => `<div>${x}</div>`).join('')}
	</div>
</div>
`;


class Grid extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(gridTemplate.content.cloneNode(true));
		// Need to save the reference to the functions used as callbacks so we
		// can de-register the callback if we've already clicked it
		this.gridCallbacks = {};
	}

	clickGridValue(gridElement) {
		if (window.game.settings.gameDone) return;
		const boardNum = parseInt(this.getAttribute('player'));
		if (window.game.settings.playersTurn === boardNum) return;
		const xy = utils.grid.gridRefToXY(gridElement.innerHTML);
		let result = "MISS";
		if (window.game.board[boardNum].some(({x,y}) => x === xy.x && y === xy.y)) {
			window.game.board[boardNum] =
				window.game.board[boardNum].filter(({x,y}) => !(x === xy.x && y === xy.y))
			gridElement.classList.add('hit')
			result = "HIT";
			gridElement.removeEventListener('click', this.gridCallbacks[gridElement.innerHTML]);
			delete this.gridCallbacks[gridElement.innerHTML]
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
		this.shadowRoot.querySelectorAll('.grid-container div').forEach((gridSpace) => {
			this.gridCallbacks[gridSpace.innerHTML] = () => this.clickGridValue(gridSpace)
			gridSpace.addEventListener('click', this.gridCallbacks[gridSpace.innerHTML])
		})
	}
}

window.customElements.define('battleship-grid', Grid);
