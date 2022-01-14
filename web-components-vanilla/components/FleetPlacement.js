const fleetPlacementTemplate = document.createElement('template')

fleetPlacementTemplate.innerHTML = `
<style>
.section {
	background-color: var(--primary-colour-two);
	border-radius: var(--section-radius);
	padding: 1rem;
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
.container {
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: 2rem;
}
.menu {
	border-radius: var(--section-radius);
	background-color: var(--primary-colour-three);
}
.menu hr {
	width: 95%;
}
.fleet-choice {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}
.fleet-choice div {
	background-color: var(--primary-colour-one);
	margin: 1rem;
	border-radius: var(--section-radius);
}
.fleet-choice div:hover,
.fleet-choice div[selected="true"] {
	background-color: var(--colour-hover);
}
.grid {
	background-color: var(--primary-colour-three);
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
</style>
<div class="section">
	<h2>Place Fleet</h2>
	<div class="container">
		<div class="menu">
			<h3>Place Fleet</h3>
			<div class="fleet-choice"> </div>
			<hr>
			<p>Randomly place your fleet</p>
			<button class="random-placement">Shuffle</button>
		</div>
		<div class="grid">
			<div class="grid-container">
				${grid.map((x) => `<div>${x}</div>`).join('')}
			</div>
		</div>
	</div>
	<div class="control-row">
		<img src="assets/Road-Left-256.png"></img>
	</div>
</div>
`;

function setFleetPlacementFleetValue(fleetNumber) {
	document.querySelector('fleet-placement').setAttribute('fleetnumber',window.game.settings.fleet);
}

// TODO: Should really only use one component just for the grid
class FleetPlacement extends HTMLElement {
	static get observedAttributes() { return ['fleetnumber'] }
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(fleetPlacementTemplate.content.cloneNode(true));
	}

	setupFleetMenuOption() {
		const fleetOptions = fleetTypes[window.game.settings.fleet]
			.reduce((html,{s,n}) =>
			`${html}<div class="fleet-option">
				<h4>${n}</h4>
				<p>Size: ${s}</p>
			</div> `,"")
		this.shadowRoot.querySelector('.fleet-choice').innerHTML = fleetOptions;
		const fleetChoiceElems = this.shadowRoot.querySelectorAll('.fleet-choice div');
		fleetChoiceElems.forEach((elem) => {
			elem.addEventListener('click', () => {
				fleetChoiceElems.forEach((e) => e.removeAttribute('selected'));
				elem.setAttribute('selected','true');
			})
		});
	}

	backButtonCallback() {
		// TODO: Should really make this back button its own component in a real app
		this.shadowRoot.querySelector('.control-row img').addEventListener('click', () => {
			document.querySelector('.game-states-container').style.transform = 'translateX(-25.05%)';
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => {
				window.scrollTo({ top: 0 });
				document.querySelector('html').style['overflow-y'] = 'hidden';
			}, 1000);
		})
	}

	randomFleetButtonCallback() {
		this.shadowRoot.querySelector('.random-placement').addEventListener('click', () => {
			document.querySelector('.game-states-container').style.transform = 'translateX(-75.225%)';
			// game.js
			setupGameBoard();
		})
	}

	connectedCallback() {
		this.backButtonCallback();
		this.randomFleetButtonCallback();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'fleetnumber') {
			// We are considering a change in fleetNumber attribute to signal a reset of this component
			this.setupFleetMenuOption();
		}
	}
}

window.customElements.define('fleet-placement', FleetPlacement);
