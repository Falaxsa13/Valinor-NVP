import { useEffect, useState, useCallback } from "react";
import { generateLatex } from "@/api/api";
import debounce from "lodash.debounce";

export default function LaTeXPreview({ content }: { content: string }) {
  const [latex, setLatex] = useState("");

  // Debounced function to fetch LaTeX
  const fetchLatex = useCallback(
    debounce(async (text) => {
      if (!text.trim()) {
        setLatex("");
        return;
      }
      const latexCode = await generateLatex(text);
      setLatex(latexCode);
    }, 700), // 700ms delay before calling API
    []
  );

  useEffect(() => {
    fetchLatex(content);
  }, [content, fetchLatex]);

  return (
    <div className="border p-4 bg-gray-100 mt-4">
      <h3 className="text-lg font-semibold">LaTeX Output:</h3>
      <pre className="whitespace-pre-wrap">{latex}</pre>
    </div>
  );
}
