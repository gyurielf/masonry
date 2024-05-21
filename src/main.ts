import { debounce } from './utils/debounce.js';
import { imagesLoaded } from './utils/images-loaded.js';
import { Errors } from './models/errors.model.js';
import type { MasonryOptions } from './models/options.interface.js';

export class Masonry {
	private columns = 4;

	private columnBreakpoints: Record<number, number> | null = null;

	private gutterBreakpoints: Record<number, number> | null = null;

	private gutter = 10;

	private gutterUnit = 'px';

	private loadingClass = 'masonry-loading';

	private initOnImageLoad = false;

	private loadedClass = 'masonry-loaded';

	private onInit!: () => void;

	private bindOnScroll = true;

	private useContainerWidth = false;

	private trackItemSizeChanges = false;

	private sizeObservers!: { observer: ResizeObserver; target: Element }[];

	constructor(private masonryContainer: HTMLElement, options?: MasonryOptions) {
		if (!this.masonryContainer) throw new Error(Errors.containerDoesNotExist);

		this.setOptions(options);

		if (this.initOnImageLoad) {
			this.initOnAllImagesLoaded();
		} else {
			this.init();
		}

		// DOM Event bindings
		this.bindEvents();
	}

	/**
	 * (Re)Calculates and sets the Masonry
	 */
	init() {
		this.resetAllPositions();
		this.setItemPositions();
		this.masonryContainer.classList.remove(this.loadingClass);
		this.masonryContainer.classList.add(this.loadedClass);
	}

	/**
	 * Unbinds all DOM events bound by this Masonry instance
	 */
	dispose() {
		if (this.bindOnScroll) window.removeEventListener('resize', this.initDebounced.bind(this));
		if (this.trackItemSizeChanges) this.unbindItemSizeTracking();
	}

	/**
	 * Sets all overrides for this instance depending on `options`
	 */
	private setOptions(options: MasonryOptions | undefined) {
		this.setOptionIfExists(options, 'columns');
		this.setOptionIfExists(options, 'columnBreakpoints');
		this.setOptionIfExists(options, 'gutter');
		this.setOptionIfExists(options, 'gutterUnit');
		this.setOptionIfExists(options, 'loadingClass');
		this.setOptionIfExists(options, 'initOnImageLoad');
		this.setOptionIfExists(options, 'loadedClass');
		this.setOptionIfExists(options, 'onInit');
		this.setOptionIfExists(options, 'bindOnScroll');
		this.setOptionIfExists(options, 'useContainerWidth');
		this.setOptionIfExists(options, 'trackItemSizeChanges');
		this.setOptionIfExists(options, 'gutterBreakpoints'); // Add gutterBreakpoints
	}

