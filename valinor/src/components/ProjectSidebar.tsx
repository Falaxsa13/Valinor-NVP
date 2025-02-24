import React from 'react';

interface Section {
  id: number;
  title: string;
  subtitles: { id: number; subtitle: string; }[];
}

interface ProjectSidebarProps {
  sections: Section[];
  onNavigate: (sectionId: number, subtitleId?: number) => void;
}

const ProjectSidebar = ({ sections, onNavigate }: ProjectSidebarProps) => {
  return (
    <div className="w-72 border-r border-gray-200 bg-gray-50 px-6 py-8 overflow-y-auto h-[calc(100vh-8rem)] 
                    sticky top-6 mr-6 rounded-lg shadow-sm">
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 
              className="font-medium text-base text-blue-600 cursor-pointer hover:text-blue-700 
                         transition-colors duration-150 flex items-center gap-3 group"
              onClick={() => onNavigate(section.id)}
            >
              <span className="w-2 h-2 bg-blue-600 rounded-full group-hover:bg-blue-700"></span>
              {section.title}
            </h3>
            <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
              {section.subtitles.map((subtitle) => (
                <div
                  key={subtitle.id}
                  className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 
                           transition-colors duration-150 py-1.5 px-3 rounded-md hover:bg-white"
                  onClick={() => onNavigate(section.id, subtitle.id)}
                >
                  {subtitle.subtitle}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSidebar; 