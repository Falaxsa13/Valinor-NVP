"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layout,
  FileText,
  ChevronRight,
  Briefcase,
  LineChart,
  PlusCircle,
  Clipboard,
} from "lucide-react";
import { parsePdf } from '@/api/api';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  structure: any;
}

const templates: Template[] = [
  {
    id: "template1",
    name: "Project Proposal",
    description:
      "A structured project proposal template for presenting new initiatives and securing stakeholder approval.",
    icon: <LineChart className="w-5 h-5" />,
    structure: {
      sections: [
        { title: "Introduction", subtitles: [] },
        { title: "Project Description", subtitles: [] },
        { title: "Budget", subtitles: [] },
        { title: "Timeline", subtitles: [] },
      ],
    },
  },
  {
    id: "template_ycombinator",
    name: "Y Combinator Application",
    description:
      "A structured template for Y Combinator's startup accelerator application, covering team, product, market, and financials.",
    icon: <Briefcase className="w-5 h-5" />,
    structure: {
      sections: [
        {
          title: "General Information",
          subtitles: [
            "Startup Name",
            "Website",
            "Company Tagline",
            "Location",
            "Founded Date",
          ],
        },
        {
          title: "Founders Information",
          subtitles: [
            "Full Name",
            "Email Address",
            "LinkedIn",
            "Personal Website",
            "GitHub/Portfolio",
            "Twitter",
            "Role in the Company",
            "Other Commitments",
          ],
        },
        {
          title: "Idea & Product",
          subtitles: [
            "Company Description",
            "What's New or Interesting?",
            "How It Works",
            "Target Customers",
            "Problem You Are Solving",
            "Alternative Solutions & Your Advantage",
            "Demo Link",
          ],
        },
        {
          title: "Market & Growth",
          subtitles: [
            "Competitors",
            "Biggest Risk for Failure",
            "Revenue Model",
            "Long-term Vision",
          ],
        },
        {
          title: "Traction & Progress",
          subtitles: [
            "What Have You Built?",
            "Active Users & Customers",
            "Key Metrics",
            "Customer Acquisition Strategy",
            "Recent Wins",
          ],
        },
        {
          title: "Funding & Financials",
          subtitles: [
            "Previous Funding",
            "Fundraising Goals",
            "Monthly Burn Rate",
            "Use of Funds",
          ],
        },
        {
          title: "Team & Background",
          subtitles: [
            "How Did the Founders Meet?",
            "Why Is This the Right Team?",
            "Past Collaborations",
            "Full-time Commitment",
            "Commitment If Accepted",
          ],
        },
        {
          title: "Miscellaneous",
          subtitles: [
            "Past YC Applications",
            "Impressive Achievements",
            "Funniest or Most Surprising Fact",
            "Why This Startup?",
            "Additional Information",
          ],
        },
      ],
    },
  },
  {
    "id": "template_business_proposal",
    "name": "Business Proposal",
    "description": "A structured business proposal template for pitching new business ideas, partnerships, or investments.",
    "icon": "📄",
    "structure": {
      "sections": [
        {
          "title": "Executive Summary",
          "subtitles": []
        }
      ]
    }
  },
  {
    id: "blank",
    name: "Blank Project",
    description:
      "Start from scratch with a clean slate and build your project structure as you go.",
    icon: <PlusCircle className="w-5 h-5" />,
    structure: {
      sections: [],
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
    localStorage.setItem("newProjectData", JSON.stringify(projectData));
    router.push("/projects/new/parameters");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg
                           text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder:text-gray-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description to help team members understand the project's purpose"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg
                           text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder:text-gray-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Choose a Template
            </h2>
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
                    {template.icon}
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
                    className={`w-5 h-5 mt-2 ml-4 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-blue-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Upload Template Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload Template
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="templateFile"
                  className="hidden"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const parsedData = await parsePdf(file);
                        console.log('Parsed PDF data:', parsedData);
                      } catch (error) {
                        console.error('Error parsing PDF:', error);
                        // Handle error state here
                      }
                    }
                  }}
                />
                <label
                  htmlFor="templateFile"
                  className="cursor-pointer flex flex-col items-center"
                >
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
                  <div className="text-xs text-gray-500">
                    Supports PDF
                  </div>
                </label>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Upload your own template file to use as a starting point for your project.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900
                       hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!title || !selectedTemplate}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
