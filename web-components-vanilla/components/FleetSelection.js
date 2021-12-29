const fleetSelectionTemplate = document.createElement('template')

const fleetSelectionOptions = [
	{ type: 0, name: "Two Players", ico: 'assets/User-Add-256.png'},
	{ type: 1, name: "Easy CPU", ico: 'assets/Laugh-256.png'},
	{ type: 2, name: "Med CPU", ico: 'assets/Angry-256.png'},
	{ type: 3, name: "Hard CPU", ico: 'assets/Devil-256.png'},
]

fleetSelectionTemplate.innerHTML = `
<style>
.players {
	background-color: var(--section-colour);
	border-radius: var(--section-radius);
	padding: 1rem;
}
.grid {
	display: grid;
	grid-template-columns: repeat(${fleetSelectionOptions.length}, 1fr);
	gap: 2rem;
}
.grid-item {
	background-color: var(--item-colour);
	border-radius: var(--section-radius);
}
.grid-item:hover {
	background-color: var(--item-colour-hover);
}
.grid-item img {
	object-fit: contain;
	width: 50%;
	height: 55%;
}
.grid-item p {
	font-size: 2rem;
}
.control-row {
	text-align: left;
}
.control-row img {
	background-color: var(--item-colour);
	object-fit: contain;
	width: 3rem;
	padding: 10px;
	border-radius: var(--section-radius);
}
.control-row img:hover {
	background-color: var(--item-colour-hover);
}
</style>
<div class="players">
	<h2>Choose Fleets</h2>
	<div class="grid">
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

	connectedCallback() {
		this.shadowRoot.querySelector('.control-row img').addEventListener('click',
			() => document.querySelector('.game-states-container').style.left = 0
		)
	}
}

window.customElements.define('fleet-selection', FleetSelection);
