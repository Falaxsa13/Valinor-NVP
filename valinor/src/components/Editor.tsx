import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  ChevronDown,
  Link,
  Image,
} from "lucide-react";

interface EditorProps {
  onContentChange: (content: string) => void;
}

const MenuButton = ({
  isActive = false,
  onClick,
  children,
}: {
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? "bg-gray-100 text-blue-600" : "text-gray-700"
    }`}
  >
    {children}
  </button>
);

const EnhancedEditor = ({ onContentChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Type @ to insert, or start writing...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      if (editor) {
        onContentChange(editor.getHTML());
      }
    },
  });

  if (!editor) {
    return (
      <div className="w-full max-w-5xl mx-auto animate-pulse">
        <div className="h-12 bg-gray-100 rounded-t mb-1"></div>
        <div className="h-96 bg-gray-50 rounded-b"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Untitled document"
                className="text-lg font-medium bg-transparent border-none outline-none hover:bg-gray-100 px-2 rounded"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
              Share
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center p-1 gap-1 border-b">
          <div className="flex items-center border-r pr-2 mr-2">
            <button
              className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => {}}
            >
              Arial
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button
              className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => {}}
            >
              11
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>

          <MenuButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="w-4 h-4" />
          </MenuButton>

          <div className="h-4 border-r mx-2" />

          <MenuButton
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="w-4 h-4" />
          </MenuButton>

          <div className="h-4 border-r mx-2" />

          <MenuButton onClick={() => {}}>
            <Link className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => {}}>
            <Image className="w-4 h-4" />
          </MenuButton>

          <div className="h-4 border-r mx-2" />

          <MenuButton
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <div className="h-4 border-r mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="w-4 h-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-screen bg-white px-16 py-12">
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};

export default EnhancedEditor;
