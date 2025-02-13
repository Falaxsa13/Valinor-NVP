import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function Editor({
  onContentChange,
}: {
  onContentChange: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type your document here..." }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      if (editor) {
        onContentChange(editor.getHTML()); // Ensure editor exists before calling
      }
    },
  });

  // Ensure `onContentChange` sends an empty string initially to avoid undefined errors
  useEffect(() => {
    if (editor) {
      onContentChange(editor.getHTML());
    }
  }, [editor, onContentChange]);

  if (!editor) {
    return <div className="border p-4 text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="border p-4">
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}
