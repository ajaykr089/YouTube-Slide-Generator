import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pptxgen from "pptxgenjs";
export const runtime = "nodejs";
import fs from "fs";
import text2wav from "text2wav";

type SlideIn = { title: string; content: string[]; notes?: string };

export async function POST(request: NextRequest) {
  try {
    const { slides, format } = await request.json();

    let content = "";
    let filename = "";
    let contentType = "";

    switch (format) {
      case "md":
        content = generateMarkdown(slides);
        filename = "presentation.md";
        contentType = "text/markdown";
        break;

      case "pptx":
        {
          const buffer = await generatePowerPoint(slides);
          const body = new Uint8Array(buffer);

          return new NextResponse(body, {
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "Content-Disposition": 'attachment; filename="presentation.pptx"',
            },
          });
        }
        break;

      case "google-slides":
        {
          const buffer = await generateGoogleSlidesPPTX(slides);
          const body = new Uint8Array(buffer);

          return new NextResponse(body, {
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "Content-Disposition":
                'attachment; filename="presentation-google-slides.pptx"',
            },
          });
        }

        break;

      case "key":
        content = generateKeynote(slides);
        filename = "presentation.key";
        contentType = "application/vnd.apple.keynote";
        break;

      case "json":
        content = JSON.stringify(slides, null, 2);
        filename = "presentation.json";
        contentType = "application/json";
        break;

      case "pdf": {
        const buffer = await generatePDFStructure(slides);
        const body = new Uint8Array(buffer);

        return new NextResponse(body, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="presentation.pdf"',
          },
        });
      }
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting slides:", error);
    return NextResponse.json(
      { error: "Failed to export slides" },
      { status: 500 }
    );
  }
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // emojis
    .replace(/[\u200D\uFE0F]/g, "") // zero-width + variation selectors
    .replace(/[^\x20-\x7E]/g, ""); // non WinAnsi chars
}

function generateMarkdown(slides: any): string {
  let markdown = "";

  slides.forEach((slide: any, index: number) => {
    markdown += `# Slide ${index + 1} — ${slide.title}\n`;
    slide.content.forEach((point: string) => {
      markdown += `- ${point}\n`;
    });
    markdown += `Notes:\n${slide.notes}\n\n`;
    markdown += `${slide.icon}\n\n`;
  });
  return markdown;
}

async function generatePowerPoint(slides: SlideIn[]): Promise<Buffer> {
  const pptx = new pptxgen();

  slides.forEach((slide) => {
    const s = pptx.addSlide();

    const TITLE_Y = 0.5;
    const GAP = 0.15;
    const titleHeight = estimateTitleHeight(slide.title);
    s.addText(slide.title, {
      x: 0.5,
      y: TITLE_Y,
      w: 9,
      h: titleHeight,
      fontSize: 30,
      bold: true,
      wrap: true,
      valign: "top",
    });

    const bodyText = slide.content.join("\n");

    s.addText(bodyText, {
      x: 0.7,
      y: TITLE_Y + titleHeight + GAP,
      w: 8.5,
      h: 5.2 - titleHeight, // remaining space
      fontSize: 16,
      bullet: true,
      wrap: true,
      valign: "top",
      lineSpacing: 22,
    });

    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  });

  const output = await pptx.write({ outputType: "nodebuffer" } as any);

  // Normalize to Buffer (safe + typed)
  return Buffer.from(output);
}

// async function generateGoogleSlidesPPTX(slides: SlideIn[]): Promise<Buffer> {
//   const pptx = new pptxgen();

//   slides.forEach((slideData, ind) => {
//     const slide = pptx.addSlide();

//     // ---- TITLE ----
//     const TITLE_Y = 0.3;
//     const TITLE_H = 1.2; // enough height for wrapping

//     slide.addText(slideData.title, {
//       x: 0.5,
//       y: TITLE_Y,
//       w: 9,
//       h: TITLE_H,
//       fontSize: 34,
//       bold: true,
//       fontFace: "Arial",
//       color: "1F2937",
//       valign: "middle",
//       wrap: true,
//     });

//     // ---- BODY ----
//     slideData.content.forEach((point, i) => {
//       slide.addText(point, {
//         x: 0.7,
//         y: TITLE_Y + TITLE_H + 0.5 + i * 0.45, // stacked bullets
//         w: 8.5,
//         fontSize: 20,
//         fontFace: "Arial",
//         color: "374151",
//         bullet: true,
//         lineSpacing: 26,
//       });
//     });

//     // ---- NOTES ----
//     if (slideData.notes) slide.addNotes(slideData.notes);
//   });

//   const buf = await pptx.write({ outputType: "nodebuffer" } as any);
//   return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
// }

