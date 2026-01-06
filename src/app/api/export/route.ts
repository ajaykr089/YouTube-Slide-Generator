import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slides, format, topicType } = await request.json()

    let content = ''
    let filename = ''
    let contentType = ''

    switch (format) {
      case 'ppt':
        content = generatePowerPoint(slides)
        filename = 'presentation.ppt'
        contentType = 'application/vnd.ms-powerpoint'
        break

      case 'google-slides':
        content = generateGoogleSlides(slides)
        filename = 'presentation.json'
        contentType = 'application/json'
        break

      case 'keynote':
        content = generateKeynote(slides)
        filename = 'presentation.key'
        contentType = 'application/vnd.apple.keynote'
        break

      case 'json':
        content = JSON.stringify(slides, null, 2)
        filename = 'presentation.json'
        contentType = 'application/json'
        break

      case 'pdf':
        content = generatePDFStructure(slides)
        filename = 'presentation.pdf'
        contentType = 'application/pdf'
        break

      default:
        content = slides.markdown
        filename = 'presentation.md'
        contentType = 'text/markdown'
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error exporting slides:', error)
    return NextResponse.json(
      { error: 'Failed to export slides' },
      { status: 500 }
    )
  }
}

function generatePowerPoint(slides: any): string {
  // Generate PowerPoint XML structure
  let ppt = '<?xml version="1.0" encoding="UTF-8"?>\n'
  ppt += '<ppt:presentation xmlns:ppt="http://schemas.openxmlformats.org/presentationml/2006/main">\n'

  slides.forEach((slide: any, index: number) => {
    ppt += `  <ppt:slide id="${index + 1}">\n`
    ppt += `    <ppt:title>${slide.title}</ppt:title>\n`
    ppt += '    <ppt:content>\n'
    slide.content.forEach((point: string) => {
      ppt += `      <ppt:paragraph>${point}</ppt:paragraph>\n`
    })
    ppt += '    </ppt:content>\n'
    ppt += `    <ppt:notes>${slide.notes}</ppt:notes>\n`
    ppt += '  </ppt:slide>\n'
  })

  ppt += '</ppt:presentation>'
  return ppt
}

function generateGoogleSlides(slides: any): string {
  const googleSlides = {
    title: 'YouTube Video Presentation',
    slides: slides.map((slide: any, index: number) => ({
      objectId: `slide_${index + 1}`,
      slideProperties: {
        layoutObjectId: 'LAYOUT_TITLE_AND_BODY',
      },
      pageElements: [
        {
          objectId: `title_${index + 1}`,
          shape: {
            text: {
              textElements: [
                {
                  paragraphMarker: {
                    style: { direction: 'LEFT_TO_RIGHT' }
                  },
                  textRun: {
                    content: slide.title,
                    style: {
                      fontSize: { magnitude: 24, unit: 'PT' },
                      bold: true
                    }
                  }
                }
              ]
            }
          },
          transform: {
            scaleX: 8.0,
            scaleY: 1.0,
            translateX: 0.5,
            translateY: 0.5,
            unit: 'PT'
          }
        },
        {
          objectId: `content_${index + 1}`,
          shape: {
            text: {
              textElements: slide.content.map((point: string) => ({
                paragraphMarker: { style: { direction: 'LEFT_TO_RIGHT' } },
                textRun: {
                  content: `• ${point}\n`,
                  style: { fontSize: { magnitude: 14, unit: 'PT' } }
                }
              }))
            }
          },
          transform: {
            scaleX: 8.0,
            scaleY: 4.0,
            translateX: 0.5,
            translateY: 2.0,
            unit: 'PT'
          }
        }
      ]
    }))
  }

  return JSON.stringify(googleSlides, null, 2)
}

function generateKeynote(slides: any): string {
  // Simplified Keynote structure
  let keynote = '<?xml version="1.0" encoding="UTF-8"?>\n'
  keynote += '<keynote:presentation xmlns:keynote="http://developer.apple.com/keynote">\n'

  slides.forEach((slide: any, index: number) => {
    keynote += `  <keynote:slide id="${index + 1}">\n`
    keynote += `    <keynote:title>${slide.title}</keynote:title>\n`
    keynote += '    <keynote:bullets>\n'
    slide.content.forEach((point: string) => {
      keynote += `      <keynote:bullet>${point}</keynote:bullet>\n`
    })
    keynote += '    </keynote:bullets>\n'
    keynote += `    <keynote:notes>${slide.notes}</keynote:notes>\n`
    keynote += '  </keynote:slide>\n'
  })

  keynote += '</keynote:presentation>'
  return keynote
}

function generatePDFStructure(slides: any): string {
  // Generate a simple PDF structure (would need a PDF library for actual PDF)
  let pdf = '%PDF-1.4\n'

  slides.forEach((slide: any, index: number) => {
    pdf += `${index + 1} 0 obj\n`
    pdf += '<<\n'
    pdf += '/Type /Page\n'
    pdf += '/Parent 2 0 R\n'
    pdf += '/Resources <<\n'
    pdf += '/Font <<\n'
    pdf += '/F1 4 0 R\n'
    pdf += '>>\n'
    pdf += '>>\n'
    pdf += '/Contents 5 0 R\n'
    pdf += '>>\n'
    pdf += 'endobj\n'
  })

  pdf += '%%EOF\n'
  return pdf
}
