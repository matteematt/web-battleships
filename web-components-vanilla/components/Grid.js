const template = document.createElement('template')

const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'X']
const ROWS = ['A','B','C','D','E','F','G','H','I','J']

const grid = ROWS.map((r) => COLS.map((c) => `${r}${c}`)).flat()

template.innerHTML = `
<style>
.grid {
	background-color: var(--section-colour);
	border-radius: 6px;
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
.grid-container div.sel {
	visibility: hidden;
}
</style>
<div class="grid">
	<div class="grid-container">
		${grid.map((x) => `<div>${x}</div>`).join('')}
	</div>
</div>
`;


class Grid extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}

	clickGridValue(gridElement) {
		// TODO: Check whether this is where a ship is
		gridElement.classList.add('sel')
	}

	connectedCallback() {
		this.shadowRoot.querySelectorAll('.grid-container div').forEach((gridSpace) =>
			gridSpace.addEventListener('click', () => this.clickGridValue(gridSpace))
		)
	}
}

window.customElements.define('battleship-grid', Grid);
