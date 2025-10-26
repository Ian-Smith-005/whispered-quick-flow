// AI Chat functionality using Lovable AI Gateway
import { supabase } from '../../src/integrations/supabase/client.js';

let conversationHistory = [];
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-health-chat`;

// Initialize chat
export function initializeChat() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const clearChatBtn = document.getElementById('clearChat');

  if (!chatForm || !chatInput || !chatMessages) {
    console.error('Chat elements not found');
    return;
  }

  // Load chat history from localStorage
  loadChatHistory();

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = '';
    await sendMessage(message);
  });

  // Handle clear chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      conversationHistory = [];
      saveChatHistory();
      renderChatMessages();
    });
  }
}

// Send message to AI
async function sendMessage(messageText) {
  const chatMessages = document.getElementById('chatMessages');
  
  // Add user message to history
  conversationHistory.push({
    role: 'user',
    content: messageText
  });

  renderChatMessages();
  saveChatHistory();

  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message bot-message';
  loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    let assistantMessage = '';
    let assistantDiv = null;

    await streamChat({
      messages: conversationHistory,
      token: session.access_token,
      onDelta: (chunk) => {
        assistantMessage += chunk;
        
        // Remove loading indicator on first chunk
        if (assistantDiv === null) {
          loadingDiv.remove();
          assistantDiv = document.createElement('div');
          assistantDiv.className = 'message bot-message';
          assistantDiv.innerHTML = `<p>${assistantMessage}</p>`;
          chatMessages.appendChild(assistantDiv);
        } else {
          assistantDiv.querySelector('p').textContent = assistantMessage;
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
      },
      onDone: () => {
        conversationHistory.push({
          role: 'assistant',
          content: assistantMessage
        });
        saveChatHistory();
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    loadingDiv.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message bot-message error';
    errorDiv.innerHTML = `<p>Sorry, I encountered an error: ${error.message}</p>`;
    chatMessages.appendChild(errorDiv);
  }
}

// Stream chat responses
async function streamChat({ messages, token, onDelta, onDone }) {
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to start chat stream');
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch (e) {
        // Incomplete JSON, put it back
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch (e) { /* ignore */ }
    }
  }

  onDone();
}

// Render chat messages
function renderChatMessages() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  chatMessages.innerHTML = '';

  conversationHistory.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<p>${msg.content}</p>`;
    chatMessages.appendChild(messageDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save chat history to localStorage
function saveChatHistory() {
  localStorage.setItem('diacare_chat_history', JSON.stringify(conversationHistory));
}

// Load chat history from localStorage
function loadChatHistory() {
  const saved = localStorage.getItem('diacare_chat_history');
  if (saved) {
    try {
      conversationHistory = JSON.parse(saved);
      renderChatMessages();
    } catch (e) {
      console.error('Failed to load chat history:', e);
      conversationHistory = [];
    }
  }
}

// CSS for typing indicator
const style = document.createElement('style');
style.textContent = `
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 10px;
  }
  .typing-indicator span {
    width: 8px;
    height: 8px;
    background: #20963b;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-10px); }
  }
  .message.error {
    background: #fee;
    border-left: 3px solid #f00;
  }
`;
document.head.appendChild(style);
