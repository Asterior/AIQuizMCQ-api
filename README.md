# QuiPro 🎯 — AI Clipboard Quiz Answer Bot

**QuiPro** is a blazing-fast MCQ quiz assistant that reads your clipboard content, detects copied questions, and instantly displays the correct option (A/B/C/D) in a floating overlay.

No clicks. No lag. Just copy and win.

---

## ⚡ Features

- 📋 **Clipboard Monitoring**: Automatically detects copied text.
- 🧠 **AI-Powered Accuracy**: Uses Google Gemini API (1.5 Pro) to generate MCQ answers.
- 💡 **Overlay Answer View**: Shows a circular floating answer bubble (A/B/C/D) on your screen.
- 🔥 **Fast Response**: Typically answers within **2–3 seconds**.
- 🛑 **No Explanations**: Only gives the correct option — perfect for speed.
- 🕒 **Rate Limiting & Cooldown**: Smart handling of API limits and cooldowns.
- 🔁 **Multiple API Key Rotation**: Supports switching between multiple Gemini keys.
- 🧠 **Built-in Caching**: Avoids repeated API calls for the same questions.

---

## 🖥️ How It Works

1. **Copy any MCQ** from any source (PDF, browser, app, etc).
2. QuiPro reads your clipboard.
3. Sends the text to Gemini AI and gets the **correct option only**.
4. Displays it in a **minimal circular overlay** on your screen.
5. Click or press `Esc` to hide the overlay.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Asterior/AIQuizMCQ-api.git
cd Quipro
```

> Replace `your-username` with your GitHub username.

---

### 2. Install Dependencies

Make sure you have **Node.js (v18 or above)** and **npm** installed.

```bash
npm install
```

---

### 3. Setup Environment Variables

Create a `.env` file in the root folder and add your Gemini API key(s):

```env
# For single key
GEMINI_API_KEY=your_gemini_api_key_here

# Or for key rotation (comma separated)
GEMINI_API_KEYS=key1,key2,key3
```

> 🔐 Get your Gemini API key here: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

---

### 4. Run the App (Development Mode)

```bash
npm run dev
```

---

### 5. Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder.

---


---

## 🛠 Tech Stack

- ⚛️ Electron.js (Desktop App Framework)  
- 🧠 Gemini API (AI)  
- 🧩 React.js (Frontend)  
- ⚡ ESBuild (Bundler)  
- 🌐 Node.js

---
## ⚠️ Disclaimer

QuiPro is intended **for educational and research purposes only**.  
The creators are **not responsible** for any misuse of this tool during exams or assessments.  
Use responsibly and at your own risk.

---

## 📜 License

MIT License
