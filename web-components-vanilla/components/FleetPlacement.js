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
	background-color: var(--grid-colour-base);
	aspect-ratio: 1/1;
}
.grid-container div:hover,
.grid-container div[hover="true"] {
	background-color: var(--grid-colour-hover);
}
img.form-control {
	background-color: var(--primary-colour-three);
	object-fit: contain;
	width: 3rem;
	padding: 10px;
	border-radius: var(--section-radius);
}
img.form-control:hover {
	background-color: var(--colour-hover);
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
			<div class="placement-control-row">
				<img src="assets/Command-Undo-256.png" class="form-control"/>
				<img src="assets/Command-Redo-256.png" class="form-control"/>
			</div>
			<div class="grid-container">
				${utils.grid.grid.map((x) => `<div>${x}</div>`).join('')}
			</div>
		</div>
	</div>
	<div class="control-row">
		<img src="assets/Road-Left-256.png" class="form-control"></img>
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

		this.placingShipSize = null;
		this.placingShipAnchorSpot = null;
		this.placedShips = {};
		this.placingOrientation = utils.grid.directions.right;
	}

	setupFleetMenuOption() {
		const fleetOptions = fleetTypes[window.game.settings.fleet]
			.reduce((html,{s,n}) =>
			`${html}<div class="fleet-option" size="${s}">
				<h4>${n}</h4>
				<p>Size: ${s}</p>
			</div> `,"")
		this.shadowRoot.querySelector('.fleet-choice').innerHTML = fleetOptions;
		const fleetChoiceElems = this.shadowRoot.querySelectorAll('.fleet-choice div');
		fleetChoiceElems.forEach((elem) => {
			elem.addEventListener('click', () => {
				fleetChoiceElems.forEach((e) => e.removeAttribute('selected'));
				elem.setAttribute('selected','true');
				this.placingShipSize = parseInt(elem.getAttribute("size"));
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

	clearGridItemHover() {
		this.placingShipAnchorSpot = null;
		this.shadowRoot.querySelectorAll('.grid-container div').forEach((elem) => elem.clearAttribute("hover"))
	}

	showGridItemHover(elem) {
		this.placingShipAnchorSpot = elem.innerHTML;
		if (this.placingShipAnchorSpot && this.placingShipSize) {
			console.log(`Run overlay function, ${this.placingShipAnchorSpot}, ${this.placingShipSize}`)
			const anchorXY = utils.grid.gridRefToXY(this.placingShipAnchorSpot);
			const placedAt = Array(this.placingShipSize - 1).fill(0).reduce((acum, _) => {
				const latest = acum[acum.length - 1];
				return [...acum, utils.grid.directionFn[this.placingOrientation](latest)];
			}, [anchorXY])
			console.log(placedAt)
			// TODO: Use findIndex to see if placedAt stays in bounds, or clashes with any placed ships
		}
	}

	placementGridItemCallback() {
		this.shadowRoot.querySelectorAll('.grid-container div').forEach((elem) => {
			elem.addEventListener('mouseenter',() => this.showGridItemHover(elem))
			elem.addEventListener('mouseleave',() => this.clearGridItemHover)
		})
	}

	connectedCallback() {
		this.backButtonCallback();
		this.randomFleetButtonCallback();
		this.placementGridItemCallback();
		this.shadowRoot.querySelector('div.placement-control-row img.form-control:nth-child(1)')
		.addEventListener('click', () => {
			this.placingOrientation = this.placingOrientation > 0 ? this.placingOrientation - 1 : utils.grid.directions.left
		})
		this.shadowRoot.querySelector('div.placement-control-row img.form-control:nth-child(2)')
		.addEventListener('click', () => {
			this.placingOrientation = this.placingOrientation < 3 ? this.placingOrientation + 1 : utils.grid.directions.up
		})
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'fleetnumber') {
			// We are considering a change in fleetNumber attribute to signal a reset of this component
			this.setupFleetMenuOption();
		}
	}
}

window.customElements.define('fleet-placement', FleetPlacement);
