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
	gap: var(--grid-gap);
	padding: 11px;
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
button {
	margin: 15px;
}
@media only screen and (orientation: portrait) {
	.container {
		grid-template-columns: 1fr;
	}
	.fleet-choice {
		grid-template-columns: 1fr 1fr 1fr;
	}
}
</style>
<div class="section">
	<h2>Place Fleet</h2>
	<div class="container">
		<div class="menu">
			<h3>Place Fleet</h3>
			<p>Continue by placing all of the following ships:</p>
			<div class="fleet-choice"> </div>
			<hr>
			<p>Randomly place your fleet</p>
			<button class="random-placement">Shuffle</button>
		</div>
		<div class="grid">
			<div class="placement-control-row">
				<img src="assets/Command-Undo-256.png" class="form-control"/>
				<img src="assets/Command-Redo-256.png" class="form-control"/>
				<img src="assets/Check-256.png" class="form-control"/>
			</div>
			<div class="grid-container">
				${utils().grid.grid.map((x) => `<grid-square name="${x}"></grid-square>`).join('')}
			</div>
		</div>
	</div>
	<div class="control-row">
		<img src="assets/Road-Left-256.png" class="form-control"></img>
	</div>
</div>
`;

function setFleetPlacementFleetValue(fleetNumber) {
	[
		document.querySelector('.place-fleet > fleet-placement:nth-child(1)'),
		document.querySelector('.place-fleet-2 > fleet-placement:nth-child(1)'),
	]
		.filter((elem) => elem !== null)
		.map((elem) => elem.setAttribute('fleetnumber',window.game.settings.fleet))
}

// TODO: Should really only use one component just for the grid
class FleetPlacement extends HTMLElement {
	static get observedAttributes() { return ['fleetnumber'] }

	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(fleetPlacementTemplate.content.cloneNode(true));

		this.placedCoordinates = {};
		this.placedShips = [];

		this.placingOrientation = utils().grid.directions.right;
		this.placingShipSize = null;
		this.placingShipAnchorSpot = null;
		this.placedShipNthValues = null;
	}

	setupFleetMenuOption() {
		const fleetOptions = game.fleetTypes[window.game.settings.fleet]
			.reduce((html,{s,n}) =>
			`${html}<div class="fleet-option" size="${s}" type="${n}">
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
				utils().sfx.play(utils().sfx.FX.CLICK_BIG);
			})
		});
		this.placedCoordinates = {};
		this.placedShips = [];
		this.placingShipSize = null;
		this.placingShipAnchorSpot = null;
		this.placedShipNthValues = null;
		this.clearAllGridItemsFrontVals(['hover','sink','miss']);
		this.shadowRoot.querySelectorAll('grid-square').forEach((elem) => {
			elem.shadowRoot.querySelector('div.container').classList.remove('flipped');
			elem.shadowRoot.querySelector('div.back').classList = "back base";
		})
	}

	backButtonCallback() {
		// TODO: Should really make this back button its own component in a real app
		this.shadowRoot.querySelector('.control-row img').addEventListener('click', () => {
			utils().sfx.play(utils().sfx.FX.CLICK_SMALL);
			this.setupFleetMenuOption();
			const scroll = this.getAttribute('player') == "0" ? 'lock' : 'unlock';
			utils().container.transition({to: 'prev', scroll});
		})
	}

	randomFleetButtonCallback() {
		this.shadowRoot.querySelector('.random-placement').addEventListener('click', () => {
			utils().sfx.play(utils().sfx.FX.CLICK_SMALL);
			utils().container.transition({to: 'next', scroll: 'unlock'});
			if (window.game.settings.vs > 0) {
				game.randomBoard(0);
				game.randomBoard(1);
				game.init();
			} else if (this.getAttribute('player') == "0") {
				game.randomBoard(0);
			} else {
				game.randomBoard(1);
				game.init();
			}
		})
	}

	submitShipPlacementChoice() {
		if (this.placedShipNthValues) {
			this.placedCoordinates = this.placedShipNthValues.reduce((all,n) => {
				const placeXY = utils().grid.gridNthValueToXY(n)
				return {...all, [JSON.stringify(placeXY)]: true};
			}, this.placedCoordinates)
			this.setNthGridItemsAttributeValue(this.placedShipNthValues, 'status','selected');
			this.clearAllGridItemsFrontVals(['set'])
			this.placingShipSize = null;
			this.placingShipAnchorSpot = null;
			this.placedShipNthValues = null;
			this.shadowRoot.querySelector('div.fleet-option[selected="true"]').remove();
			// Check if we are now done!
			if (this.shadowRoot.querySelectorAll('div.fleet-option').length === 0) {
				const shipCoords = Object.keys(this.placedCoordinates).map((x) => JSON.parse(x))
				if (window.game.settings.vs > 0) {
					game.setPlayersBoard(0, shipCoords, this.placedShips);
					game.randomBoard(1);
					game.init();
				} else if (this.getAttribute('player') == "0") {
					game.setPlayersBoard(0, shipCoords, this.placedShips);
				} else {
					game.setPlayersBoard(1, shipCoords, this.placedShips);
					game.init();
				}
				utils().container.transition({to: 'next', scroll: 'unlock'});
			}
		}
	}

	getPlacedValuesAndVadility(elem) {
		const anchorXY = utils().grid.gridRefToXY(this.placingShipAnchorSpot);
		const placedAt = Array(this.placingShipSize - 1).fill(0).reduce((acum, _) => {
			const latest = acum[acum.length - 1];
			return [...acum, utils().grid.directionFn[this.placingOrientation](latest)];
		}, [anchorXY])
		const isPlacementValid = placedAt.findIndex(({x,y}) =>
			x < 0 || x >= utils().grid.BOARD_DIM || y < 0 || y >= utils().grid.BOARD_DIM
			|| JSON.stringify({x,y}) in this.placedCoordinates
		) === -1;
		return {placedAt, isPlacementValid}
	}

	setNthGridItemsAttributeValue(ns, attribute, value) {
		ns.forEach((n) => {
			this.shadowRoot.querySelector(`grid-square:nth-child(${n+1})`).setAttribute(attribute,value)
		})
	}


	// When we leave hovering, stop showing any of the hovering indications
	clearAllGridItemsFrontVals(attributes) {
		this.placingShipAnchorSpot = null;
		this.shadowRoot.querySelectorAll('grid-square').forEach((elem) => {
			const elemFront = elem.shadowRoot.querySelector('div.front');
			attributes.forEach((attribute) => elemFront.classList.remove(attribute));
		})
	}

	// When a mouse hovers over an icon, show whether this would be valid or invalid
	showGridItemHover(elem) {
		this.placingShipAnchorSpot = elem.getAttribute('name');
		if (this.placingShipAnchorSpot && this.placingShipSize) {
			const {placedAt, isPlacementValid} = this.getPlacedValuesAndVadility(elem)
			if (isPlacementValid) {
				const placedAtNthVals = placedAt.map((xy) => utils().grid.gridXYToNthValue(xy))
				this.setNthGridItemsAttributeValue(placedAtNthVals, 'front','hover');
			} else {
				const showNthVals = placedAt.filter(({x,y}) =>
					x >= 0 && x < utils().grid.BOARD_DIM && y >= 0 && y < utils().grid.BOARD_DIM
				).map((xy) => utils().grid.gridXYToNthValue(xy))
				this.setNthGridItemsAttributeValue(showNthVals, 'front','sink');
			}
		}
	}

	// When the mouse is clicked on an icon, if the placement is valid the store it temporary until the submit
	// button is clicked
	gridItemSelect(elem) {
		if (this.placingShipAnchorSpot && this.placingShipSize) {
			const {placedAt, isPlacementValid} = this.getPlacedValuesAndVadility(elem)
			if (isPlacementValid) {
				const placingShip = this.shadowRoot.querySelector('.fleet-option[selected="true"]');
				const ship = {
					loc: placedAt,
					health: parseInt(placingShip.getAttribute('size')),
					type: placingShip.getAttribute('type'),
				}
				this.placedShips.push(ship);
				this.clearAllGridItemsFrontVals(['miss'])
				const placedAtNthVals = placedAt.map((xy) => utils().grid.gridXYToNthValue(xy))
				this.setNthGridItemsAttributeValue(placedAtNthVals, 'front','miss');
				this.placedShipNthValues = [...placedAtNthVals];
			}
		}
	}

	placementGridItemCallback() {
		this.shadowRoot.querySelectorAll('grid-square').forEach((elem) => {
			elem.addEventListener('mouseenter',() => this.showGridItemHover(elem))
			elem.addEventListener('mouseleave',() => this.clearAllGridItemsFrontVals(['hover','sink']))
			elem.addEventListener('click',() => this.gridItemSelect(elem))
			elem.addEventListener('click', () => utils().sfx.play(utils().sfx.FX.CLICK_BIG))
		})
	}

	connectedCallback() {
		this.backButtonCallback();
		this.randomFleetButtonCallback();
		this.placementGridItemCallback();
		this.shadowRoot.querySelectorAll('div.placement-control-row img.form-control').forEach((elem) =>
			elem.addEventListener('click', () => utils().sfx.play(utils().sfx.FX.CLICK_SMALL))
		)
		this.shadowRoot.querySelector('div.placement-control-row img.form-control:nth-child(1)')
		.addEventListener('click', () => {
			this.placingOrientation = this.placingOrientation > 0 ? this.placingOrientation - 1 : utils().grid.directions.left
		})
		this.shadowRoot.querySelector('div.placement-control-row img.form-control:nth-child(2)')
		.addEventListener('click', () => {
			this.placingOrientation = this.placingOrientation < 3 ? this.placingOrientation + 1 : utils().grid.directions.up
		})
		this.shadowRoot.querySelector('div.placement-control-row img.form-control:nth-child(3)')
			.addEventListener('click', () => this.submitShipPlacementChoice())

	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'fleetnumber') {
			// We are considering a change in fleetNumber attribute to signal a reset of this component
			this.setupFleetMenuOption();
		}
	}
}

window.customElements.define('fleet-placement', FleetPlacement);
