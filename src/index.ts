export interface InitializeLightBoundsOptions {
	container?: Window
	onChange?: () => void
}

export interface LightBoundsBoundingRect {
	top: number
	left: number
	right: number
	bottom: number
	width: number
	height: number
}

export function initializeLightBounds({
	container = window,
	onChange, // @TODO
}: InitializeLightBoundsOptions = {}) {
	function getRect(target: HTMLElement): LightBoundsBoundingRect {
		const rect = target.getBoundingClientRect()
		return {
			top: rect.top,
			left: rect.left,
			right: rect.right,
			bottom: rect.bottom,
			width: rect.width,
			height: rect.height,
		}
	}

	return function getBoundingClientRect(
		target: HTMLElement,
		onChange?: (rect: LightBoundsBoundingRect) => void
	): LightBoundsBoundingRect {
		if (onChange) {
			window.addEventListener('scroll', () => {
				onChange(getRect(target))
			})
		}

		return getRect(target)
	}
}
