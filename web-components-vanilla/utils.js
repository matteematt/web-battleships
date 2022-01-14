function buildUtils() {
	const buildGrid = () => ({
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
		}
	});
	return {
		grid: buildGrid(),
	}
}

const utils = buildUtils();
