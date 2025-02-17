"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ClipboardList } from "lucide-react";
import { getTemplateById } from "@/api/api";

interface Section {
  title: string;
  subtitles?: string[];
}

interface ProjectData {
  title: string;
  description: string;
  templateId: number;
  collaborators: string[];
}

interface Template {
  id: number;
  name: string;
  description: string;
  sections: Section[];
}

export default function AssignmentPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProjectData = async () => {
      const stored = localStorage.getItem("newProjectData");
      if (!stored) {
        router.push("/projects/new");
        return;
      }

      try {
        const data: ProjectData = JSON.parse(stored);
        setProjectData(data);

        if (data.templateId) {
          const fetchedTemplate = await getTemplateById(data.templateId);
          setTemplate(fetchedTemplate);

          const initialAssignments: Record<string, string> = {};
          fetchedTemplate.sections.forEach((section: Section) => {
            initialAssignments[section.title] = "";
          });
          setAssignments(initialAssignments);
        }
      } catch {
        localStorage.removeItem("newProjectData");
        router.push("/projects/new");
      }
    };

    fetchProjectData();
  }, [router]);

  const handleAssignmentChange = (section: string, collaborator: string) => {
    setAssignments((prev) => ({ ...prev, [section]: collaborator }));
  };

  const getAssignmentStatus = () => {
    const total = template?.sections.length || 0;
    const assigned = Object.values(assignments).filter(Boolean).length;
    return {
      total,
      assigned,
      percentage: total ? (assigned / total) * 100 : 0,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectData) {
      localStorage.setItem(
        "newProjectData",
        JSON.stringify({ ...projectData, assignments })
      );
      router.push("/projects/new/roadmap");
    }
  };

  if (!projectData || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const status = getAssignmentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/projects/new/parameters"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Section Assignments
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {status.assigned} of {status.total} sections assigned
            </div>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">
              Template Sections
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {template.sections.map((section, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">{section.title}</h3>

                <select
                  value={assignments[section.title]}
                  onChange={(e) =>
                    handleAssignmentChange(section.title, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select assignee</option>
                  {projectData.collaborators.map((collab, idx) => (
                    <option key={idx} value={collab}>
                      {collab}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg"
              >
                Continue
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
