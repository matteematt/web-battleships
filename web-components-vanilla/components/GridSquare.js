const gridSquareTemplate = document.createElement('template')


// gridSquareTemplate.innerHTML = `
// <style>
// div.grid-base {
	// padding: 18%;
	// background-color: var(--grid-colour-base);
	// aspect-ratio: 1/1;
// }
// div.grid-base.gone {
	// padding: 18%;
	// background-color: var(--grid-colour-base);
	// aspect-ratio: 1/1;
// }
// div.grid-base:hover {
	// background-color: var(--grid-colour-hover);
// }
// </style>
// <div>
	// <div class="grid-base"><div>
// </div>
// `;

gridSquareTemplate.innerHTML = `
<style>
div.container {
	width: var(--grid-size);
	height: var(--grid-size);
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
div.container:hover div.inner {
	transform: rotateY(180deg);
}
div.base {
	position: absolute;
	width: 100%;
	height: 100%;
	aspect-ratio: 1/1;
	/* padding: 18%; */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
div.front {
	background-color: var(--grid-colour-base);
}
div.back {
	background-color: var(--colour-hover);
	transform: rotateY(180deg);
}
p {
	 /* margin: 5%; */
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
		// this.shadowRoot.querySelector('div.grid-base').classList.add('gone');
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
