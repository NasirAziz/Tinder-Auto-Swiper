chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'start') {
		chrome.storage.session.get(['isContentScriptAdded'], function (result) {
			const isContentScriptAdded = result.isContentScriptAdded;
			if (isContentScriptAdded) {
				chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
					for (let tab of tabs) {
						chrome.tabs.sendMessage(tab.id, { command: 'start' }, function (res) {
							if (
								chrome.runtime.lastError &&
								chrome.runtime.lastError.includes('Receiving end does not exist')
							) {
								insertContentJsScript();
							}
						});
					}
				});
			} else {
				insertContentJsScript();
			}
		});

		chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
			if (tabs.length > 0) startCountdown(parseInt(message.hours));
		});

		// startCountdown(parseInt(message.hours));
	} else if (message.command === 'stopTimer') {
		stopCountdown('Countdown stopped.');
	}
});

function insertContentJsScript() {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		chrome.storage.session.set({ isContentScriptAdded: true }, () => {
			for (let tab of tabs)
				chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ['content.js'],
				});
		});
	});
}

chrome.alarms.onAlarm.addListener((alarm) => {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		for (let tab of tabs) {
			chrome.tabs.sendMessage(tab.id, { command: 'stop' });
			stopCountdown('Time is up!');
		}
	});
});

// Listen for tabs being closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		if (tabs.length == 0) {
			chrome.storage.session.set({ isContentScriptAdded: false });
			// chrome.storage.local.set({ endTime: null });
			stopCountdown('Tinder Tabs Closed!');
		}
	});
});

let countdownInterval;

function startCountdown(hours = 1, endTime = null) {
	if (!endTime) endTime = Date.now() + hours * 3600000;

	chrome.storage.local.set({
		endTime,
	});

	clearInterval(countdownInterval);
	countdownInterval = setInterval(function () {
		let msLeft = endTime - Date.now();
		if (msLeft <= 0) {
			clearInterval(countdownInterval);
			// document.getElementById('timer').textContent = 'Time is up!'
			chrome.runtime.sendMessage({
				command: 'updateTimer',
				timerValue: 'Time is up!',
			});
			chrome.storage.local.set({
				endTime: null,
			});
			return;
		}
		let hours = Math.floor(msLeft / 3600000);
		msLeft %= 3600000;
		let minutes = Math.floor(msLeft / 60000);
		msLeft %= 60000;
		let seconds = Math.floor(msLeft / 1000);
		chrome.runtime.sendMessage({
			command: 'updateTimer',
			timerValue: `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`,
		});

		// document.getElementById(
		// 	'timer'
		// ).textContent = `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`
	}, 1000);
}

function stopCountdown(msg) {
	clearInterval(countdownInterval);
	// document.getElementById('timer').textContent = 'Countdown stopped.'
	chrome.runtime.sendMessage({
		command: 'updateTimer',
		timerValue: msg,
	});
	chrome.storage.local.set({
		endTime: null,
	});
}
