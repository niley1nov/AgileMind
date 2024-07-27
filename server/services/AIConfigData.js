const safety_settings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_ONLY_HIGH",
  },
];

const models = {
  pro: "gemini-1.5-pro",
  flash: "gemini-1.5-flash",
};

function getPrompts(key, replacableText='') {
  const prompts = {
    jsonify_model: `You are an assistant working on a software project. Your will receive a document and a JSON format. You have to convert it into JSON format. Here is the project summary for context: ${replacableText}`,
    project_summary: 'Input: Software Requirement Specification Document, Output: A short summary of given project as a paragraph',
    questions_from_SRS: 'You will receive a Software Requirement Specification document. You have to ask technical and functional questions to better understand project scope and requirements. Input: Software Requirement Specification Output: Functional Questions - a series of functional questions for the product team. Technical Questions - a series of technical questions for the development team regarding the implementation approach of the software.',
  };
  return prompts[key];
}

export { safety_settings, models, getPrompts };
