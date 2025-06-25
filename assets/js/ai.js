// ==================== INTENTS & UTILITIES ====================
const intents = [
  {
    keywords: ["what", "site", "about", "purpose", "do", "who", "this", "explain", "you"],
    response: "This site is here to help you with finding the best diabetes-curbing means. Ask away!"
  },
  {
    keywords: ["services", "offer", "options", "features", "tools", "provide"],
    response: "We offer a variety of services. Want to learn more about one?"
  },
  {
    keywords: ["where", "location", "address", "store", "headquarters", "based", "city"],
    response: "Our main office is in [City, Country]."
  },
  {
    keywords: ["hours", "open", "closing", "time", "business", "working"],
    response: "We're open from 9 AM – 6 PM, Monday to Friday."
  },
  {
    keywords: ["contact", "email", "phone", "call", "support", "helpdesk"],
    response: "You can contact us at support@example.com or call 123-456-7890."
  },
  {
    keywords: ["signup", "sign up", "register", "create", "join", "account"],
    response: "Click the 'Sign Up' button at the top right to create your account."
  },
  {
    keywords: ["forgot", "reset", "password", "login", "can't login", "recover"],
    response: "Click 'Forgot Password' on the login page to reset it."
  },
  {
    keywords: ["track", "order", "where", "status", "shipment", "delivery"],
    response: "You can track your order via your account or confirmation email."
  },
  {
    keywords: ["broken", "error", "site", "issue", "problem", "not working", "down"],
    response: "Try refreshing. If issues persist, contact support."
  },
  {
    keywords: ["checkout", "can't checkout", "payment", "buy", "order", "pay", "error"],
    response: "Make sure your payment info is correct. Contact us if issues continue."
  },
  {
    keywords: ["privacy", "safe", "secure", "data", "info", "security"],
    response: "Your data is protected. We don't share it without permission."
  },
  {
    keywords: ["time", "clock", "hour", "now", "current time"],
    response: () => `🕒 It's currently ${new Date().toLocaleTimeString()}`
  },
  {
    keywords: ["today", "date", "day", "what is today", "current date"],
    response: () => `📅 Today is ${new Date().toLocaleDateString()}`
  },
  {
    keywords: ["year", "2025", "now", "current year"],
    response: () => `🗓️ It’s the year ${new Date().getFullYear()}`
  },
  {
    keywords: ["month", "june", "july", "current month"],
    response: () => `🗓️ It's ${new Date().toLocaleString('default', { month: 'long' })}`
  },
  {
    keywords: ["day", "week", "monday", "friday", "today", "weekday"],
    response: () => `📆 It's ${new Date().toLocaleDateString('default', { weekday: 'long' })}`
  },
  {
    keywords: ["joke", "funny", "laugh", "humor", "make me laugh"],
    response: "Why don’t robots panic? Because they always keep their bits together! 😄"
  },
  {
    keywords: ["rock", "paper", "scissors", "play", "game"],
    response: (msg) => playRPS(msg)
  },
  {
    keywords: ["name", "your name", "who are you", "called"],
    response: "You can call me ChatBuddy!"
  },
  {
    keywords: ["robot", "ai", "are you real", "human"],
    response: "I’m a chatbot — smart enough to help, friendly enough to chat! 🤖"
  },
  {
    keywords: ["how are you", "how's it going", "are you okay", "doing well"],
    response: "I’m doing great, thanks for asking! How can I help you today?"
  },
  {
    keywords: ["help", "assist", "can you", "need help", "support"],
    response: "Of course! Just tell me what you need help with."
  },
    {
    keywords: [
      "type 1 diabetes", "type I diabetes", "type1", "t1d", "juvenile diabetes", "autoimmune diabetes",
      "what is type 1", "symptoms of type 1", "causes of type 1", "type 1 signs", "type 1 prevention"
    ],
    response: `
      <h3><u>Type I Diabetes</u></h3>
      <p>
          Type 1 Diabetes is a chronic autoimmune condition where the immune system mistakenly attacks and destroys insulin-producing beta cells in the pancreas. This leads to little or no insulin production, a hormone essential for regulating blood glucose levels.
      </p>
      <h4><i>Causes</i></h4>
      <p>
          Type 1 is primarily caused by an autoimmune reaction. Genetic predisposition, especially involving genes like HLA-DR3 and HLA-DR4, plays a key role. Environmental triggers, such as viral infections (e.g., enteroviruses), might also initiate the autoimmune response. It is important to note that lifestyle factors do not cause Type 1 Diabetes.
      </p>
      <h4><i>Signs and Symptoms</i></h4>
      <p>
          Common symptoms include frequent urination, excessive thirst, unexplained weight loss, fatigue, blurry vision, increased hunger, and slow-healing wounds. In children, new or increased bedwetting may occur.
      </p>
      <h4><i>Prevention</i></h4>
      <p>
          There is currently no known method to prevent Type 1 Diabetes. Research is ongoing into immune therapies and early detection methods in genetically at-risk individuals.
      </p>
    `
  },
  {
    keywords: [
      "type 2 diabetes", "type II diabetes", "type2", "t2d", "adult-onset diabetes", "insulin resistance",
      "what is type 2", "symptoms of type 2", "causes of type 2", "type 2 signs", "type 2 prevention"
    ],
    response: `
      <h3><u>Type II Diabetes</u></h3>
      <p>
          Type 2 Diabetes is a metabolic disorder characterized by insulin resistance and, eventually, reduced insulin production. The body initially produces insulin, but cannot use it effectively.
      </p>
      <h4><i>Causes</i></h4>
      <p>
          Major contributing factors include insulin resistance due to excess abdominal fat, genetic predisposition, and poor lifestyle habits such as an unhealthy diet, physical inactivity, and obesity. Age and family history also increase the risk.
      </p>
      <h4><i>Signs and Symptoms</i></h4>
      <p>
          Symptoms are often similar to those of Type 1 but develop more gradually. They include frequent urination, excessive thirst, fatigue, blurry vision, slow wound healing, and numbness or tingling in the hands and feet. Many people remain asymptomatic in early stages.
      </p>
      <h4><i>Prevention</i></h4>
      <p>
          Type 2 Diabetes is largely preventable through lifestyle changes. Maintaining a healthy weight, eating a balanced diet, exercising regularly, avoiding smoking, and limiting alcohol are effective strategies. Regular health screenings are recommended for individuals at risk.
      </p>
    `
  }
];
// ==================== BOT RESPONSE LOGIC ====================

function getBotResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (const intent of intents) {
    for (const keyword of intent.keywords) {
      if (lowerMsg.includes(keyword)) {
        return typeof intent.response === 'function'
          ? intent.response(userMessage)
          : intent.response;
      }
    }
  }
  return " I'm not sure how to respond to that. Try asking something else...Sorry but Ian is still training me! Soon I will be able to answer all your questions and surpass your expectations 😀";
}

function playRPS(userInput) {
  const options = ['rock', 'paper', 'scissors'];
  const input = userInput.toLowerCase();

  // Try to extract the user's move from the sentence
  const userMove = options.find(opt => input.includes(opt));
  if (!userMove) {
    return "Let’s play Rock, Paper, Scissors! Type your choice: rock, paper, or scissors.";
  }

  // Bot chooses randomly
  const botMove = options[Math.floor(Math.random() * 3)];

  // Determine result
  if (userMove === botMove) {
    return `You chose ${userMove}. I chose ${botMove}. It's a draw!`;
  }

  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };

  const result = winConditions[userMove] === botMove
    ? `You chose ${userMove}. I chose ${botMove}. You win! 🎉`
    : `You chose ${userMove}. I chose ${botMove}. I win! 😎`;

  return result;
}


// ==================== CHATBOT CORE ====================
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const plusBtn = document.getElementById("plusBtn");
const uploadMenu = document.getElementById("uploadMenu");
const imageInput = document.getElementById("imageInput");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const clearBtn = document.getElementById("clearChat");

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("diacare_chat");
  if (saved) {
    chatMessages.innerHTML = saved;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

function saveChat() {
  localStorage.setItem("diacare_chat", chatMessages.innerHTML);
}

clearBtn.addEventListener("click", () => {
  chatMessages.innerHTML = "";
  localStorage.removeItem("diacare_chat");
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  const userDiv = document.createElement("div");
  userDiv.className = "chat-message user";
  userDiv.textContent = userMessage;
  chatMessages.appendChild(userDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  saveChat();

  const response = getBotResponse(userMessage);
  setTimeout(() => {
    const botDiv = document.createElement("div");
    botDiv.className = "chat-message bot";
    botDiv.innerHTML = response;//this allows for html formatting in bot responses
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChat();
  }, 800);

  chatInput.value = "";
});

// ==================== IMAGE LOGIC ====================
plusBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  uploadMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!uploadMenu.contains(e.target) && !plusBtn.contains(e.target)) {
    uploadMenu.classList.remove("show");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    uploadMenu.classList.remove("show");
  }
});

takePhotoBtn.addEventListener("click", () => {
  imageInput.removeAttribute("multiple");
  imageInput.setAttribute("capture", "environment");
  imageInput.click();
});

uploadFileBtn.addEventListener("click", () => {
  imageInput.removeAttribute("capture");
  imageInput.removeAttribute("multiple");
  imageInput.click();
});

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const img = await fileToImage(file);
  const resizedDataUrl = resizeImage(img, 0.5);
  appendImageToChat(resizedDataUrl);
});

function fileToImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function resizeImage(img, scale = 0.5) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function appendImageToChat(dataUrl) {
  const imgBubble = document.createElement("div");
  imgBubble.className = "chat-message user";

  const imgEl = document.createElement("img");
  imgEl.src = dataUrl;
  imgEl.alt = "Uploaded image";
  imgEl.style.maxWidth = "100%";
  imgEl.style.borderRadius = "10px";

  imgBubble.appendChild(imgEl);
  chatMessages.appendChild(imgBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  saveChat();

  setTimeout(() => {
    const botBubble = document.createElement("div");
    botBubble.className = "chat-message bot";
    botBubble.textContent = generateFakeAnalysis();
    chatMessages.appendChild(botBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChat();
  }, 1500);
}

function generateFakeAnalysis() {
  const samples = [
    "🥦 This looks great! A low-glycemic, high-fiber option.",
    "⚠️ This meal may be high in saturated fats or carbs.",
    "🧃 That drink might contain added sugars. Be cautious.",
    "🍗 Lean protein detected. Consider pairing with greens.",
    "🍚 Portion control advised — high starch content detected."
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}
