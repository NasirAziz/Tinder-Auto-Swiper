let shouldContinueSwiping = true
let intervalId
let pauseIntervalId
let result = await chrome.storage.local.get(['speed'])
let speedInSeconds = result.speed || 1 // Default to 750 ms if not set // Base swipe speed in seconds

function simulateHumanBehavior() {
	const randomSpacePresses = Math.floor(Math.random() * 3) + 1 // Generates 1, 2, or 3 space presses
	for (let i = 0; i < randomSpacePresses; i++) {
		setTimeout(() => {
			document.body.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32 })) // 32 is the keyCode for space
			document.body.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32 }))
		}, i * 200) // Space out the key presses by 200 ms each
	}
}

function checkProfileAndSwipe() {
	if (shouldContinueSwiping) {
		simulateHumanBehavior()

		// Randomize the time before next swipe
		const timeToNextSwipe = (speedInSeconds + (Math.floor(Math.random() * 3) - 1)) * 1000

		setTimeout(() => {
			// Perform the swipe logic here
			performSwipeLogic()
		}, timeToNextSwipe)
	}
}

function performSwipeLogic() {
	const languagesDiv = document.getElementsByClassName(
		'Bgc($c-ds-background-primary) Fxg(1) Z(1) Pb(100px)'
	)

	if (languagesDiv && languagesDiv.length > 0) {
		const nameInfo = document.querySelector(
			'.Typs(display-1-strong) Fxs(1) Fxw(w) Pend(8px) M(0) D(i)'
		)

		let shouldSwipeRight = false
		;[...languagesDiv]
			.filter((a) => a.textContent.includes('Languages I Know'))
			.forEach((a) => {
				if (!shouldSwipeRight) {
					shouldSwipeRight =
						a.textContent.includes('Russian') || a.textContent.includes('Ukrainian')
				}
			})
		console.log('Name Info:', nameInfo)
		if (!shouldSwipeRight && nameInfo) {
			const cyrillicPattern = /[\u0400-\u04FF]/
			console.log('Cyrillic Pattern:', cyrillicPattern.test(nameInfo.textContent))
			if (cyrillicPattern.test(nameInfo.textContent)) {
				shouldSwipeRight = true
			}
			console.log('Swipe Right:', shouldSwipeRight)
		}

		if (shouldSwipeRight) {
			swipeRight()
		} else {
			swipeLeft()
		}
	}
}

// Function to simulate right swipe
function swipeRight() {
	const rightSwipeButtonParent = document.getElementsByClassName(
		'Bgi($g-ds-overlay-profile-button-gamepad)'
	)
	if (rightSwipeButtonParent && rightSwipeButtonParent.length > 0) {
		const rightSwipeButton = rightSwipeButtonParent[0].querySelector(
			'div > div > div:nth-child(4) > button'
		)
		rightSwipeButton.click()
		console.log('Swiped right')
	}
}

// Function to simulate left swipe
function swipeLeft() {
	const leftSwipeButtonParent = document.getElementsByClassName(
		'Bgi($g-ds-overlay-profile-button-gamepad)'
	)

	if (leftSwipeButtonParent && leftSwipeButtonParent.length > 0) {
		const leftSwipeButton = leftSwipeButtonParent[0].querySelector(
			'div > div > div:nth-child(2) > button'
		)
		leftSwipeButton.click()
		console.log('Swiped left')
	}
}

function startAutoSwiping() {
	if (shouldContinueSwiping) {
		intervalId = setInterval(checkProfileAndSwipe, 1000) // Check initially every second
	}
}

function pauseSwiping() {
	clearInterval(intervalId)
	setTimeout(() => {
		if (shouldContinueSwiping) {
			startAutoSwiping() // Resume swiping after pause
		}
	}, 15 * 60 * 1000) // Pause for 15 minutes
}

function handleRegularBreaks() {
	pauseIntervalId = setInterval(pauseSwiping, 60 * 60 * 1000) // Pause every hour
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'start') {
		shouldContinueSwiping = true
		startAutoSwiping()
		handleRegularBreaks()
	}
	if (message.command === 'stop') {
		shouldContinueSwiping = false
		clearInterval(intervalId)
		clearInterval(pauseIntervalId)
	}
})

// Start swiping when the script loads
startAutoSwiping()
handleRegularBreaks()
