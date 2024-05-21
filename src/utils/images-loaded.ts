/**
 * Unbinds the helper imagesLoaded DOM event listeners
 */
function unbindImageLoad($images: HTMLCollectionOf<HTMLImageElement>, callback: () => void): void {
	let iterator = $images.length;

	while (iterator--) {
		$images[iterator].removeEventListener('load', callback);
		$images[iterator].removeEventListener('error', callback);
	}
}

/**
 * Waits for all images inside a DOM node to be loaded
 * and then calls a callback
 */
export function imagesLoaded(container: HTMLElement, callback: () => void): void {
	const $images = container.getElementsByTagName('img');
	const totalImages = $images.length;

	if (!totalImages) {
		callback();

		return;
	}

	let imagesLoadedCount = 0;

	const imageLoadCallback = () => {
		imagesLoadedCount++;

		if (imagesLoadedCount === totalImages) {
			unbindImageLoad($images, imageLoadCallback);
			callback();
		}
	};

	let imagesIterator = totalImages;

	while (imagesIterator--) {
		const $img = $images[imagesIterator];
		const src = $img.getAttribute('src');

		if (src) {
			// Image already loaded
			if ($img.complete) {
				imagesLoadedCount++;
			} else {
				$img.addEventListener('load', imageLoadCallback);
				$img.addEventListener('error', imageLoadCallback);
			}
		} else {
			imagesLoadedCount++;
		}
	}

	if (imagesLoadedCount === totalImages) {
		unbindImageLoad($images, imageLoadCallback);
		callback();
	}
}
