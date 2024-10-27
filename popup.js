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
  
            // Send captured content to background.js to process it with ChatGPT
            chrome.runtime.sendMessage(
              {
                action: 'sendToChatGPT',
                content: content,  // Captured content from the DOM
                prompt: `1. Generate Summary\n2. Create the most useful chart\n3. Provide insights based on this data:\n${content}`
              },
              (response) => {
                if (response && response.success) {
                  // Display the response from ChatGPT in the popup
                  document.getElementById('content').textContent = response.chatGPTResponse;
                } else {
                  document.getElementById('content').textContent = "Failed to get response from ChatGPT.";
                }
              }
            );
          } else {
            document.getElementById('content').textContent = "Failed to capture content.";
          }
        }
      );
    });
  });
  
  function captureDOMContent() {
    return document.body.innerText;  // You can modify this to capture different parts of the DOM if needed.
  }