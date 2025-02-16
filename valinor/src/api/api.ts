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

export const parsePdf = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/pdf/parse`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
    
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Error parsing PDF.");
  }
};
