import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // FastAPI Server

export const generateLatex = async (content: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/latex/generate`, {
      content,
    });
    return response.data.latex;
  } catch (error) {
    console.error("Error generating LaTeX:", error);
    return "Error generating LaTeX.";
  }
};

export const getProjects = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/project/get-projects-overview`
    );
    return response;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects.");
  }
};

export const getProject = async (projectId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw new Error("Failed to fetch project details.");
  }
};

export const getProjectMetrics = async (projectId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/project/${projectId}/metrics`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project metrics:", error);
    throw new Error("Failed to fetch project metrics.");
  }
};

export const parsePdf = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/pdf/parse`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
    
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Error parsing PDF.");
  }
};

export const getTemplates = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/templates/get-all-templates`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates.");
  }
};

export const getTemplateById = async (templateId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw new Error("Failed to fetch template.");
  }
};

export interface TimelineEntry {
  section: string;
  subtitle?: string;
  responsible_email: string;
  start: string;
  end: string;
}

export const createProject = async (projectData: {
  title: string;
  description?: string;
  template_id: number;
  collaborators: string[];
  start_date: Date;
  deadline: Date;
  assignments: Record<string, string>;
  timeline: TimelineEntry[];
}) => {
  try {

    const response = await axios.post(
      `${API_BASE_URL}/project/create-project`,
      projectData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project.");
  }
};

function formatJsonRequest(projectData: {
  title: string;
  description?: string;
  templateId: number;
  collaborators: string[];
  startDate: string;
  deadline: string;
  assignments: Record<string, string>;
}) {
  return {
    project_title: projectData.title,
    project_description: projectData.description,
    template_id: projectData.templateId,
    collaborators: projectData.collaborators,
    start_date: projectData.startDate,
    deadline: projectData.deadline,
    section_assignments: projectData.assignments,
  };
}

export const generateTimeline = async (timelineData: {
  title: string;
  description?: string;
  templateId: number;
  collaborators: string[];
  startDate: string;
  deadline: string;
  assignments: Record<string, string>;
}) => {
  try {
    const formattedData = formatJsonRequest(timelineData);

    const response = await axios.post(
      `${API_BASE_URL}/project/generate-timeline`,
      formattedData
    );
    return response.data;
  } catch (error) {
    console.error("Error generating timeline:", error);
    throw new Error("Failed to generate project timeline.");
  }
};
