chrome.storage.local.get(['speed', 'hours'], function (result) {
	const speed = result.speed || 750; // Default to 500 ms if not set
	const hours = result.hours || 1; // Default to 1 hour if not set
	document.getElementById('speed').setAttribute('value', speed);
	document.getElementById('hours').setAttribute('value', hours);
});

document.getElementById('start').addEventListener('click', () => {
	// validate inputs from user
	let speed = document.getElementById('speed').value;
	if (parseInt(speed) < 750) {
		document.getElementById('speedError').textContent = 'Minimun Recommended Speed is 750 ms';
		return;
		// speed = 750;
		// document.getElementById('speed').setAttribute('value', speed);
	}
	let hours = document.getElementById('hours').value;
	if (parseInt(hours) < 1) {
		hours = 1;
		document.getElementById('hours').setAttribute('value', hours);
	}
	////////

	chrome.storage.local.set({ speed, hours }, () => {
		chrome.alarms.create({ delayInMinutes: parseInt(hours) * 60 });
		chrome.runtime.sendMessage({ command: 'start' });
		startCountdown(parseInt(hours));
	});
});

document.getElementById('stop').addEventListener('click', () => {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		for (let tab of tabs) {
			chrome.tabs.sendMessage(tab.id, { command: 'stop' });
		}
		stopCountdown();
	});
});

chrome.storage.onChanged.addListener((changes, areaName) => {
	debugger;
});

let countdownInterval;

function startCountdown(hours) {
	let endTime = Date.now() + hours * 3600000;
	countdownInterval = setInterval(function () {
		let msLeft = endTime - Date.now();
		if (msLeft <= 0) {
			clearInterval(countdownInterval);
			document.getElementById('timer').textContent = 'Time is up!';
			return;
		}
		let hours = Math.floor(msLeft / 3600000);
		msLeft %= 3600000;
		let minutes = Math.floor(msLeft / 60000);
		msLeft %= 60000;
		let seconds = Math.floor(msLeft / 1000);
		document.getElementById(
			'timer'
		).textContent = `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`;
	}, 1000);
}

function stopCountdown() {
	clearInterval(countdownInterval);
	document.getElementById('timer').textContent = 'Countdown stopped.';
}