	/**
	 * Overrides an option for this instance if it exists in the `options` object
	 */
	private setOptionIfExists<K extends keyof MasonryOptions>(options: MasonryOptions | undefined, prop: K) {
		if (options && Object.prototype.hasOwnProperty.call(options, prop)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this[prop] as any) = options[prop];
		}
	}

	/**
	 * Calls this.init() with a debounce
	 */
	private initDebounced = debounce(this.init.bind(this));

	/**
	 * DOM Event bindings
	 */
	private bindEvents() {
		if (this.bindOnScroll) window.addEventListener('resize', this.initDebounced.bind(this));
		if (this.trackItemSizeChanges) this.bindItemSizeTracking();
	}

	/**
	 * Waits for all images inside the masonry container to be loaded
	 * and then calls `this.init()`
	 */
	private initOnAllImagesLoaded() {
		this.masonryContainer.classList.remove(this.loadedClass);
		this.masonryContainer.classList.add(this.loadingClass);

		imagesLoaded(this.masonryContainer, () => {
			this.init();
			this.masonryContainer.classList.remove(this.loadingClass);
			this.masonryContainer.classList.add(this.loadedClass);
		});
	}

	/**
	 * Calculates and sets all the positional styling values
	 */
	private setItemPositions() {
		const [columns, gutter] = this.getOptionsForViewportSize();
		const gutterUnit = this.gutterUnit;
		const totalGutterWidth = (columns - 1) * gutter;
		const columnWidth = `calc((100% - ${totalGutterWidth}${gutterUnit}) / ${columns})`;

		this.masonryContainer.style.position = 'relative';

		// Divide all items into rows
		const $items = this.masonryContainer.children;

		const rows: HTMLElement[][] = [];

		const itemsLength = $items.length;
		let itemsIterator = 0;

		while (itemsIterator < itemsLength) {
			const nextIndex = itemsIterator + columns;
			rows.push([].slice.call($items, itemsIterator, nextIndex));
			itemsIterator = nextIndex;
		}

		// Iterate over items row by row
		const rowsLength = rows.length;
		let rowsIterator = 0;
		let containerHeight = 0;

		while (rowsIterator < rowsLength) {
			const row = rows[rowsIterator];

			// Iterate over the columns in this row
			const rowLength = row.length;
			let colsIterator = 0;

			while (colsIterator < rowLength) {
				const col = row[colsIterator];

				// Set position and width
				col.style.position = 'absolute';
				col.style.width = columnWidth;

				// Set top value to 0 if this is the first row
				if (rowsIterator === 0) {
					col.style.top = '0';
				} else {
					// Set top value to the top + height of the column above this one
					const prevRowSibling = rows[rowsIterator - 1][colsIterator];

					if (prevRowSibling) {
						const siblingTop = parseInt(getComputedStyle(prevRowSibling).top, 10);
						col.style.top = `calc(${siblingTop + prevRowSibling.offsetHeight}px + ${gutter}${gutterUnit})`;
					}
				}

				// Set left value to 0 if this is the first column in the row
				if (colsIterator === 0) {
					col.style.left = '0';
				} else {
					// Set left value to width + gutters of previous column in this row
					const prevCol = row[colsIterator - 1];
					col.style.left = `calc(${parseInt(getComputedStyle(prevCol).left, 10) + prevCol.offsetWidth}px + ${gutter}${gutterUnit})`;
				}

				const columnHeight = col.getBoundingClientRect().top + col.offsetHeight;

				if (containerHeight < columnHeight) containerHeight = columnHeight;

				colsIterator++;
			}

			rowsIterator++;
		}

		// Setting the container height to the tallest column's height
		if (this.masonryContainer.getBoundingClientRect().top >= 0) {
			this.masonryContainer.style.height = `calc(${containerHeight - this.masonryContainer.getBoundingClientRect().top}px + ${gutter}${gutterUnit})`;
		}

		// On init callback
		if (this.onInit) this.onInit();
	}

	/**
	 * Resets all positional styling values inside this Masonry instance
	 */
	private resetAllPositions() {
		this.masonryContainer.style.position = '';
		this.masonryContainer.style.height = '';

		const $children = this.masonryContainer.children;
		let len = $children.length;

		while (len--) {
			const item = $children[len];
			if (item instanceof HTMLElement) {
				item.style.top = '';
				item.style.left = '';
				item.style.width = '';
				item.style.position = '';
			}
		}
	}

	/**
	 * Gets the number of columns & gutter for the current viewport size / container size
	 * depending on settings
	 */
	private getOptionsForViewportSize() {
		if (!this.columnBreakpoints && !this.gutterBreakpoints) return [this.columns, this.gutter];
		let columns = this.columns;
		let gutter = this.gutter;

		const viewportWidth = this.useContainerWidth ? this.masonryContainer.offsetWidth : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (this.columnBreakpoints) {
			const columnKeys = Object.keys(this.columnBreakpoints)
				.map(Number)
				.sort((a, b) => a - b);

			let columnKeysIterator = 0;
			while (columnKeysIterator < columnKeys.length) {
				const breakpoint = columnKeys[columnKeysIterator];
				const newColumns = this.columnBreakpoints[columnKeys[columnKeysIterator]];
				if (viewportWidth < breakpoint) {
					columns = newColumns;
					break;
				}
				columnKeysIterator++;
			}
		}

		if (this.gutterBreakpoints) {
			const getterKeys = Object.keys(this.gutterBreakpoints)
				.map(Number)
				.sort((a, b) => a - b);

			let gutterKeysIterator = 0;
			while (gutterKeysIterator < getterKeys.length) {
				const breakpoint = getterKeys[gutterKeysIterator];
				const newGutter = this.gutterBreakpoints[getterKeys[gutterKeysIterator]];
				if (viewportWidth < breakpoint) {
					gutter = newGutter;
					break;
				}
				gutterKeysIterator++;
			}
		}
		return [columns, gutter];
	}

	private bindItemSizeTracking() {
		if (!('ResizeObserver' in window)) {
			console.warn(Errors.resizeObserverNotSupported);
			return;
		}

		if (!this.sizeObservers) this.sizeObservers = [];

		const $items = this.masonryContainer.children;
		let iterator = $items.length;

		while (iterator--) {
			const target = $items[iterator];
			const observer = new ResizeObserver(this.initDebounced.bind(this));

			observer.observe($items[iterator]);

			this.sizeObservers.push({ observer, target });
		}
	}

	private unbindItemSizeTracking() {
		if (!('ResizeObserver' in window)) {
			console.warn(Errors.resizeObserverNotSupported);
			return;
		}

		let iterator = this.sizeObservers.length;

		while (iterator--) {
			const { observer, target } = this.sizeObservers[iterator];
			observer.unobserve(target);
		}
	}
}
