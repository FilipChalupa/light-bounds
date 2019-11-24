export type LightBoundsTarget = HTMLElement

export type LightBoundsOnChange = (rect: LightBoundsBoundingRect) => void

export interface LightBoundsBoundingRect {
	top: number
	left: number
	right: number
	bottom: number
	width: number
	height: number
}

interface TargetData {
	target: LightBoundsTarget
	lastScrollRefresh: number
	lastResizeRefresh: number
	rect: LightBoundsBoundingRect
	rootPosition: {
		top: number
		left: number
	}
	onChange: LightBoundsOnChange[]
}

const watchedElements = new Map<LightBoundsTarget, TargetData>()

let lastResizeRefresh = 0
let lastScrollRefresh = 0

function triggerHardUpdate() {
	lastResizeRefresh++
	lastScrollRefresh++
	triggerCallbacks()
}

function triggerSoftUpdate() {
	lastScrollRefresh++
	triggerCallbacks()
}

function initializeWatcher() {
	//@TODO debounce resize
	window.addEventListener('resize', triggerHardUpdate)
	window.addEventListener('scroll', triggerSoftUpdate)
}

function triggerCallbacks() {
	watchedElements.forEach((watchedElement) => {
		if (watchedElement.onChange.length > 0) {
			getLightBoundsWithUpdate(watchedElement)
		}
	})
}

function getLightBoundsWithUpdate(
	watchedElement: TargetData
): LightBoundsBoundingRect {
	let hasRectChanged = false

	if (lastResizeRefresh !== watchedElement.lastResizeRefresh) {
		const { scrollX, scrollY } = window
		const rect = watchedElement.target.getBoundingClientRect()
		hasRectChanged = true
		watchedElement.lastResizeRefresh = lastResizeRefresh
		watchedElement.rootPosition.left = rect.left + scrollX
		watchedElement.rootPosition.top = rect.top + scrollY

		watchedElement.rect.width = rect.width
		watchedElement.rect.height = rect.height
	}

	if (lastScrollRefresh !== watchedElement.lastScrollRefresh) {
		const { scrollX, scrollY } = window
		hasRectChanged = true
		watchedElement.lastScrollRefresh = lastScrollRefresh
		watchedElement.rect.top = watchedElement.rootPosition.top - scrollY
		watchedElement.rect.left = watchedElement.rootPosition.left - scrollX
		watchedElement.rect.right =
			watchedElement.rootPosition.left + watchedElement.rect.width - scrollX
		watchedElement.rect.bottom =
			watchedElement.rootPosition.top + watchedElement.rect.height - scrollY
	}

	if (hasRectChanged) {
		for (let i = 0; i < watchedElement.onChange.length; i++) {
			watchedElement.onChange[i].call(
				watchedElement.target,
				watchedElement.rect
			)
		}
	}
	return watchedElement.rect
}

export function lightBounds(
	target: LightBoundsTarget,
	onChange?: LightBoundsOnChange
): LightBoundsBoundingRect {
	if (watchedElements.size === 0) {
		initializeWatcher()
	}

	if (!watchedElements.has(target)) {
		watchedElements.set(target, {
			target,
			lastScrollRefresh: -1,
			lastResizeRefresh: -1,
			rect: {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: 0,
				height: 0,
			},
			rootPosition: {
				top: 0,
				left: 0,
			},
			onChange: [],
		})
	}
	const watchedElement = watchedElements.get(target)!

	if (onChange) {
		watchedElement.onChange.push(onChange)
	}

	return getLightBoundsWithUpdate(watchedElement)
}
