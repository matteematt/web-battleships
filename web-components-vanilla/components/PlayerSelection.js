const playerSelectionTemplate = document.createElement('template')

const playerSelectionOptions = [
	{ type: 0, name: "Two Players", ico: 'assets/User-Add-256.png'},
	{ type: 1, name: "Easy CPU", ico: 'assets/Laugh-256.png'},
	{ type: 2, name: "Med CPU", ico: 'assets/Angry-256.png'},
	{ type: 3, name: "Hard CPU", ico: 'assets/Devil-256.png'},
]

playerSelectionTemplate.innerHTML = `
<style>
.players {
	background-color: var(--primary-colour-two);
	border-radius: var(--section-radius);
	padding: 1rem;
}
.grid {
	display: grid;
	grid-template-columns: repeat(${playerSelectionOptions.length}, 1fr);
	gap: 2rem;
}
.grid-item {
	background-color: var(--primary-colour-three);
	border-radius: var(--section-radius);
	padding: 10px;
}
.grid-item:hover {
	background-color: var(--colour-hover);
}
.grid-item img {
	object-fit: contain;
	width: 10rem;
}
.grid-item h3 {
	font-size: 2rem;
}
@media only screen and (orientation: portrait) {
	.grid {
		grid-template-columns: 1fr 1fr;
	}
}
</style>
<div class="players">
	<h2>Choose VS</h2>
	<div class="grid">
		${playerSelectionOptions.map(({name, ico}) =>
			`<div class="grid-item">
				<h3>${name}</h3>
				<img src="${ico}"></img>
			</div>`
		).join(" ")}
	</div>
</div>
`;

class PlayerSelection extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(playerSelectionTemplate.content.cloneNode(true))
	}

	makeVsSelection(element) {
		const filtered = playerSelectionOptions.filter(({name}) =>
			name === element.querySelector('h3').innerHTML
		)
		const selectionVal = filtered.length ? filtered[0].type : playerSelectionOptions[0].type;
		window.game.settings['vs'] = selectionVal;
		if (selectionVal === 0) {
			// Need to add menu for two players
			const newMenuItem = document.createElement('div');
			newMenuItem.classList = 'place-fleet-2';
			newMenuItem.innerHTML = "<fleet-placement player='1'></fleet-placement>"
			utils().container.addMenu('.place-fleet', newMenuItem);
		}
		utils().container.transition({to: 'next', scroll: 'lock'});
	}

	connectedCallback() {
		this.shadowRoot.querySelectorAll('.grid-item').forEach((item) => {
			item.addEventListener('click', () => this.makeVsSelection(item));
			item.addEventListener('click', () => utils().sfx.play(utils().sfx.FX.CLICK_SMALL));
		})
	}
}

window.customElements.define('player-selection', PlayerSelection);
