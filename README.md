![masonry](https://i.imgur.com/AVeTw1M.png)

# masonry - credits for [Momchil Georgiev](https://github.com/fristys).

A simple masonry library written in TypeScript.

The masonry library we need, but don't deserve. Uses pure JavaScript and should be compatible with most browsers.

## Installation

npm

```bash
npm i @gyurielf/masonry
```

yarn

```bash
yarn add @gyurielf/masonry
```

## Usage

```typescript
import { Masonry } from '@gyurielf/masonry';

const options = { gutter: 1.5, gutterUnit: 'rem', columnBreakpoints: { 960: 2, 740: 1 } };
const masonry = new Masonry(document.getElementById('masonry'), options);
```

## Options

`columns: number` _(default: `4`)_ the number of columns to render. Column widths are calculated via percentage - `gutter` (`calc((100 / columns)% - gutter)`).

`gutter: number` _(default: `10`)_ the size of the gutter between columns and rows.

`gutterUnit: string` _(default `px`)_ the unit of measurement to use when applying the gutter to the masonry grid (could be any valid unit of measurement `px`, `%`, `rem`, `em`, etc.)

`columnBreakpoints: Record<number, number>` _(default `undefined`)_ Most Masonry scenarios require some form of responsiveness. Setting this property allows you to set the number of columns to be used for different viewport width(s) in the format of `{ [width: number]: [columns: number] }`. Example:

```typescript
// viewports with the width of <= 920 will get 2 columns
// viewports with the width of <= 740 will get 1 column
// Any other viewport width will get whatever value you've set for `columns`
const columnBreakpoints = { 960: 2, 740: 1 };
```

`gutterBreakpoints: Record<number, number>` _(default `undefined`)_ Most Masonry scenarios require some form of responsiveness. Setting this property allows you to set the number of columns to be used for different viewport width(s) in the format of `{ [width: number]: [gutter: number] }`. Example:

```typescript
// viewports with the width of <= 920 will get 10 (gutterUnit) gutter
// viewports with the width of <= 740 will get 30 (gutterUnit) gutter
// Any other viewport width will get whatever value you've set for `gutter`
const gutterBreakpoints = { 960: 10, 740: 30 };
```

`initOnImageLoad: boolean` _(default: `false`)_ Will initialize the Masonry exactly after all the images inside the container are loaded. This is done in an event-based way, so no need for any Promise polyfills or 3rd party libraries.

`loadingClass: string` _(default: `masonry-loading`)_ Loading class to add to the Masonry container whilst waiting for images inside it to load. This is done with the idea that you might want to hide the container before its images are loaded and Masonry initialized. Example:

```css
#masonry {
  transition: opacity 0.25s;
}

#masonry.masonry-loading {
  opacity: 0;
}
```

`loadedClass: string` _(default: `masonry-loaded`)_ Class to add to the Masonry container after it's done loading.

`onInit: () => void` An optional callback for when the Masonry is finished calculating and setting itself up. _NB: this is called every time `init()` is called to recalculate things_

`bindOnScroll: boolean` _(default: `true`)_ Controls whether the event listener for reintialization on `window.resize` is bound or not. If you don't want responsive columns, you may also not want to have the Masonry listening to `window.resize` needlessly.

`useContainerWidth: boolean` _(default: `false`)_ Should the Masonry use the container's width instead of the viewport's width when calculating responsive column count?

`trackItemSizeChanges: boolean` _(default: `false`)_ Should the Masonry track the changes in size for all the items inside of it and re-initialize on size change? This uses [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), if you want to use this feature and support legacy browsers, it's a good idea to add a polyfill for it to your project.

## API

`constructor(private masonryContainer: any, options?: MasonryOptions)`
The constructor. `masonryContainer` can be any valid DOM node / Element. When called it automatically initializes the masonry using `masonryContainer` as the container element and binds `init()` (debounced) on window resize (see `dispose()` on how to clear said binding, if needed).

`init(): void`
Recalculates and initializes all the masonry columns. Called on object construction and window resize. If you need to re initialize your grid for some reason, you can call this method to do so.

`dispose(): void`
Unbinds all DOM event listeners bound by this Masonry instance. If you're using this library inside of a framework, you should probably call this method during your destroy lifecycle hook (`onDestroy()`, `destroyed()`, `componentWillUnmount()`, etc.).
