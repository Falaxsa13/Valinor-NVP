import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

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
      onContentChange(editor.getHTML()); // Send content to parent
    },
  });

  return (
    <div className="border p-4">
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}
