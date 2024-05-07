let speed = 750;
let shouldContinueSwiping = true;
let intervalId;

// Main function to check profile and swipe
function checkProfileAndSwipe() {
	if (shouldContinueSwiping) {
		const viewProfileButton = document.getElementsByClassName(
			'P(0) Trsdu($normal) Sq(28px) Bdrs(50%) Cur(p) Ta(c) Scale(1.2):h CenterAlign M(a) focus-button-style'
		)[0];

		if (viewProfileButton) viewProfileButton.click();

		setTimeout(() => {
			const languagesDiv = document.getElementsByClassName(
				'Bgc($c-ds-background-primary) Fxg(1) Z(1) Pb(100px)'
			);

			if (languagesDiv && languagesDiv.length > 0) {
				// Obtain profile information
				const nameInfo = document.getElementsByClassName(
					'Typs(display-1-strong) Fxs(1) Fxw(w) Pend(8px) M(0) D(i)'
				)[0].innerHTML;

				let shouldSwipeRight = false;

				// Check if language contains Russian or Ukrainian
				[...languagesDiv]
					.filter((a) => a.textContent.includes('Languages I Know'))
					.forEach((a) => {
						if (!shouldSwipeRight)
							shouldSwipeRight = a.textContent.includes('Russian') || a.textContent.includes('Ukrainian');
					});

				// Check if name is in Cyrillic script
				if (!shouldSwipeRight && nameInfo) {
					// Regex to check for Cyrillic script
					const cyrillicPattern = /[\u0400-\u04FF]/;
					if (cyrillicPattern.test(nameInfo.textContent)) {
						shouldSwipeRight = true;
					}
				}

				// Swipe right or left based on the conditions
				if (shouldSwipeRight) {
					swipeRight();
				} else {
					swipeLeft();
				}
			}
		}, speed / 1.5);

		// const observer = new MutationObserver(function (mutations, mutationInstance) {
		// 	const languagesDiv = document.getElementsByClassName(
		// 		'Bgc($c-ds-background-primary) Fxg(1) Z(1) Pb(100px)'
		// 	);
		// 	if (languagesDiv && languagesDiv.length > 0) {
		// 		// Obtain profile information
		// 		const languageInfo = languagesDiv[0].querySelector('div:nth-child(5) > div > div'); // Change '.language-class' to the actual class
		// 		const nameInfo = document.getElementsByClassName(
		// 			'Typs(display-1-strong) Fxs(1) Fxw(w) Pend(8px) M(0) D(i)'
		// 		)[0].innerHTML; // Change '.name-class' to the actual class

		// 		let shouldSwipeRight = false;

		// 		// Check if language contains Russian or Ukrainian
		// 		if (
		// 			languageInfo &&
		// 			(languageInfo.textContent.includes('Russian') || languageInfo.textContent.includes('Ukrainian'))
		// 		) {
		// 			shouldSwipeRight = true;
		// 		}

		// 		// Check if name is in Cyrillic script
		// 		if (!shouldSwipeRight && nameInfo) {
		// 			// Regex to check for Cyrillic script
		// 			const russianNamePattern = /[\u0400-\u04FF]/;
		// 			if (russianNamePattern.test(nameInfo.textContent)) {
		// 				shouldSwipeRight = true;
		// 			}
		// 		}

		// 		// Swipe right or left based on the conditions
		// 		if (shouldSwipeRight) {
		// 			swipeRight();
		// 		} else {
		// 			swipeLeft();
		// 		}

		// 		mutationInstance.disconnect();
		// 	}
		// });

		// observer.observe(document, {
		// 	childList: true,
		// 	subtree: true,
		// });
	}
}

// Function to simulate right swipe
function swipeRight() {
	const rightSwipeButtonParent = document.getElementsByClassName('Bgi($g-ds-overlay-profile-button-gamepad)');
	if (rightSwipeButtonParent && rightSwipeButtonParent.length > 0) {
		const rightSwipeButton = rightSwipeButtonParent[0].querySelector('div > div > div:nth-child(4) > button');
		rightSwipeButton.click();
		console.log('Swiped right');
	}
}

// Function to simulate left swipe
function swipeLeft() {
	const leftSwipeButtonParent = document.getElementsByClassName('Bgi($g-ds-overlay-profile-button-gamepad)');

	if (leftSwipeButtonParent && leftSwipeButtonParent.length > 0) {
		const leftSwipeButton = leftSwipeButtonParent[0].querySelector('div > div > div:nth-child(2) > button');
		leftSwipeButton.click();
		console.log('Swiped left');
	}
}

// Repeatedly check profiles at intervals based on speed setting
async function startAutoSwiping() {
	let result = await chrome.storage.local.get(['speed']);
	speed = result.speed || 750; // Default to 750 ms if not set
	intervalId = setInterval(checkProfileAndSwipe, speed);
}

// Listen for messages from background or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'start') {
		// console.log('Starting auto swiper...');
		shouldContinueSwiping = true;
		startAutoSwiping();
	}
	if (message.command === 'stop') {
		// console.log('Stopping auto swiper...');
		shouldContinueSwiping = false;
		clearInterval(intervalId); // This may need a more robust implementation to clear correctly
	}
});

// Start swiping when the script loads
startAutoSwiping();