// function generateKeynote(slides: any): string {
//   // Simplified Keynote structure
//   let keynote = '<?xml version="1.0" encoding="UTF-8"?>\n';
//   keynote +=
//     '<keynote:presentation xmlns:keynote="http://developer.apple.com/keynote">\n';

//   slides.forEach((slide: any, index: number) => {
//     keynote += `  <keynote:slide id="${index + 1}">\n`;
//     keynote += `    <keynote:title>${slide.title}</keynote:title>\n`;
//     keynote += "    <keynote:bullets>\n";
//     slide.content.forEach((point: string) => {
//       keynote += `      <keynote:bullet>${point}</keynote:bullet>\n`;
//     });
//     keynote += "    </keynote:bullets>\n";
//     keynote += `    <keynote:notes>${slide.notes}</keynote:notes>\n`;
//     keynote += "  </keynote:slide>\n";
//   });

//   keynote += "</keynote:presentation>";
//   return keynote;
// }
function estimateTitleHeight(text: string): number {
  const charsPerLine = 45; // depends on font + width
  const lineHeight = 0.45; // inches for 30px font

  const lines = Math.ceil(text.length / charsPerLine);
  return Math.min(lines * lineHeight, 1.6); // cap height
}

async function generateGoogleSlidesPPTX(slides: SlideIn[]): Promise<Buffer> {
  const pptx = new pptxgen();

  slides.forEach((slideData) => {
    const slide = pptx.addSlide();
    const titleHeight = estimateTitleHeight(slideData.title);
    const TITLE_Y = 1;
    const TITLE_H = 0;
    const GAP = 0.15;

    slide.addText(slideData.title, {
      x: 0.5,
      y: TITLE_Y,
      w: 9,
      h: titleHeight,
      fontSize: 30,
      bold: true,
      wrap: true,
      valign: "top", // 🔥 important
    });

    // ---- BODY (single text box) ----
    const bodyText = slideData.content.join("\n");

    slide.addText(bodyText, {
      x: 0.7,
      y: TITLE_Y + titleHeight + GAP,
      w: 8.5,
      h: 5.2 - titleHeight, // dynamic remaining space
      fontSize: 20,
      bullet: true,
      wrap: true,
      valign: "top",
      lineSpacing: 26,
    });

    // ---- NOTES ----
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  });

  const buf: any = await pptx.write({ outputType: "nodebuffer" } as any);
  return Buffer.from(buf);
}

function generateKeynote(slides: SlideIn[]): string {
  // Start Keynote XML
  let keynote = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  keynote += `<keynote:presentation xmlns:keynote="http://developer.apple.com/keynote">\n`;

  slides.forEach((slide, index) => {
    keynote += `  <keynote:slide id="slide_${index + 1}">\n`;

    // Title
    keynote += `    <keynote:title>${escapeXML(slide.title)}</keynote:title>\n`;

    // Bullets / body
    keynote += `    <keynote:bullets>\n`;
    slide.content.forEach((point) => {
      keynote += `      <keynote:bullet>${escapeXML(point)}</keynote:bullet>\n`;
    });
    keynote += `    </keynote:bullets>\n`;

    // Notes
    if (slide.notes) {
      keynote += `    <keynote:notes>${escapeXML(
        slide.notes
      )}</keynote:notes>\n`;
    }

    keynote += `  </keynote:slide>\n`;
  });

  keynote += `</keynote:presentation>\n`;
  return keynote;
}

// Helper to escape special XML characters
function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generatePDFStructure(slides: any[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  slides.forEach((slide) => {
    const page = pdfDoc.addPage([595, 842]); // A4
    const { height } = page.getSize();

    let y = height - 80;
    const title = sanitizeText(slide.title || "Slide");
    // Title
    page.drawText(slide.title || "Slide", {
      x: 50,
      y,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    // Content
    slide.content?.forEach((line: string) => {
      const safeLine = sanitizeText(line);
      page.drawText(safeLine, {
        x: 50,
        y,
        size: 14,
        font,
      });
      y -= 20;
    });
  });

  return await pdfDoc.save();
}

// Helper function: split long text into lines that fit maxWidth
// function splitText(
//   text: string,
//   fontSize: number,
//   font: any,
//   maxWidth: number
// ): string[] {
//   const words = text.split(" ");
//   const lines: string[] = [];
//   let currentLine = "";

//   words.forEach((word) => {
//     const testLine = currentLine ? currentLine + " " + word : word;
//     const textWidth = font.widthOfTextAtSize(testLine, fontSize);
//     if (textWidth > maxWidth) {
//       if (currentLine) lines.push(currentLine);
//       currentLine = word;
//     } else {
//       currentLine = testLine;
//     }
//   });

//   if (currentLine) lines.push(currentLine);
//   return lines;
// }
