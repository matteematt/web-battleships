let settingsPlayAudio = false;

// Pretty inefficient that we have to execute this every time, but we have to hoist
// utils so we can use it everywhere in the minified bundle. For a real app we'd
// obviously use a build tool
function utils() {
	const buildGridFn = () => {
		const COLS = ['1','2','3','4','5','6','7','8','9','10'];
		const ROWS = ['A','B','C','D','E','F','G','H','I','J'];
		const BOARD_DIM = 10;
		return {
			// Constants
			directionFn: [
				({x,y}) => ({x, y: (y-1)}),
				({x,y}) => ({x: (x+1), y}),
				({x,y}) => ({x, y: (y+1)}),
				({x,y}) => ({x: (x-1), y}),
			],
			directions: {
				up: 0,
				right: 1,
				down: 2,
				left: 3,
			},
			COLS,
			ROWS,
			BOARD_DIM,
			grid: ROWS.map((r) => COLS.map((c) => `${r}${c}`)).flat(),
			/**
			 * Example
			 * @param H2
			 * @return {x: 1, y: 8}
			 */
			gridRefToXY(gridRef) {
				const [_,r,c] = gridRef.match('([A-J]+)([0-9]+)')
				return {
					x: COLS.indexOf(c),
					y: ROWS.indexOf(r),
				}
			},
			/**
			 * Example
			 * @param {x: 1, y: 8}
			 * @return H2
			 */
			gridXYToRef(XY) {
				return `${ROWS[XY.y]}${COLS[XY.x]}`
			},
			/**
			 * Example
			 * @param {x: 1, y: 8}
			 * @return 80
			 */
			gridXYToNthValue: (XY) => XY.y * BOARD_DIM + XY.x,
			/* The revese */
			gridNthValueToXY: (n) => ({
				x: n % BOARD_DIM,
				y: Math.floor(n / BOARD_DIM),
			}),
		}
	};
	const buildContainerFn = () => {
		const getContainer = () => document.querySelector('.game-states-container');
		const containerContentLength = () => getContainer().children.length;
		const updateContainerLength = () => getContainer().style.setProperty('--contains', `${containerContentLength()}`);
		const SCROLL_FORCE_TIME = 500;
		const transition = (options) => {
			// to : next to next screen (prev) to previous
			// scroll : lock to lock vertical scrolling, (unlock) to unlock it
			const { to, scroll } = options;
			const currState = parseInt(getContainer().getAttribute('state')) || 0;
			const nextState = currState + (to === 'next' ? 1 : -1);
			getContainer().style.transform = `translateX(-${
				((100 / containerContentLength()) * nextState) + (currState / 10)
			}%)`
			getContainer().setAttribute('state',nextState);
			if (scroll === 'lock') {
				document.querySelector('html').style['overflow-y'] = 'hidden';
				window.scrollTo({ top: 0, behavior: 'smooth' });
				setTimeout(() => {
					window.scrollTo({ top: 0 });
					document.querySelector('html').style['overflow-y'] = 'hidden';
				}, SCROLL_FORCE_TIME);
			} else {
				document.querySelector('html').style['overflow-y'] = 'auto';
				setTimeout(() => document.querySelector('html').style['overflow-y'] = 'auto', SCROLL_FORCE_TIME);
			}
		};
		// Assumes the item we're adding is after the menu we are currently on
		const addMenu = (afterSelector, element) => {
			const afterElement = document.querySelector(afterSelector);
			if (afterElement === null) throw new Error("Unable to find element in DOM to insert menu after")
			afterElement.after(element);
			updateContainerLength();
		}
		// Assumes the item we're removing is after the menu we are currently on
		const removeMenu = (selector) => {
			const element = document.querySelector(selector);
			if (element === null) {
				console.log(`WARN: Unable to find element to delete ${selector}`)
			} else {
				element.remove();
			}
			updateContainerLength();
		}
		return {
			transition,
			addMenu,
			removeMenu,
		}
	}
	const buildSoundFXFn = () => {
		const FX = {
			SHOOT: 'assets/sfx/shoot.mp3',
			HIT: 'assets/sfx/hit.mp3',
			END: 'assets/sfx/ended.mp3',
			SINK: 'assets/sfx/sink.mp3',
			SPLASH: 'assets/sfx/splash.mp3',
			CLICK_SMALL: 'assets/sfx/click_small.mp3',
			CLICK_BIG: 'assets/sfx/click_big.mp3',
		}
		const play = (fx) => {
			if (!settingsPlayAudio) return;
			if (!Object.keys(FX).map((k) => FX[k]).includes(fx)) throw new Error(`Invalid sfx "${fx}"`)
			let audio = new Audio(fx);
			audio.play();
		}
		const toggleAudio = () => {
			settingsPlayAudio = !settingsPlayAudio;
			return settingsPlayAudio;
		}
		return {
			FX,
			play,
			toggleAudio,
		}
	}
	return {
		grid: buildGridFn(),
		container: buildContainerFn(),
		sfx: buildSoundFXFn(),
	}
}
