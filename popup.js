document.addEventListener('DOMContentLoaded', function () {
  const summaryBtn = document.getElementById('summary-btn');
  const insightsBtn = document.getElementById('insights-btn');

  // Attach click handlers to the buttons
  summaryBtn.addEventListener('click', () => {
    captureDOMAndSendToChatGPT('Generate a summary of the webpage content.');
  });

  insightsBtn.addEventListener('click', () => {
    captureDOMAndSendToChatGPT('Generate the top 3 insights from the webpage content.');
  });

  // Function to capture DOM content and send the appropriate prompt to ChatGPT
  function captureDOMAndSendToChatGPT(prompt) {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Capture the DOM content using scripting API
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: captureDOMContent
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            const content = results[0].result;

            // Send the captured content and the prompt to background.js
            chrome.runtime.sendMessage(
              {
                action: 'sendToChatGPT',
                content: content,
                prompt: prompt
              },
              (response) => {
                if (response && response.success) {
                  // Inject the response as an overlay on the page
                  chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: displayResponseOverlay,
                    args: [response.chatGPTResponse]  // Pass the ChatGPT response to the overlay
                  });
                } else {
                  alert("Failed to get response from ChatGPT.");
                }
              }
            );
          } else {
            alert("Failed to capture content.");
          }
        }
      );
    });
  }

  // Function to capture the DOM content (executed on the active tab)
  function captureDOMContent() {
    return document.body.innerText;  // Capture the entire body text of the page
  }

  // Function to display the ChatGPT response as an overlay
  function displayResponseOverlay(responseText) {
    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'chatgpt-response-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';

    // Create the content box
    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = 'white';
    contentBox.style.padding = '20px';
    contentBox.style.borderRadius = '8px';
    contentBox.style.maxWidth = '600px';
    contentBox.style.maxHeight = '80%';
    contentBox.style.overflowY = 'auto';
    contentBox.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    contentBox.style.fontFamily = 'Arial, sans-serif';
    contentBox.style.fontSize = '14px';
    contentBox.innerText = responseText;

    // Append the content box to the overlay
    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);

    // Close the overlay when clicking outside the content box or pressing the 'Esc' key
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.body.removeChild(overlay);
      }
    });
  }
});