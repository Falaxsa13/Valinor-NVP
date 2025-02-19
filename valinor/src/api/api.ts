import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // FastAPI Server

export const generateLatex = async (content: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-latex`, {
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
    const response = await axios.get(`${API_BASE_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects.");
  }
};

export const parsePdf = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/parse-pdf`, formData, {
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
    console.log("Fetched template:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw new Error("Failed to fetch template.");
  }
};

interface TimelineEntry {
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
    console.log("projectData for project", projectData);

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
    console.log("timelineData", timelineData);
    const formattedData = formatJsonRequest(timelineData);
    console.log("formattedData", formattedData);

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
