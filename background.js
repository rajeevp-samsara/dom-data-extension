chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToChatGPT') {
    const content = message.content;
    const prompt = message.prompt;
    sendContentToChatGPT(content, prompt, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function sendContentToChatGPT(content, prompt, sendResponse) {
  const apiKey = 'YOUR_OPENAI_API_KEY';  // Replace with your actual OpenAI API key
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
          { role: "user", content: prompt + "\n\nWebpage Content:\n" + content }
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