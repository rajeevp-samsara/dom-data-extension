chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendToChatGPT') {
      const content = message.content;
      const prompt = message.prompt;
      sendContentToChatGPT(prompt, sendResponse);
      return true; // Keep the message channel open for async response
    }
  });
  
  async function sendContentToChatGPT(prompt, sendResponse) {
    const apiKey = 'sk-svcacct-ATVuLnKVVON-1JRA9W12HMbBXOPySZuz-6YTuPQnmPTt9j6G1ZH72LpB8IYsq_IYqCdT3BlbkFJn48UScxhz_id3iylnzGTwPVEeVwp-MMei4DP97caI0BKLjnBxxdZFf5Pojg3aP_YQAA'; // Replace with your actual OpenAI API key
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an assistant." },
            { role: "user", content: prompt }
          ],
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const chatGPTResponse = data.choices[0].message.content;
        sendResponse({ success: true, chatGPTResponse: chatGPTResponse });
      } else {
        sendResponse({ success: false, error: data });
      }
    } catch (error) {
      console.error('Network error:', error);
      sendResponse({ success: false, error: error });
    }
  }