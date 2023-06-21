
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length > 0) {
                var currentTab = tabs[0];
                var tabUrl = currentTab.url;
                console.log('Current tab URL:', tabUrl);

                if (tabUrl.startsWith('https://chat.openai.com/')) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        function: injectFetch
                    });

                    fetch('https://twitter.com/nansen_ai')
                    console.log('OK');
                }
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message.url);
    fetch(message.url)
    .then(function(response) {
        return response.text();
    })
    .then(function(data) {
        console.log(data);
        sendResponse(data);
    })
    .catch(function(error) {
        console.error(error);
    });

    return true;
});


const injectFetch = function() {
    console.log('Inject')
    document.FreeWebpilotInGPT35Fetch = function() {
        console.log(666);
    }
}
