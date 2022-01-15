function buildUtils() {
	const buildGrid = () => {
		const COLS = ['1','2','3','4','5','6','7','8','9','X'];
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
				return {
					x: COLS.indexOf(gridRef[1]),
					y: ROWS.indexOf(gridRef[0]),
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
	return {
		grid: buildGrid(),
	}
}

const utils = buildUtils();
