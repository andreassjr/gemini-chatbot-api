// ============= DOM Elements =============
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// ============= State Management =============
let conversationHistory = [];
let isLoading = false;

// ============= Event Listeners =============
form.addEventListener('submit', handleFormSubmit);

// ============= Form Submission Handler =============
async function handleFormSubmit(e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;
  if (isLoading) return; // Prevent multiple requests

  // Add user message to chat and history
  appendMessage('user', userMessage);
  conversationHistory.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show thinking indicator
  const thinkingElement = appendMessage('bot', 'Thinking...');
  isLoading = true;

  try {
    // Prepare API request payload
    const payload = {
      conversation: conversationHistory,
    };

    // Send request to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // Parse response
    const data = await response.json();

    // Validate response structure
    if (!data.result) {
      throw new Error('Invalid response format: missing result property');
    }

    // Remove thinking message and add AI response
    thinkingElement.remove();
    appendMessage('bot', data.result);

    // Add AI response to conversation history
    conversationHistory.push({ role: 'model', text: data.result });
  } catch (error) {
    // Handle errors
    console.error('Chat error:', error);
    thinkingElement.textContent =
      error.message.includes('Failed to fetch') || error.message.includes('fetch')
        ? 'Failed to get response from server.'
        : 'Sorry, no response received.';
  } finally {
    isLoading = false;
  }
}

// ============= DOM Manipulation =============
/**
 * Appends a message to the chat box
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - Message text
 * @returns {HTMLElement} - The created message element
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  // Parse markdown for bot messages, plain text for user
  if (sender === 'bot') {
    msg.innerHTML = marked.parse(text);
  } else {
    msg.textContent = text;
  }
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
