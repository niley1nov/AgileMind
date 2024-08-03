import {
    GoogleGenerativeAI
  } from "@google/generative-ai";
  import { models, getPrompts } from "./AIConfigData.js";
  import config from "../config.js";

  class businessService {
    constructor(
        projectFunStructureDetailed,
        projectTechnicalStructure
    ) {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_TOKEN);
        this.model = this.genAI.getGenerativeModel({
          model: models["pro"],
          systemInstruction: getPrompts("answer_model", [projectFunStructureDetailed, projectTechnicalStructure]),
        });
        this.chatSession = model.startChat({
          generationConfig: getGenConfig(0.8, "text/plain"),
          history: [],
        });
    }

    async chat(question) {
      const result = await this.chatSession.sendMessage(question);
      return result.response.text();
    }
  }