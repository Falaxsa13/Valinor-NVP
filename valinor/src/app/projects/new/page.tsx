"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define a Template type
interface Template {
  id: string;
  name: string;
  description: string;
  structure: any; // a JSON structure for titles/subtitles
}

// Example templates (hardcoded for now)
const templates: Template[] = [
  {
    id: "template1",
    name: "Business Plan",
    description:
      "A structured business plan with market analysis, strategy, etc.",
    structure: {
      sections: [
        { title: "Executive Summary", subtitles: [] },
        {
          title: "Market Analysis",
          subtitles: ["Industry Overview", "Target Market"],
        },
        { title: "Strategy", subtitles: ["Marketing Plan", "Sales Plan"] },
      ],
    },
  },
  {
    id: "template2",
    name: "Project Proposal",
    description: "A detailed project proposal template.",
    structure: {
      sections: [
        { title: "Introduction", subtitles: [] },
        { title: "Project Description", subtitles: [] },
        { title: "Budget", subtitles: [] },
        { title: "Timeline", subtitles: [] },
      ],
    },
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      title,
      description,
      template: selectedTemplate,
    };
    // Save data in localStorage to persist between steps
    localStorage.setItem("newProjectData", JSON.stringify(projectData));
    router.push("/projects/new/parameters");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Project Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter project title"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            rows={4}
          ></textarea>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Select a Template</h2>
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded cursor-pointer ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <h3 className="font-bold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={!selectedTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Next
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
