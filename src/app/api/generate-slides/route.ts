import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { topic, link, transcript } = await request.json()

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      )
    }

    const content = transcript || topic

    // Create a comprehensive prompt for Grok
    const prompt = `You are Grok, an AI expert at converting educational YouTube videos into professional presentation slides. You are helpful and create high-quality educational content.

VIDEO TOPIC: ${topic}
YOUTUBE LINK: ${link}
TRANSCRIPT: ${content}

TASK: Analyze this video content and create a complete presentation with the following structure:

1. TITLE SLIDE (1 slide)
   - Main title
   - Subtitle/context
   - Brief overview

2. AGENDA SLIDE (1 slide)
   - Overview of main sections
   - Learning objectives

3. CONTENT SLIDES (3-5 slides)
   - Break down key concepts
   - Include examples and facts
   - Each slide should have 3-6 bullet points

4. CONCLUSION SLIDE (1 slide)
   - Key takeaways
   - Summary points

REQUIREMENTS:
- Write in simple, clear, educational language
- Remove any irrelevant content (greetings, sponsors, personal anecdotes)
- Focus on educational value
- Make content engaging and understandable
- Add one visual/icon suggestion per slide
- Include 1 short speaker note paragraph per slide

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Speaker notes paragraph",
      "icon": "Suggested icon or visual"
    }
  ],
  "topicType": "education|science|business|tech|motivation",
  "summary": "Brief overall summary"
}

Analyze the content and create the slides now. Return only the JSON, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are Grok, an expert educational content creator who converts YouTube videos into professional presentations. Always return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from Grok API')
    }

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const slideData = JSON.parse(jsonMatch[0])

    // Convert to markdown format for display
    const markdown = convertToMarkdown(slideData)

    return NextResponse.json({
      slides: slideData.slides,
      markdown,
      topicType: slideData.topicType,
      summary: slideData.summary
    })

  } catch (error: any) {
    console.error('Error generating slides:', error)
    const errorMessage = error?.message || 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to generate slides: ${errorMessage}` },
      { status: 500 }
    )
  }
}

function convertToMarkdown(data: any): string {
  let markdown = ''

  data.slides.forEach((slide: any, index: number) => {
    markdown += `# Slide ${index + 1} — ${slide.title}\n`
    slide.content.forEach((point: string) => {
      markdown += `- ${point}\n`
    })
    markdown += `Notes:\n${slide.notes}\n\n`
    markdown += `${slide.icon}\n\n`
  })

  return markdown
}
