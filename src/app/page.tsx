"use client";
import { DynamicIcon } from "lucide-react/dynamic";
import { useState } from "react";

interface Slide {
  title: string;
  content: string[];
  notes: string;
  icon: string;
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [link, setLink] = useState("");
  const [transcript, setTranscript] = useState("");
  const [slides, setSlides] = useState<string>("");
  const [slideData, setSlideData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ topic?: string; link?: string }>({});

  const validateYouTubeUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    return pattern.test(url);
  };

  const exportSlides = async (format: string) => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slides: slideData.slides,
          format,
          topicType: slideData.topicType,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Trigger download
      const blob = await response.blob();
      console.log(blob, "blob");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers
          .get("content-disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "presentation";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export slides. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { topic?: string; link?: string } = {};

    if (!topic.trim()) {
      newErrors.topic = "Video topic is required";
    }

    if (!link.trim()) {
      newErrors.link = "YouTube link is required";
    } else if (!validateYouTubeUrl(link)) {
      newErrors.link = "Please enter a valid YouTube URL";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-slides", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic, link, transcript }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate slides");
        }

        const data = await response.json();
        setSlides(data.slides);
        setSlideData(data);
      } catch (error: any) {
        console.error("Error:", error);
        const errorMessage = error?.message || "Unknown error";
        alert(`Failed to generate slides: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            🎬 YouTube Slide Generator
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Convert any YouTube video into clean, structured AI-powered slides
            in seconds.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg p-8 mb-10"
      >
        <div className="mb-4">
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Video Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (errors.topic) setErrors({ ...errors, topic: undefined });
            }}
            className={`w-full px-4 py-3 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
              errors.topic
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="e.g. How React Hooks Work"
          />

          {errors.topic && (
            <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="link"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            YouTube Link
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              if (errors.link) setErrors({ ...errors, link: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.link
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <p className="text-xs text-gray-500 mb-1">
            Paste a valid YouTube video URL
          </p>

          {errors.link && (
            <p className="mt-1 text-sm text-red-600">{errors.link}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="transcript"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Generating Slides…
            </>
          ) : (
            "🚀 Generate Slides"
          )}
        </button>
      </form>

      {slides && slideData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 text-center md:text-left">
              Generated Slides
            </h2>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-nowrap md:gap-3">
              <button
                onClick={() => exportSlides("markdown")}
                className="w-full md:w-auto rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                📄 Markdown
              </button>

              <button
                onClick={() => exportSlides("pptx")}
                className="w-full md:w-auto rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                📊 PowerPoint
              </button>

              <button
                onClick={() => exportSlides("google-slides")}
                className="w-full md:w-auto rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                🎨 Google Slides
              </button>

              <button
                onClick={() => exportSlides("json")}
                className="w-full md:w-auto rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
              >
                💾 JSON
              </button>

              <button
                onClick={() => exportSlides("pdf")}
                className="w-full md:w-auto rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                📕 PDF
              </button>

              <button
                onClick={() => exportSlides("keynote")}
                className="w-full md:w-auto rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
              >
                🍎 Keynote
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {slideData.slides.map((slide: Slide, index: number) => (
              <div
                key={index}
                className="rounded-2xl bg-white shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {slide.title}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full shrink-0">
                    Slide {index + 1}
                  </span>
                </div>

                {/* Content */}
                <ul className="space-y-2">
                  {slide.content.map((point, i) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      {index != 1 && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/* Notes */}
                {slide.notes && (
                  <div className="mt-5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-sm text-gray-800">
                    <p className="font-semibold mb-1">📝 Speaker Notes</p>
                    <p>{slide.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// function generateSlides(
//   topic: string,
//   link: string,
//   transcript: string
// ): string {
//   // Simple slide generation logic
//   let content = transcript || topic;

//   // Clean content: remove intros, jokes, sponsors, etc.
//   content = content
//     .replace(
//       /hey guys|welcome back|thanks for watching|subscribe|like|follow/gi,
//       ""
//     )
//     .replace(/\s+/g, " ")
//     .trim();

//   // Extract key points (basic implementation)
//   const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);

//   // Create slides
//   let slides = `# Slide 1 — ${topic}\n`;
//   slides += `- Introduction\n`;
//   slides += `- Context: ${topic}\n`;
//   slides += `- Source: YouTube Video\n`;
//   slides += `Notes:\nThis slide introduces the main topic of the YouTube video.\n\n`;
//   slides += `💡 Icon: Video play button\n\n`;

//   slides += `# Slide 2 — Agenda\n`;
//   slides += `- Overview of main points\n`;
//   slides += `- Key concepts and sections\n`;
//   slides += `- Summary and takeaways\n`;
//   slides += `Notes:\nThis presentation outlines the structure of the video content.\n\n`;
//   slides += `📋 Icon: Checklist or list\n\n`;

//   // Content slides
//   const numContentSlides = Math.min(4, sentences.length);
//   for (let i = 0; i < numContentSlides; i++) {
//     const sentence = sentences[i].trim();
//     // Break into bullet points
//     const words = sentence.split(" ");
//     const points = [];
//     for (let j = 0; j < words.length; j += 5) {
//       points.push(words.slice(j, j + 5).join(" "));
//     }

//     slides += `# Slide ${i + 3} — Key Concept ${i + 1}\n`;
//     points.slice(0, 4).forEach((point) => {
//       slides += `- ${point}\n`;
//     });
//     slides += `Notes:\nDetailed explanation of concept ${
//       i + 1
//     } from the video.\n\n`;
//     slides += `🎯 Icon: Target or lightbulb\n\n`;
//   }

//   // Final slide
//   slides += `# Slide ${numContentSlides + 3} — Summary\n`;
//   slides += `- Key takeaways from the video\n`;
//   slides += `- Main points covered\n`;
//   slides += `- Thank you for watching\n`;
//   slides += `Notes:\nThis summarizes the main ideas and conclusions from the YouTube video.\n\n`;
//   slides += `✅ Icon: Checkmark or summary chart`;

//   return slides;
// }
