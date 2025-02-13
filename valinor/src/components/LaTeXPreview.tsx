import { useEffect, useState } from "react";
import axios from "axios";

export default function LaTeXPreview({ content }: { content: string }) {
  const [latex, setLatex] = useState("");

  useEffect(() => {
    const fetchLatex = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/generate-latex",
          { content }
        );
        setLatex(response.data.latex);
      } catch (error) {
        console.error("Failed to generate LaTeX", error);
      }
    };

    if (content) {
      fetchLatex();
    }
  }, [content]);

  return (
    <div className="border p-4 bg-gray-100 mt-4">
      <h3 className="text-lg font-semibold">LaTeX Output:</h3>
      <pre className="whitespace-pre-wrap">{latex}</pre>
    </div>
  );
}
