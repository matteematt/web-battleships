const playerSelectionTemplate = document.createElement('template')
playerSelectionTemplate.innerHTML = `
<p>PlayerSelection</p>
`;

class PlayerSelection extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(playerSelectionTemplate.content.cloneNode(true))
	}
}

window.customElements.define('player-selection', PlayerSelection);
