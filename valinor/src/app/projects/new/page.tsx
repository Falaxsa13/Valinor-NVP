"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTemplates, parsePdf } from "@/api/api";
import { ArrowLeft, ChevronRight, PlusCircle } from "lucide-react";

interface Template {
  id: number;
  name: string;
  description: string;
  icon: string;
  structure: {
    sections: { title: string; subtitles: string[] }[];
  };
}

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch templates from backend
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        setError("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      title,
      description,
      templateId: selectedTemplate?.id,
    };
    localStorage.setItem("newProjectData", JSON.stringify(projectData));
    router.push("/projects/new/parameters");
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Uploading file:', file);
      await parsePdf(file);
      console.log("Template created successfully");
      
      // Refresh the templates list
      const newTemplates = await getTemplates();
      setTemplates(newTemplates);
      
      // Reset upload state
      setIsUploading(false);
      
      // Show success message (optional)
      // You could add a toast notification here
    } catch (error) {
      console.error("Error parsing PDF:", error);
      setError("Failed to upload template.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Project
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Project Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter project title"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description to help team members understand the project's purpose"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Choose a Template
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading templates...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`flex items-start p-4 text-left border rounded-lg group transition-all
                           hover:border-blue-200 hover:bg-blue-50 ${
                             selectedTemplate?.id === template.id
                               ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                               : "border-gray-200"
                           }`}
                  >
                    <div
                      className={`p-2 rounded-lg mr-4 ${
                        selectedTemplate?.id === template.id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      {template.icon || <PlusCircle size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 mt-2 ml-4 ${
                        selectedTemplate?.id === template.id
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload Template Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload Template
            </h2>
            <div className="space-y-4">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}>
                <input
                  type="file"
                  id="templateFile"
                  className="hidden"
                  accept=".pdf"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleFileUpload(file);
                    }
                  }}
                />
                <label
                  htmlFor="templateFile"
                  className={`cursor-pointer flex flex-col items-center ${isUploading ? 'cursor-wait' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-blue-600 mb-1">
                        Creating template...
                      </div>
                      <div className="text-xs text-blue-500">
                        This may take a few moments
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload a template
                      </div>
                      <div className="text-xs text-gray-500">Supports PDF</div>
                    </>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="text-sm text-gray-500 text-center mt-4">
              <p>
                Upload your own template file to use as a starting point for
                your project.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!title || !selectedTemplate}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg"
            >
              Continue
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
