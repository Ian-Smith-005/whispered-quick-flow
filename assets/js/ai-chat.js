// AI Chat functionality using Lovable AI Gateway
import { supabase } from '../../src/integrations/supabase/client.js';
import { formatAIResponse } from './ai-response-formatter.js';
import { VoiceRecorder } from './voice-recorder.js';

let conversationHistory = [];
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-health-chat`;

// Initialize chat
export function initializeChat() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const clearChatBtn = document.getElementById('clearChat');
  const plusBtn = document.getElementById('plusBtn');
  const uploadMenu = document.getElementById('uploadMenu');
  const voiceBtn = document.querySelector('.voice-btn');
  const imageInput = document.getElementById('imageInput');

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

  // Handle attach button (plus button)
  if (plusBtn && uploadMenu) {
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadMenu.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!uploadMenu.contains(e.target) && e.target !== plusBtn) {
        uploadMenu.classList.remove('show');
      }
    });

    // Handle file upload options
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const takePhotoBtn = document.getElementById('takePhotoBtn');

    if (uploadFileBtn && imageInput) {
      uploadFileBtn.addEventListener('click', () => {
        imageInput.removeAttribute('capture');
        imageInput.click();
        uploadMenu.classList.remove('show');
      });
    }

    if (takePhotoBtn && imageInput) {
      takePhotoBtn.addEventListener('click', () => {
        imageInput.setAttribute('capture', 'environment');
        imageInput.click();
        uploadMenu.classList.remove('show');
      });
    }

    // Handle image selection
    if (imageInput) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await handleImageUpload(file);
        imageInput.value = '';
      });
    }
  }

  // Handle voice recording
  if (voiceBtn) {
    let voiceRecorder = null;
    let isRecording = false;

    voiceBtn.addEventListener('click', async () => {
      if (!isRecording) {
        // Start recording
        voiceRecorder = new VoiceRecorder(
          (transcript) => {
            chatInput.value = transcript;
            isRecording = false;
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Voice';
            voiceBtn.classList.remove('recording');
          },
          (error) => {
            alert(error);
            isRecording = false;
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Voice';
            voiceBtn.classList.remove('recording');
          }
        );
        
        await voiceRecorder.startRecording();
        isRecording = true;
        voiceBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
        voiceBtn.classList.add('recording');
      } else {
        // Stop recording
        voiceRecorder.stopRecording();
        isRecording = false;
        voiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      }
    });
  }
}

// Handle image upload for analysis
async function handleImageUpload(file) {
  const chatMessages = document.getElementById('chatMessages');
  
  try {
    // Show uploading message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerHTML = '<p><i class="fas fa-image me-2"></i>Analyzing uploaded image...</p>';
    chatMessages.appendChild(userDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Convert to base64
    const base64Image = await fileToBase64(file);

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Call meal analysis endpoint
    const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-meal-image`;
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }

    const result = await response.json();
    
    // Show analysis result
    userDiv.remove();
    const resultDiv = document.createElement('div');
    resultDiv.className = 'message bot-message';
    resultDiv.innerHTML = `
      <div class="mb-2"><strong>📸 Image Analysis Result:</strong></div>
      <div style="font-size: 0.9rem;">
        <strong>${result.analysis.mealName || 'Meal Detected'}</strong><br>
        <em>Calories:</em> ${result.analysis.nutrition?.calories || 'N/A'} kcal<br>
        <em>Carbs:</em> ${result.analysis.nutrition?.carbohydrates || 'N/A'}g<br>
        <em>Glycemic Impact:</em> <span class="badge bg-${result.analysis.glycemicImpact === 'low' ? 'success' : result.analysis.glycemicImpact === 'high' ? 'danger' : 'warning'}">${result.analysis.glycemicImpact || 'Unknown'}</span>
      </div>
    `;
    chatMessages.appendChild(resultDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (error) {
    console.error('Image upload error:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message bot-message error';
    errorDiv.innerHTML = `<p>Sorry, I couldn't analyze that image: ${error.message}</p>`;
    chatMessages.appendChild(errorDiv);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
          assistantDiv.innerHTML = formatAIResponse(assistantMessage);
          chatMessages.appendChild(assistantDiv);
        } else {
          assistantDiv.innerHTML = formatAIResponse(assistantMessage);
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
    if (msg.role === 'assistant') {
      messageDiv.innerHTML = formatAIResponse(msg.content);
    } else {
      messageDiv.innerHTML = `<p>${msg.content}</p>`;
    }
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
