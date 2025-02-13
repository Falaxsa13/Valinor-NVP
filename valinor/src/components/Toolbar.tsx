// src/components/Toolbar.tsx
import React from "react";
import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("bold") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Bold
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("italic") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Italic
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("underline") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Underline
      </button>

      {/* Strike-through */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("strike") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Strike
      </button>

      {/* Heading Level 2 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("heading", { level: 2 })
            ? "bg-gray-300"
            : "bg-gray-100"
        }`}
      >
        H2
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("bulletList") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Bullet List
      </button>

      {/* Ordered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("orderedList") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Ordered List
      </button>

      {/* Blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("blockquote") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Blockquote
      </button>

      {/* Code Block */}
      <button
        onClick={() => editor.chain().focus().setCodeBlock().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive("codeBlock") ? "bg-gray-300" : "bg-gray-100"
        }`}
      >
        Code Block
      </button>
    </div>
  );
};

export default Toolbar;
