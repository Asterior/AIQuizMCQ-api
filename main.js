const { app, BrowserWindow, clipboard, ipcMain } = require('electron');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require("dotenv").config();

let mainWindow;
let overlayWindow;
let lastClipboardContent = '';
let isProcessing = false;
let lastApiCallTime = 0;
let cooldownUntil = 0;
const API_COOLDOWN = 15000;
const MIN_API_INTERVAL = 300;

// Simple cache for responses
const responseCache = new Map();
const CACHE_SIZE = 50;

// Initialize multiple Gemini API instances
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(key => key);

let currentKeyIndex = 0;
const genAIInstances = API_KEYS.map(key => new GoogleGenerativeAI(key));
const models = genAIInstances.map(genAI => genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.1, // Very low temperature for more direct answers
    topP: 0.1,
    topK: 1,
    maxOutputTokens: 100, // Drastically reduced for faster responses
  }
}));

// MCQ prompt template
const MCQ_PROMPT_TEMPLATE = `You are a quick MCQ solver. Respond with ONLY the correct option letter (A, B, C, or D). No explanations. No other text.
Question: {question}
Your response should be a single letter only.`;

// Function to get the next available API key
function getNextModel() {
  currentKeyIndex = (currentKeyIndex + 1) % models.length;
  return models[currentKeyIndex];
}

// Function to check cache for similar queries
function checkCache(query) {
  return responseCache.get(query);
}

// Function to add to cache
function addToCache(query, response) {
  if (responseCache.size >= CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(query, response);
}

// Function to format MCQ prompt
function formatMCQPrompt(question) {
  return MCQ_PROMPT_TEMPLATE.replace('{question}', question);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 100, // Reduced size for just showing the option
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlayWindow.loadFile('overlay.html');
  overlayWindow.setPosition(100, 100);
  
  overlayWindow.hide();
  
  return new Promise((resolve) => {
    overlayWindow.webContents.on('did-finish-load', () => {
      resolve();
    });
  });
}

async function processClipboardContent() {
  if (isProcessing) return;
  
  const currentTime = Date.now();
  if (currentTime < cooldownUntil) return;

  const currentContent = clipboard.readText();
  if (currentContent === lastClipboardContent || !currentContent.trim()) return;

  if (currentTime - lastApiCallTime < MIN_API_INTERVAL) return;

  if (!overlayWindow) {
    console.error('Overlay window not initialized');
    return;
  }

  isProcessing = true;
  lastClipboardContent = currentContent;

  overlayWindow.webContents.send('show-loading');
  overlayWindow.show();

  try {
    const cachedResponse = checkCache(currentContent);
    if (cachedResponse) {
      overlayWindow.webContents.send('update-answer', cachedResponse);
      lastApiCallTime = currentTime;
      isProcessing = false;
      overlayWindow.webContents.send('hide-loading');
      return;
    }

    let response = null;
    let error = null;
    
    for (let i = 0; i < models.length; i++) {
      try {
        const model = getNextModel();
        const formattedPrompt = formatMCQPrompt(currentContent);
        const result = await model.generateContent(formattedPrompt);
        const responseObj = await result.response;
        response = responseObj.text().trim();
        
        // Validate response is a single letter
        if (!/^[A-D]$/i.test(response)) {
          throw new Error('Invalid response format');
        }
        
        break;
      } catch (e) {
        error = e;
        console.log(`API key ${currentKeyIndex + 1} failed, trying next...`);
        getNextModel();
      }
    }
    
    if (!response) {
      throw error || new Error('All API keys failed');
    }
    
    addToCache(currentContent, response);
    overlayWindow.webContents.send('update-answer', response);
    lastApiCallTime = currentTime;
  } catch (error) {
    console.error('Error processing with Gemini API:', error);
    
    if (error.message && error.message.includes('429')) {
      console.log(`Rate limit hit. Cooling down for ${API_COOLDOWN/1000} seconds...`);
      cooldownUntil = currentTime + API_COOLDOWN;
    }
  } finally {
    isProcessing = false;
    overlayWindow.webContents.send('hide-loading');
  }
}

let clipboardInterval;

app.whenReady().then(async () => {
  createMainWindow();
  await createOverlayWindow();
  
  clipboardInterval = setInterval(() => {
    const currentContent = clipboard.readText();
    if (currentContent !== lastClipboardContent) {
      processClipboardContent();
    }
  }, 50);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});
