'use client'

import { useState } from 'react'

interface Slide {
  title: string
  content: string[]
  notes: string
  icon: string
}

export default function Home() {
  const [topic, setTopic] = useState('')
  const [link, setLink] = useState('')
  const [transcript, setTranscript] = useState('')
  const [slides, setSlides] = useState<string>('')
  const [slideData, setSlideData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{topic?: string, link?: string}>({})

  const validateYouTubeUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/
    return pattern.test(url)
  }

  const exportSlides = async (format: string) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: slideData.slides,
          format,
          topicType: slideData.topicType
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'presentation'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export slides. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: {topic?: string, link?: string} = {}

    if (!topic.trim()) {
      newErrors.topic = 'Video topic is required'
    }

    if (!link.trim()) {
      newErrors.link = 'YouTube link is required'
    } else if (!validateYouTubeUrl(link)) {
      newErrors.link = 'Please enter a valid YouTube URL'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-slides', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic, link, transcript }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate slides')
        }

        const data = await response.json()
        setSlides(data.markdown)
        setSlideData(data)
      } catch (error: any) {
        console.error('Error:', error)
        const errorMessage = error?.message || 'Unknown error'
        alert(`Failed to generate slides: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        YouTube Slide Generator
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Video Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              if (errors.topic) setErrors({...errors, topic: undefined})
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.topic ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Enter the video topic..."
            required
          />
          {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Link
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value)
              if (errors.link) setErrors({...errors, link: undefined})
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.link ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          {errors.link && <p className="mt-1 text-sm text-red-600">{errors.link}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
            Transcript (Optional)
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the video transcript here..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating AI Slides...
            </>
          ) : (
            '🚀 Generate AI Slides'
          )}
        </button>
      </form>

      {slides && slideData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Generated Slides</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportSlides('markdown')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                📄 Markdown
              </button>
              <button
                onClick={() => exportSlides('ppt')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                📊 PowerPoint
              </button>
              <button
                onClick={() => exportSlides('google-slides')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                🎨 Google Slides
              </button>
              <button
                onClick={() => exportSlides('json')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                💾 JSON
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-gray-700">
            {slides}
          </div>
        </div>
      )}
    </div>
  )
}

function generateSlides(topic: string, link: string, transcript: string): string {
  // Simple slide generation logic
  let content = transcript || topic

  // Clean content: remove intros, jokes, sponsors, etc.
  content = content
    .replace(/hey guys|welcome back|thanks for watching|subscribe|like|follow/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Extract key points (basic implementation)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)

  // Create slides
  let slides = `# Slide 1 — ${topic}\n`
  slides += `- Introduction\n`
  slides += `- Context: ${topic}\n`
  slides += `- Source: YouTube Video\n`
  slides += `Notes:\nThis slide introduces the main topic of the YouTube video.\n\n`
  slides += `💡 Icon: Video play button\n\n`

  slides += `# Slide 2 — Agenda\n`
  slides += `- Overview of main points\n`
  slides += `- Key concepts and sections\n`
  slides += `- Summary and takeaways\n`
  slides += `Notes:\nThis presentation outlines the structure of the video content.\n\n`
  slides += `📋 Icon: Checklist or list\n\n`

  // Content slides
  const numContentSlides = Math.min(4, sentences.length)
  for (let i = 0; i < numContentSlides; i++) {
    const sentence = sentences[i].trim()
    // Break into bullet points
    const words = sentence.split(' ')
    const points = []
    for (let j = 0; j < words.length; j += 5) {
      points.push(words.slice(j, j + 5).join(' '))
    }

    slides += `# Slide ${i + 3} — Key Concept ${i + 1}\n`
    points.slice(0, 4).forEach(point => {
      slides += `- ${point}\n`
    })
    slides += `Notes:\nDetailed explanation of concept ${i + 1} from the video.\n\n`
    slides += `🎯 Icon: Target or lightbulb\n\n`
  }

  // Final slide
  slides += `# Slide ${numContentSlides + 3} — Summary\n`
  slides += `- Key takeaways from the video\n`
  slides += `- Main points covered\n`
  slides += `- Thank you for watching\n`
  slides += `Notes:\nThis summarizes the main ideas and conclusions from the YouTube video.\n\n`
  slides += `✅ Icon: Checkmark or summary chart`

  return slides
}
