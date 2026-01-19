export type ExportList = {
  id: number;
  label: string;
  format: string;
  bgColor: string;
};

export const exportList: ExportList[] = [
  {
    id: 1,
    label: "📄 Markdown",
    format: "md",
    bgColor: "bg-gray-600 hover:bg-gray-700",
  },
  {
    id: 2,
    label: "📊 PowerPoint",
    format: "pptx",
    bgColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: 3,
    label: "🎨 Google Slides",
    format: "google-slides",
    bgColor: "bg-green-600 hover:bg-green-700",
  },
  {
    id: 4,
    label: "💾 JSON",
    format: "json",
    bgColor: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: 5,
    label: "📕 PDF",
    format: "pdf",
    bgColor: "bg-red-600 hover:bg-red-700",
  },
  {
    id: 6,
    label: "🍎 Keynote",
    format: "key",
    bgColor: "bg-gray-800 hover:bg-gray-900",
  },
];
