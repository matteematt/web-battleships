const gridSquareTemplate = document.createElement('template')

gridSquareTemplate.innerHTML = `
<style>
div.container {
	width: var(--grid-item-size);
	aspect-ratio: 1/1;
	perspective: 1000px;
	position: relative;
}
div.inner {
	position: relative;
	width: 100%;
	height: 100%;
	transition: transform 0.6s;
  transform-style: preserve-3d;
	text-align: center;
}
div.container.flipped div.inner {
	transform: rotateY(180deg);
}
div.base {
	position: absolute;
	width: 100%;
	height: 100%;
	aspect-ratio: 1/1;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
div.front {
	background-color: var(--grid-colour-base);
}
div.front:hover {
	background-color: var(--grid-colour-hover);
}
div.back {
	transform: rotateY(180deg);
}

div.miss {
	background-color: var(--grid-colour-miss);
	color: var(--grid-colour-miss);
}
div.hit {
	background-color: var(--colour-grid-hit);
	color: var(--colour-grid-hit);
}
div.sink {
	background-color: var(--colour-grid-sink);
	color: var(--colour-grid-sink);
}
div.selected {
	background-color: var(--colour-hover);
	color: var(--colour-hover);
}
</style>

<div>
	<div class="container">
		<div class="inner">
			<div class="front base"><p></p></div>
			<div class="back base"><p></p></div>
		</div>
	</div>
</div>
`

class GridSquare extends HTMLElement {
	static get observedAttributes() { return ['status'] }

	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(gridSquareTemplate.content.cloneNode(true));
	}

	setGridText() {
		this.shadowRoot.querySelector('div.front p').innerHTML = this.getAttribute('name');
		this.shadowRoot.querySelector('div.back p').innerHTML = this.getAttribute('name');
	}

	gridItemStatusUpdate(type) {
		this.shadowRoot.querySelector('div.container').classList.add('flipped');
		this.shadowRoot.querySelector('div.back').classList.add(type);
	}

	connectedCallback() {
		this.setGridText();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'status') {
			this.gridItemStatusUpdate(newValue);
		}
	}
}

window.customElements.define('grid-square', GridSquare);
