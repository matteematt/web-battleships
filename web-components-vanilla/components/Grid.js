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
	gap: var(--grid-gap);
	padding: 11px;
}
.grid-container div {
	padding: 18%;
	background-color: var(--grid-colour-base);
	aspect-ratio: 1/1;
	transform-style: preserve-3d;
}
</style>
<div class="grid">
	<div class="grid-container">
		${utils().grid.grid.map((x) => `<grid-square name="${x}"></grid-square>`).join('')}
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
		this.sfxTimeTimout = 500;
	}

	setNthGridValuesStatus(ns, attribute, className) {
		ns.forEach((n) => {
			this.shadowRoot.querySelector(`grid-square:nth-child(${n+1})`).setAttribute(attribute,'sink')
		})
	}

	performGridHit(boardNum, xy) {
		const attackedShip = window.game.ships[boardNum].filter(({loc}) =>
			loc.some(({x,y}) => x === xy.x && y === xy.y))[0];
		if (!attackedShip) throw new Error("Unable to find attacked ship");
		attackedShip.health -= 1;
		if (attackedShip.health < 1) {
			addMessageToMessageBoard([`Player ${
				window.game.settings.playersTurn === 0 ? "one" : "two"
			} has sank player ${
				window.game.settings.playersTurn === 0 ? "two" : "one"
			}'s "${attackedShip.type}"!`]);
			const locNVals = attackedShip.loc.map((xy) => utils().grid.gridXYToNthValue(xy))
			this.setNthGridValuesStatus(locNVals, 'status', 'sink');
			window.game.ships[boardNum]	= window.game.ships[boardNum].filter(({loc}) =>
				!loc.some(({x,y}) => x === xy.x && y === xy.y))
			setTimeout(() => utils().sfx.play(utils().sfx.FX.SINK), this.sfxTimeTimout);
		}
	}

	clickGridValue(gridElement) {
		if (window.game.settings.gameDone) return;
		if (window.game.settings.playersTurn == this.getAttribute("player")) return;
		utils().sfx.play(utils().sfx.FX.SHOOT);
		const boardNum = parseInt(this.getAttribute('player'));
		if (window.game.settings.playersTurn === boardNum) return;
		const xy = utils().grid.gridRefToXY(gridElement.getAttribute('name'));
		let result = "MISS";
		if (window.game.board[boardNum].some(({x,y}) => x === xy.x && y === xy.y)) {
			window.game.board[boardNum] =
				window.game.board[boardNum].filter(({x,y}) => !(x === xy.x && y === xy.y))
			// gridElement.classList.add('hit')
			gridElement.setAttribute('status','hit')
			result = "HIT";
			gridElement.removeEventListener('click', this.gridCallbacks[gridElement.innerHTML]);
			delete this.gridCallbacks[gridElement.innerHTML]
			setTimeout(() => utils().sfx.play(utils().sfx.FX.HIT), this.sfxTimeTimout);
			this.performGridHit(boardNum, xy);
		} else {
			// gridElement.classList.add('miss')
			gridElement.setAttribute('status','miss')
			setTimeout(() => utils().sfx.play(utils().sfx.FX.SPLASH), this.sfxTimeTimout);
		}
		addMessageToMessageBoard([`Player ${
			window.game.settings.playersTurn === 0 ? "one" : "two"
		} attacks ${gridElement.innerHTML} - ${result}!`]);
		window.game.settings.playersTurn = window.game.settings.playersTurn === 0 ? 1 : 0;
		// game.js
		game.startTurn();
	}

	connectedCallback() {
		this.shadowRoot.querySelectorAll('grid-square').forEach((gridSpace) => {
			this.gridCallbacks[gridSpace.innerHTML] = () => this.clickGridValue(gridSpace)
			gridSpace.addEventListener('click', this.gridCallbacks[gridSpace.innerHTML])
		})
	}
}

window.customElements.define('battleship-grid', Grid);
