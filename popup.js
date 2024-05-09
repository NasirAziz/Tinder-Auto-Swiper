chrome.storage.local.get(['speed', 'hours', 'timer', 'endTime'], function (result) {
	const speed = result.speed || 1 // Default to 1 s if not set
	const hours = result.hours || 1 // Default to 1 hour if not set
	const endTime = result.endTime
	if (endTime) {
		chrome.runtime.sendMessage({ command: 'startTimer', endTime })
	}

	// console.log('endTime', endTime)
	document.getElementById('speed').setAttribute('value', speed)
	document.getElementById('hours').setAttribute('value', hours)
})

document.getElementById('start').addEventListener('click', () => {
	// validate inputs from user
	let speed = document.getElementById('speed').value
	if (parseInt(speed) < 1) {
		document.getElementById('speedError').textContent = 'Minimun Recommended Speed is 1 second'
		return
		// speed = 1;
		// document.getElementById('speed').setAttribute('value', speed);
	}
	let hours = document.getElementById('hours').value
	if (parseInt(hours) < 1) {
		document.getElementById('speedError').textContent = 'Minimun Recommended Hour(s) is 1'
		return
		// hours = 1
		// document.getElementById('hours').setAttribute('value', hours)
	}
	////////

	chrome.storage.local.set({ speed, hours }, () => {
		chrome.alarms.create({ delayInMinutes: parseInt(hours) * 60 })
		chrome.runtime.sendMessage({ command: 'start', hours })
	})
})

document.getElementById('stop').addEventListener('click', () => {
	chrome.runtime.sendMessage({ command: 'stopTimer' })
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		for (let tab of tabs) {
			chrome.tabs.sendMessage(tab.id, { command: 'stop' })
		}
	})
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'updateTimer')
		document.getElementById('timer').textContent = message.timerValue
})
