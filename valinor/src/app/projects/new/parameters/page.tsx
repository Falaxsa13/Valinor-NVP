"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  X,
  Mail,
  Info,
  ChevronRight,
} from "lucide-react";

interface Collaborator {
  email: string;
  id: string;
}

export default function ProjectParametersPage() {
  const router = useRouter();
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [deadline, setDeadline] = useState("");
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (stored) {
      setProjectData(JSON.parse(stored));
    } else {
      router.push("/projects/new");
    }
  }, [router]);

  const handleAddCollaborator = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = collaboratorInput.trim();
      if (email && isValidEmail(email)) {
        setCollaborators([
          ...collaborators,
          { email, id: Date.now().toString() },
        ]);
        setCollaboratorInput("");
      }
    }
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...projectData,
      collaborators: collaborators.map((c) => c.email),
      deadline,
    };
    localStorage.setItem("newProjectData", JSON.stringify(updatedData));
    router.push("/projects/new/assignment");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/projects/new"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Project Parameters
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Step 2 of 3</p>
            </div>
          </div>

          {projectData && (
            <div className="text-sm text-gray-600">{projectData.title}</div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Collaborators Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">
                  Collaborators
                </h2>
              </div>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Learn more about collaborators"
              >
                <Info size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="collaborators"
                    type="text"
                    value={collaboratorInput}
                    onChange={(e) => setCollaboratorInput(e.target.value)}
                    onKeyDown={handleAddCollaborator}
                    placeholder="Add collaborators by email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg
                             text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             placeholder:text-gray-500 transition-colors"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Press Enter or use commas to add multiple collaborators
                </p>
              </div>

              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      <span className="max-w-[200px] truncate">
                        {collaborator.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCollaborator(collaborator.id)}
                        className="ml-2 p-0.5 hover:bg-blue-100 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deadline Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Project Deadline
              </h2>
            </div>

            <div>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg
                         text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/projects/new"
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
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ChevronRight size={18} className="ml-2" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
