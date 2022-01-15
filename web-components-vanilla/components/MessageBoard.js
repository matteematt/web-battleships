const messageBoardTemplate = document.createElement('template');

const MAX_DISPLAY_MESSAGES = 6;
const MESSAGES_FONT_SIZE = 1.2;

messageBoardTemplate.innerHTML = `
<style>
.message-board {
	background-color: var(--primary-colour-two);
	border-radius: var(--section-radius);
	padding: 1rem;
	margin-bottom: 2rem;
	min-height: ${MAX_DISPLAY_MESSAGES * MESSAGES_FONT_SIZE * MESSAGES_FONT_SIZE}rem;
}
.message-board li {
	font-size: ${MESSAGES_FONT_SIZE}rem;
}
</style>
<div class="message-board">
	<ul></ul>
</div>
`

function addMessageToMessageBoard(messages) {
	window.game.messages = messages.concat(window.game.messages).slice(0,MAX_DISPLAY_MESSAGES)
	document.querySelector('message-board').setAttribute('messages',window.game.messages.join("|"));
}

function clearMessageboard() {
	window.messages = [];
}

class MessageBoard extends HTMLElement {
	static get observedAttributes() { return ['messages'] }
	constructor() {
		super();
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(messageBoardTemplate.content.cloneNode(true))
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'messages') {
			this.updateMessagesList();
		}
	}

	updateMessagesList() {
		this.shadowRoot.querySelector('ul').innerHTML = `
			${this.getAttribute('messages').split("|").map((msg) =>
				`<li>${msg}</li>`
			).join(" ")}
		`;
	}
}

window.customElements.define('message-board', MessageBoard);
