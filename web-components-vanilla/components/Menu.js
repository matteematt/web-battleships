const menuTemplate = document.createElement('template')

menuTemplate.innerHTML = `
<style>
.control-row {
	position: absolute;
	right: 2rem;
	text-align: right;
	top: 1rem;
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
</style>
<div class="settings-menu">
	<div class="control-row">
		<img src="assets/Volume-Speaker-01-256.png"></img>
	</div>
</div>
`

class Menu extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(menuTemplate.content.cloneNode(true))
	}

	sfxButton() {
		const img = this.shadowRoot.querySelector('div.control-row img:nth-child(1)');
		img.addEventListener('click', () => {
			const isNotMuted = utils.sfx.toggleAudio();
			if (isNotMuted) {
				img.src = 'assets/Volume-Speaker-02-256.png';
				utils.sfx.play(utils.sfx.FX.CLICK_BIG);
			} else {
				img.src = 'assets/Volume-Speaker-01-256.png';
			}
		})
	}

	connectedCallback() {
		this.sfxButton();
	}
}

window.customElements.define('settings-menu', Menu);
