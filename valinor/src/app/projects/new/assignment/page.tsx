"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  ChevronRight,
  Info,
  AlertCircle,
  UserCheck,
  UserX,
  CheckCircle2,
} from "lucide-react";

interface Section {
  title: string;
  subtitles?: string[];
}

interface ProjectData {
  title: string;
  template: {
    structure: {
      sections: Section[];
    };
  };
  collaborators: string[];
}

export default function AssignmentPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (stored) {
      const data = JSON.parse(stored);
      setProjectData(data);

      if (data.template?.structure?.sections) {
        const initialAssignments: Record<string, string> = {};
        data.template.structure.sections.forEach((section: Section) => {
          initialAssignments[section.title] = "";
        });
        setAssignments(initialAssignments);
      }
    } else {
      router.push("/projects/new");
    }
  }, [router]);

  const handleAssignmentChange = (section: string, collaborator: string) => {
    setAssignments((prev) => ({ ...prev, [section]: collaborator }));
  };

  const getAssignmentStatus = () => {
    const totalSections = projectData?.template.structure.sections.length || 0;
    const assignedSections = Object.values(assignments).filter(Boolean).length;
    return {
      total: totalSections,
      assigned: assignedSections,
      percentage: (assignedSections / totalSections) * 100,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...projectData,
      assignments,
    };
    localStorage.setItem("newProjectData", JSON.stringify(updatedData));
    router.push("/projects/new/roadmap");
  };

  if (!projectData) {
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Section Assignments
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Step 3 of 3</p>
            </div>
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Template Sections
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                       hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info size={16} className="mr-1.5" />
              How assignment works
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {projectData.template.structure.sections.map((section, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  hoveredSection === section.title
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200"
                }`}
                onMouseEnter={() => setHoveredSection(section.title)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {section.title}
                    </h3>
                    {section.subtitles && section.subtitles.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {section.subtitles.join(", ")}
                      </p>
                    )}
                  </div>
                  {assignments[section.title] ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <select
                  value={assignments[section.title]}
                  onChange={(e) =>
                    handleAssignmentChange(section.title, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Link
                href="/projects/new/parameters"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 
                         hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Link>

              <button
                type="submit"
                className="flex items-center px-6 py-2.5 text-sm font-medium text-white 
                         bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {status.percentage === 100 ? (
                  <>
                    Complete Setup
                    <CheckCircle2 size={18} className="ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Assignment Tips */}
        {status.percentage < 100 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Assignment Tips
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Assign sections to team members based on their expertise. You
                can always adjust these assignments later.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
