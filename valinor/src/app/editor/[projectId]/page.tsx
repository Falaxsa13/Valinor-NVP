"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/Editor";
import { getProject, getTemplateById } from "@/api/api";
import ProjectSidebar from "@/components/ProjectSidebar";

interface Section {
  id: number;
  title: string;
  subtitles: { id: number; subtitle: string; }[];
}

interface Project {
  id: number;
  title: string;
  template_id: number;
  // Add other project properties you need
}

export default function EditorPage() {
  const [content, setContent] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : params.projectId?.[0];

  useEffect(() => {
    console.log("projectId", projectId);
    if (projectId) {
      fetchProjectData(parseInt(projectId));
    }
  }, [projectId]);

  const fetchProjectData = async (id: number) => {
    try {
      console.log("fetching project data");
      const projectData = await getProject(id);
      console.log("project", projectData);
      setProject(projectData);

      const template = await getTemplateById(projectData.template_id);
      
      // Transform template sections into the format we need
      const templateSections = template.sections.map((section: Section) => ({
        id: section.id,
        title: section.title,
        subtitles: section.subtitles.map((st: any) => ({
          id: st.id,
          subtitle: st.subtitle
        }))
      }));
      console.log("templateSections", templateSections);
      setSections(templateSections);
      
      // Create initial content with section headers
      const initialContent = template.sections.map((section: Section) => 
        `<h2 id="section-${section.id}" class="editor-section">${section.title.trim()}</h2>` +
        section.subtitles.map(st => 
          `<h3 id="subtitle-${st.id}" class="editor-subtitle">${st.subtitle.trim()}</h3>` +
          `<p class="editor-paragraph"></p>`
        ).join('')
      ).join('\n');
      
      console.log("initialContent", initialContent);
      setContent(initialContent);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    }
  };

  const handleNavigate = (sectionId: number, subtitleId?: number) => {
    const elementId = subtitleId ? `subtitle-${subtitleId}` : `section-${sectionId}`;
    
    // Add a small delay to ensure the editor content is rendered
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.log(`Element with id ${elementId} not found`);
      }
    }, 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {project ? project.title : 'Loading...'}
      </h1>
      <div className="flex">
        {projectId && (
          <ProjectSidebar 
            sections={sections} 
            onNavigate={handleNavigate}
          />
        )}
        <Editor 
          onContentChange={setContent} 
          initialContent={content}
        />
      </div>
    </div>
  );
}
