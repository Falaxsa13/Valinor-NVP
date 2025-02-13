import { useEffect, useState, useCallback } from "react";
import { generateLatex } from "@/api/api";
import debounce from "lodash.debounce";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LaTeXPreviewProps {
  content: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export default function LaTeXPreview({
  content,
  isOpen,
  onToggle,
}: LaTeXPreviewProps) {
  const [latex, setLatex] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatex = useCallback(
    debounce(async (text) => {
      if (!text.trim()) {
        setLatex("");
        return;
      }
      setIsLoading(true);
      try {
        const latexCode = await generateLatex(text);
        setLatex(latexCode);
      } catch (error) {
        console.error("Error generating LaTeX:", error);
      } finally {
        setIsLoading(false);
      }
    }, 700),
    []
  );

  useEffect(() => {
    fetchLatex(content);
  }, [content, fetchLatex]);

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out flex z-30 border-l ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-3rem)]"
      }`}
      style={{
        width: "40%",
        height: "calc(100vh - 64px)",
        top: "64px",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full transform bg-white p-2 rounded-l-lg shadow-lg border border-r-0 hover:bg-gray-50 transition-colors"
        aria-label={isOpen ? "Close LaTeX Preview" : "Open LaTeX Preview"}
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      <div className="w-full overflow-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            LaTeX Output
          </h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border overflow-x-auto">
              {latex || "No content to preview"}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
