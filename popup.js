document.addEventListener('DOMContentLoaded', function () {
  const summaryBtn = document.getElementById('summary-btn');
  const insightsBtn = document.getElementById('insights-btn');

  // Attach click handlers to the buttons
  summaryBtn.addEventListener('click', () => {
    captureDOMAndSendToChatGPT('Generate a concise summary of the webpage content.');
  });

  insightsBtn.addEventListener('click', () => {
    captureDOMAndSendToChatGPT('Generate the top 3 insights from the webpage content and state them in a concise manner.');
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

  
  // Function to display the ChatGPT response as an overlay with improved UI
  function displayResponseOverlay(responseText) {
    // Check if an overlay already exists, if so, remove it first
    const existingOverlay = document.getElementById('chatgpt-response-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'chatgpt-response-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';
    overlay.style.transition = 'opacity 0.3s ease-in-out';
    overlay.style.opacity = '0'; // Start with hidden overlay
    document.body.appendChild(overlay);

    // Fade-in effect
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);

    // Create the content box
    const contentBox = document.createElement('div');
    contentBox.style.backgroundColor = '#fff';
    contentBox.style.padding = '20px';
    contentBox.style.borderRadius = '20px';
    contentBox.style.maxWidth = '600px';
    contentBox.style.width = '90%';
    contentBox.style.maxHeight = '80%';
    contentBox.style.overflowY = 'auto';
    contentBox.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.2)';
    contentBox.style.fontFamily = 'InterVariable';
    contentBox.style.fontSize = '14px';
    contentBox.style.lineHeight = '1.6';
    contentBox.style.color = '#333';
    contentBox.style.position = 'relative';

    // Add the ChatGPT response text
    const contentText = document.createElement('p');
    contentText.innerText = responseText;
    contentBox.appendChild(contentText);

    // Add the close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    closeButton.style.transition = 'color 0.3s ease';
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.color = '#d9534f'; // Red hover effect
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = '#333';
    });
    closeButton.addEventListener('click', () => {
      overlay.style.opacity = '0'; // Fade-out effect
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    });

    // Append the close button to the content box
    contentBox.appendChild(closeButton);

    // Append the content box to the overlay
    overlay.appendChild(contentBox);

    // Close the overlay when clicking outside the content box or pressing the 'Esc' key
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.style.opacity = '0'; // Fade-out effect
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        overlay.style.opacity = '0'; // Fade-out effect
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      }
    });
  }
});