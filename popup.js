// This script captures DOM content from the active tab and displays it in the popup.

document.addEventListener('DOMContentLoaded', function () {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Execute a script to capture the DOM content from the active tab
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: captureDOMContent
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            const content = results[0].result;
            document.getElementById('content').textContent = content;
          } else {
            document.getElementById('content').textContent = "Failed to capture content.";
          }
        }
      );
    });
  });
  
  // This function will be injected into the active tab to capture the DOM content.
  function captureDOMContent() {
    return document.body.innerText;  // You can modify this to capture different parts of the DOM if needed.
  }