document.addEventListener('DOMContentLoaded', function () {
    const summaryBtn = document.getElementById('summary-btn');
    const insightsBtn = document.getElementById('insights-btn');
  
    summaryBtn.addEventListener('click', () => {
      sendContentToChatGPT('Generate a summary of the webpage content.');
    });
  
    insightsBtn.addEventListener('click', () => {
      sendContentToChatGPT('Generate the top 3 insights from the webpage content.');
    });
  
    // Function to capture content and send prompt to ChatGPT
    function sendContentToChatGPT(prompt) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Execute script to capture DOM content
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            function: captureDOMContent
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              const content = results[0].result;
  
              // Send message to background.js to call ChatGPT with the appropriate prompt
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
  
    // Function to capture the DOM content
    function captureDOMContent() {
      return document.body.innerText;
    }
  });
  
  // Function to inject the overlay into the page and display the response
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