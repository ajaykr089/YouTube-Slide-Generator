# YouTube Slide Generator 🤖

Convert any YouTube educational video into professional presentation slides using **Grok AI** (powered by xAI).

## ✨ Features

- **AI-Powered Analysis**: Grok AI intelligently analyzes video content and extracts key concepts
- **Smart Content Processing**: Automatically removes irrelevant parts (greetings, sponsors, jokes)
- **Topic Detection**: Identifies video type (education, science, business, tech, motivation)
- **Professional Slides**: Creates structured presentations with 3-6 bullet points per slide
- **Multiple Export Formats**:
  - 📄 Markdown (enhanced with speaker notes)
  - 📊 PowerPoint XML structure
  - 🎨 Google Slides JSON format
  - 💾 Structured JSON
  - 📋 Keynote XML structure
- **Speaker Notes**: AI-generated notes for each slide
- **Visual Suggestions**: Icon and visual recommendations per slide

## 🚀 Quick Start

### 1. Get Grok API Key (Free!)
- Visit [console.x.ai](https://console.x.ai/)
- Sign up for a free account
- Generate your API key

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/ajaykr089/YouTube-Slide-Generator.git
cd YouTube-Slide-Generator

# Install dependencies
npm install

# Add your Grok API key
cp .env.local.example .env.local
# Edit .env.local and add: GROK_API_KEY=your_key_here

# Start the development server
npm run dev
```

### 3. Use the Tool
1. Open [http://localhost:3001](http://localhost:3001)
2. Enter video topic and YouTube URL
3. Optionally paste transcript
4. Click "🚀 Generate AI Slides"
5. Export in your preferred format!

## 🎯 Who Is This For?

- **Students**: Convert lectures into study materials
- **Teachers**: Transform educational videos into lesson plans
- **Content Creators**: Repurpose YouTube content for presentations
- **Corporate Trainers**: Create training materials from tutorials
- **Researchers**: Extract key insights from educational content
- **YouTubers**: Convert videos into slide decks

## 🧠 AI Features

- **Intelligent Summarization**: Creates concise, educational content
- **Content Structuring**: Organizes information into logical slide sections
- **Tone Adaptation**: Adjusts writing style based on detected topic
- **Quality Enhancement**: Ensures educational clarity and engagement

## 📦 Output Formats

| Format | Use Case | Description |
|--------|----------|-------------|
| Markdown | Documentation | Enhanced markdown with speaker notes |
| PowerPoint | Presentations | XML structure for PPT import |
| Google Slides | Web presentations | JSON format for Google Slides API |
| JSON | Development | Structured data for custom tools |
| Keynote | Mac presentations | XML structure for Keynote |

## 🔧 Technical Details

- **Framework**: Next.js 14 with App Router
- **AI**: Grok (xAI) via OpenAI-compatible API
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Ready for Vercel, Netlify, or any Node.js host

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Grok AI by xAI**
