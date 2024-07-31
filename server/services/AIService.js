import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { models, getPrompts } from "./AIConfigData.js";
import config from "../config.js";

class AIService {
  constructor(projectSummary = "") {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_TOKEN);
    this.jsonifyModel = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("jsonify_model", projectSummary),
    });
    this.jsonChatSession = this.jsonifyModel.startChat({
      generationConfig: this.getGenConfig(0.2, "application/json"),
      history: [],
    });
  }

  getGenConfig(
    temperature,
    response_mime_type,
    max_output_tokens = 8192,
    top_p = 0.95,
    top_k = 64
  ) {
    return {
      temperature: temperature,
      topP: top_p,
      topK: top_k,
      maxOutputTokens: max_output_tokens,
      responseMimeType: response_mime_type,
    };
  }

  async getProjectSummary(srs) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("project_summary"),
    });
    let chatSession = model.startChat({
      generationConfig: this.getGenConfig(1, "text/plain"),
      history: [],
    });
    const result = await chatSession.sendMessage(srs);
    return result.response.text();
  }

  async getProjectLevelQuestions(srs) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("questions_from_SRS"),
    });
    let chatSession = model.startChat({
      generationConfig: this.getGenConfig(0.8, "text/plain", 16384),
      history: [],
    });

    const result = await chatSession.sendMessage(srs);
    const promt =
      "Convert given questions into JSON format. \nOutput JSON format: \n " +
      "{{ functional: [functional questions for product team] (list of string), technical: [technical questions for development team] (list of string)}} \n " +
      "Input (A list of questions for project refinement): " +
      result.response.text();
    const jsonifyResult = await this.jsonChatSession.sendMessage(promt);
    return jsonifyResult.response.text();
  }

  async documentProjectDiscussion(projectSRS, projectFunChat, projectTechChat) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("document_project_level_discussion", [
        projectSRS,
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: this.getGenConfig(0.4, "text/plain", 16384, 0.95, 64),
      history: [],
    });
    const resultFunDoc = await chatSession.sendMessage(projectFunChat);
    const resultTechDoc = await chatSession.sendMessage(projectTechChat);
    return {
      projectFunDiscussionDocument: resultFunDoc.response.text(),
      projectTechDiscussionDocument: resultTechDoc.response.text(),
    };
  }

  async generateFunctionalStructure(projectSRS, projectFunDiscussionDocument) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("project_functional_chat", [
        projectSRS,
        projectFunDiscussionDocument,
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: this.getGenConfig(0.5, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    const chatMessage =
      "Prepare a full project structure based on SRS and functional discussion document. " +
      "It should contain all functional features. Structure should contain features and sub features. " +
      "Don't add technical details for now. Don't give numbering to tasks.";
    const projectStructureRes = await chatSession.sendMessage(chatMessage);

    const chatMessageToJsonigy =
      "Convert below document in JSON structure. JSON format - \n" +
      "[{{feature: name of feature (string), content: content of feature as it is (string) }}] " +
      projectStructureRes.response.text();
    const projectFunStructure = await this.jsonChatSession.sendMessage(
      chatMessageToJsonigy
    );
    let projectFunStructureDetailed = [];
    for (let feature in projectFunStructure.response) {
      let promtForDetailsStructure =
        "Add functional details to this feature based on SRS and Fuctional Discussion Document. Ignore technical implementation details for now.\n" +
        "Feature - " +
        JSON.stringify(feature);
      const projectStructureRes = await chatSession.sendMessage(
        promtForDetailsStructure
      );
      projectFunStructureDetailed.push(projectStructureRes.response.text());
    }

    return projectFunStructureDetailed;
  }

  async generateTechnicalStructure(
    projectSummary,
    projectTechDiscussionDocument,
    projectFunStructureDetailed
  ) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("project_technical_chat", [
        projectSummary,
        projectTechDiscussionDocument,
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: this.getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    const chatMessage =
      "Use below project requirement document and technical discussion document to create a detailed project implementation plan for the team.\n" +
      "Divide the project into phases. Each phase can have analysis, design, development, testing, deployment or any other type of tasks. Don't give numbering to tasks.\n" +
      "Project requirement structure - \n\n" +
      JSON.stringify(projectFunStructureDetailed);
    const projectStructureRes = await chatSession.sendMessage(chatMessage);
    const chatMessageToJsonigy =
      "Convert below project structure document into JSON structure.\n" +
      "Output JSON format:\n" +
      "[{{phase: phase name (string),sections: [{{ type: [] list of task types (list of string) example: [Analysis, Design], tasks: [] list of tasks (list of string) }}] }}]\n" +
      projectStructureRes.response.text();
    const projectTechnicalStructure = await this.jsonChatSession.sendMessage(
      chatMessageToJsonigy
    );
    return projectTechnicalStructure.response;
  }



}

const service = new AIService();
export default AIService;
