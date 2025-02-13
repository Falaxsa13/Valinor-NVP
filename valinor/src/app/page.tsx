"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import LaTeXPreview from "@/components/LaTeXPreview";

export default function Home() {
  const [content, setContent] = useState("");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-boldm mb-3">AI-Powered LaTeX Editor</h1>
      <Editor onContentChange={setContent} />
    </div>
  );
}
