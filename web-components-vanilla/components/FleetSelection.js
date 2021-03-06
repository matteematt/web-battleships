const fleetSelectionTemplate = document.createElement('template')

const fleetSelectionOptions = [
	{ type: 0, name: "Classic", ico: 'assets/Ship-02-256.png', desc: 'Carrier (5), Battleship (4), Destroyer (3), Submarine (3), Patrol (2)'},
	{ type: 1, name: "Age of Sail", ico: 'assets/Sailor-Wheel-256.png', desc: '4 x Ship of the Line (4), Corvette (3), 2 x Privateer (2)'},
	{ type: 2, name: "Modern", ico: 'assets/Ship-01-256.png', desc: 'Carrier (5), 2 x Warship (4), Frigate (3), Missle Submarine (1)'},
]

fleetSelectionTemplate.innerHTML = `
<style>
.players {
	background-color: var(--primary-colour-two);
	border-radius: var(--section-radius);
	padding: 1rem;
}
.grid {
	display: grid;
	grid-template-columns: repeat(${fleetSelectionOptions.length}, 1fr);
	gap: 2rem;
}
.grid-item {
	background-color: var(--primary-colour-three);
	border-radius: var(--section-radius);
}
.grid-item:hover {
	background-color: var(--colour-hover);
}
.grid-item img {
	object-fit: contain;
	width: 50%;
	height: 40%;
}
.grid-item h3 {
	font-size: 2rem;
}
.control-row {
	margin-top: 1rem;
	text-align: left;
}
.control-row img {
	background-color: var(--primary-colour-three);
	object-fit: contain;
	width: 3rem;
	padding: 10px;
	border-radius: var(--section-radius);
}
.control-row img:hover {
	background-color: var(--colour-hover);
}
@media only screen and (orientation: portrait) {
	.grid-item img {
		width: 40%;
		height: 20%;
	}
}
</style>
<div class="players">
	<h2>Choose Fleets</h2>
	<div class="grid">
		${fleetSelectionOptions.map(({name, ico, desc}) =>
			`<div class="grid-item">
				<h3>${name}</h3>
				<img src="${ico}"></img>
				<p>${desc}</p>
			</div> `
		).join(" ")}
	</div>
	<div class="control-row">
		<img src="assets/Road-Left-256.png"></img>
	</div>
</div>
`;

class FleetSelection extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(fleetSelectionTemplate.content.cloneNode(true))
	}

	makeFleetSelection(element) {
		const filtered = fleetSelectionOptions.filter(({name}) =>
			name === element.querySelector('h3').innerHTML
		)
		const selectionVal = filtered.length ? filtered[0].type : fleetSelectionOptions[0].type;
		window.game.settings['fleet'] = selectionVal;
		// FleetPlacement.js
		setFleetPlacementFleetValue(selectionVal);
		utils().container.transition({to: 'next', scroll: 'unlock'});
	}

	connectedCallback() {
		this.shadowRoot.querySelector('.control-row img').addEventListener('click', () => {
			utils().container.removeMenu('.place-fleet-2');
			utils().container.transition({to: 'prev', scroll: 'lock'});
			utils().sfx.play(utils().sfx.FX.CLICK_SMALL);
		})
		this.shadowRoot.querySelectorAll('.grid-item').forEach((elem) => {
			elem.addEventListener('click', () => this.makeFleetSelection(elem))
			elem.addEventListener('click', () => utils().sfx.play(utils().sfx.FX.CLICK_SMALL));
		})
	}
}

window.customElements.define('fleet-selection', FleetSelection);
