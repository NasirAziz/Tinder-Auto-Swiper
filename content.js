let shouldContinueSwiping = true;
let intervalId;
let pauseIntervalId;
let timeToNextSwipe;

function simulateHumanBehavior() {
	return new Promise((resolve, reject) => {
		const randomSpacePresses = Math.floor(Math.random() * 3) + 1; // Generates 1, 2, or 3 space presses
		console.log('randomSpacePresses', randomSpacePresses);

		for (let i = 0; i < randomSpacePresses; i++) {
			let timeout = i == 0 ? 1000 : i * 1000;
			setTimeout(() => {
				document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32, which: 32, code: 'Space' })); // 32 is the keyCode for space
				document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32, which: 32, code: 'Space' }));

				// Check if the current iteration is the last one
				console.log('setTimeout', i, timeout);
				if (i === randomSpacePresses - 1) {
					resolve();
				}
			}, timeout); // Space out the key presses by 1600 ms each
		}
	});
}

async function checkProfileAndSwipe() {
	const isSearchingForProfiles =
		document.getElementsByClassName(
			'beacon__circle Pos(a) Bd Bdrs(50%) T(10px) Start(10px) Sq(80px) Animdur(4s) Animic(i) Animtf(l) Bdc($c-beacon-gray) Bgc($c-beacon-gray)'
		).length != 0;

	{
		isSearchingForProfiles ? console.log('Searching for profiles!') : null;
	}

	if (shouldContinueSwiping && !isSearchingForProfiles) {
		console.log('Before simulateHumanBehavior');
		await simulateHumanBehavior();
		console.log('After simulateHumanBehavior');

		console.log('timeToNextSwipe', timeToNextSwipe);
		const viewProfileButton = document.getElementsByClassName(
			'P(0) Trsdu($normal) Sq(28px) Bdrs(50%) Cur(p) Ta(c) Scale(1.2):h CenterAlign M(a) focus-button-style'
		)[0];

		if (viewProfileButton) viewProfileButton.click();

		setTimeout(() => {
			// Perform the swipe logic here
			performSwipeLogic();
		}, timeToNextSwipe);
	}
}

function performSwipeLogic() {
	const languagesDiv = document.getElementsByClassName('Bgc($c-ds-background-primary) Fxg(1) Z(1) Pb(100px)');

	if (languagesDiv && languagesDiv.length > 0) {
		const nameInfo = document.getElementsByClassName(
			'Typs(display-1-strong) Fxs(1) Fxw(w) Pend(8px) M(0) D(i)'
		);

		let shouldSwipeRight = false;
		[...languagesDiv]
			.filter((a) => a.textContent.includes('Languages I Know'))
			.forEach((a) => {
				if (!shouldSwipeRight) {
					shouldSwipeRight = a.textContent.includes('Russian') || a.textContent.includes('Ukrainian');
				}
			});
		console.log('Name Info:', nameInfo.length > 0 ? nameInfo[0].textContent : nameInfo);
		if (!shouldSwipeRight && nameInfo && nameInfo.length > 0) {
			const cyrillicPattern = /[\u0400-\u04FF]/;
			console.log('Cyrillic Pattern:', cyrillicPattern.test(nameInfo[0].textContent));
			if (cyrillicPattern.test(nameInfo[0].textContent)) {
				shouldSwipeRight = true;
			}
		}

		if (shouldSwipeRight) {
			swipeRight();
		} else {
			swipeLeft();
		}
	}
}

// Function to simulate right swipe
function swipeRight() {
	const rightSwipeButtonParent = document.getElementsByClassName('Bgi($g-ds-overlay-profile-button-gamepad)');
	if (rightSwipeButtonParent && rightSwipeButtonParent.length > 0) {
		const rightSwipeButton = rightSwipeButtonParent[0].querySelector('div > div > div:nth-child(4) > button');
		rightSwipeButton.click();
		// console.log('Swiped right');
	}
}

// Function to simulate left swipe
function swipeLeft() {
	const leftSwipeButtonParent = document.getElementsByClassName('Bgi($g-ds-overlay-profile-button-gamepad)');

	if (leftSwipeButtonParent && leftSwipeButtonParent.length > 0) {
		const leftSwipeButton = leftSwipeButtonParent[0].querySelector('div > div > div:nth-child(2) > button');
		leftSwipeButton.click();
		// console.log('Swiped left');
	}
}

async function startAutoSwiping() {
	if (shouldContinueSwiping) {
		checkProfileAndSwipe();
		let result = await chrome.storage.local.get(['speed']);
		let speedInSeconds = result.speed || 5; // Default to 5s if not set // Base swipe speed in seconds
		// Randomize the time before next swipe
		timeToNextSwipe = (parseInt(speedInSeconds) + (Math.floor(Math.random() * 3) - 1)) * 1000;
		console.log('timeToNextSwipe', timeToNextSwipe);
		intervalId = setInterval(checkProfileAndSwipe, timeToNextSwipe + 4200); // user given random time plus time to swip images then send in another request
	}
}

function pauseSwiping() {
	clearInterval(intervalId);
	setTimeout(() => {
		if (shouldContinueSwiping) {
			startAutoSwiping(); // Resume swiping after pause
		}
	}, 15 * 60 * 1000); // Pause for 15 minutes
}

function handleRegularBreaks() {
	pauseIntervalId = setInterval(pauseSwiping, 60 * 60 * 1000); // Pause every hour
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'start') {
		shouldContinueSwiping = true;
		startAutoSwiping();
		handleRegularBreaks();
	}
	if (message.command === 'stop') {
		shouldContinueSwiping = false;
		intervalId = undefined;
		clearInterval(intervalId);
		clearInterval(pauseIntervalId);
	}
});

// Start swiping when the script loads
startAutoSwiping();
handleRegularBreaks();
