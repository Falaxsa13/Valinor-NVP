import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import TextStyle from "@tiptap/extension-text-style";
import { MenuBar, DocumentStats } from "./DocumentFeatures";
import '../styles/editor.css';
import { Heading } from '@tiptap/extension-heading';
import { mergeAttributes } from '@tiptap/core';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
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
  initialContent?: string;
}

const FONT_SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "30",
  "36",
  "48",
  "60",
  "72",
  "96",
];

const FONT_FAMILIES = [
  "Arial",
  "Arial Black",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Impact",
  "Lucida Console",
];

/**
 * CustomTextStyle extension extends the default TextStyle
 * and adds support for fontSize and fontFamily.
 *
 * It renders an inline style that merges both properties.
 */
const CustomTextStyle = TextStyle.extend({
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
          },
          fontFamily: {
            default: null,
          },
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const styles = [];
    if (HTMLAttributes.fontSize) {
      styles.push(`font-size: ${HTMLAttributes.fontSize}px`);
    }
    if (HTMLAttributes.fontFamily) {
      styles.push(`font-family: ${HTMLAttributes.fontFamily}`);
    }
    return ["span", { style: styles.join("; ") }];
  },
});

const CustomHeading = Heading.configure({
  levels: [2, 3],
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            id: attributes.id,
            class: 'section-title subtitle-text'
          }
        }
      }
    }
  },
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        if (this.editor.isActive('heading')) {
          return this.editor.commands.setNode('paragraph')
        }
        return false
      }
    }
  }
});

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

const Dropdown = ({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className={`flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EnhancedEditor = ({ onContentChange, initialContent = "" }: EditorProps) => {
  const [fontSize, setFontSize] = useState("11");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: { 
          HTMLAttributes: { 
            class: 'mb-3' 
          } 
        },
      }),
      CustomHeading,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CustomTextStyle,
      Color,
      Placeholder.configure({
        placeholder: "Type @ to insert, or start writing...",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (editor) {
        const { from, to } = editor.state.selection
        onContentChange(editor.getHTML());
        editor.commands.setTextSelection({ from, to })
      }
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[calc(100vh-8rem)] px-16 py-12 editor-content",
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && view.state.selection.$head.parent.type.name === 'heading') {
          return true
        }
        return false
      }
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="w-full max-w-5xl mx-auto animate-pulse">
        <div className="h-12 bg-gray-100 rounded-t mb-1" />
        <div className="h-96 bg-gray-50 rounded-b" />
      </div>
    );
  }

  const updateFontSize = (size: string) => {
    setFontSize(size);
    const current = editor.getAttributes("textStyle");
    editor
      .chain()
      .focus()
      .setMark("textStyle", { ...current, fontSize: size })
      .run();
  };

  const updateFontFamily = (font: string) => {
    setFontFamily(font);
    const current = editor.getAttributes("textStyle");
    editor
      .chain()
      .focus()
      .setMark("textStyle", { ...current, fontFamily: font })
      .run();
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isPreviewOpen ? "mr-[50%]" : "mr-6"
        }`}
      >
        <MenuBar editor={editor} />
        <div className="sticky top-6 z-10 bg-white shadow-sm rounded-t-lg border-b-0">
          <div className="flex flex-wrap items-center p-2 gap-1.5">
            <div className="flex items-center border-r pr-2 mr-2">
              <Dropdown
                value={fontFamily}
                options={FONT_FAMILIES}
                onChange={updateFontFamily}
                className="min-w-[120px]"
              />
              <Dropdown
                value={fontSize}
                options={FONT_SIZES}
                onChange={updateFontSize}
                className="min-w-[60px]"
              />
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
              isActive={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              isActive={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              isActive={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="w-4 h-4" />
            </MenuButton>
          </div>
        </div>
        <div className="-mt-2">
          <EditorContent
            editor={editor}
            className="px-8 pt-2 pb-6"
          />
          <DocumentStats editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedEditor;
