const fleetPlacementTemplate = document.createElement('template')

console.log("Hello chap")

fleetPlacementTemplate.innerHTML = `
<style>
.section {
	background-color: var(--section-colour);
	border-radius: var(--section-radius);
	padding: 1rem;
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
.container {
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: 2rem;
}
.menu {
	border-radius: var(--section-radius);
	background-color: var(--item-colour);
}
</style>
<div class="section">
	<h2>Place Fleet</h2>
	<div class="container">
		<div class="menu">
			<h3>Place Fleet</h3>
			<div class="fleet-choice"> </div>
			<br>
			<p>Or randomly place your fleet</p>
			<button class="random-placement">Test</button>
		</div>
		<div class="grid">
			Grid
		</div>
	</div>
	<div class="control-row">
		<img src="assets/Road-Left-256.png"></img>
	</div>
</div>
`;

class FleetPlacement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(fleetPlacementTemplate.content.cloneNode(true));
	}

	connectedCallback() {
		// TODO: Should really make this back button its own component in a real app
		this.shadowRoot.querySelector('.control-row img').addEventListener('click',
			() => document.querySelector('.game-states-container').style.transform = 'translateX(-25.05%)'
		)
	}
}

window.customElements.define('fleet-placement', FleetPlacement);
