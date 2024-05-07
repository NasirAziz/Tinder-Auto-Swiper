chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.command === 'start') {
		chrome.storage.session.get(['isContentScriptAdded'], function (result) {
			const isContentScriptAdded = result.isContentScriptAdded;
			if (isContentScriptAdded) {
				chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
					for (let tab of tabs) {
						chrome.tabs.sendMessage(tab.id, { command: 'start' });
					}
				});
			} else {
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
		});
	}
});

chrome.alarms.onAlarm.addListener((alarm) => {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		for (let tab of tabs) {
			chrome.tabs.sendMessage(tab.id, { command: 'stop' });
		}
	});
});

// Listen for tabs being closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
		if (tabs.length == 0) chrome.storage.session.set({ isContentScriptAdded: false });
	});
});
