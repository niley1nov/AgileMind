
import {GoogleGenerativeAI,HarmCategory,HarmBlockThreshold} from "@google/generative-ai";
import {models, getPrompts} from "./AIConfigData.js";
import config from "../config.js";


class AIService{
    
    constructor(projectSummary=''){
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_TOKEN);
        this.jsonifyModel = this.genAI.getGenerativeModel({
            model: models["pro"],
            systemInstruction: getPrompts('jsonify_model',projectSummary),
        });
        this.jsonChatSession = this.jsonifyModel.startChat({
            generationConfig: this.getGenConfig(0.2, "application/json"),
            history: []
        });
    }

    getGenConfig(temperature, response_mime_type, max_output_tokens=8192, top_p=0.95, top_k=64){
        return {
            temperature: temperature,
            topP: top_p,
            topK: top_k,
            maxOutputTokens: max_output_tokens,
            responseMimeType: response_mime_type,
        };
    }

    async getProjectSummary(srs){
        let model = this.genAI.getGenerativeModel({
            model: models["pro"],
            systemInstruction: getPrompts('project_summary'),
        });
        let chatSession = model.startChat({
            generationConfig: this.getGenConfig(1, "text/plain"),
            history: []
        });
        const result = await chatSession.sendMessage(srs);
        return result.response.text();
    }

    async getProjectLevelQuestions(srs){
        let model = this.genAI.getGenerativeModel({
            model: models["pro"],
            systemInstruction: getPrompts('questions_from_SRS'),
        });
        let chatSession = model.startChat({
            generationConfig: this.getGenConfig(0.8, "text/plain", 16384),
            history: []
        });

        const result = await chatSession.sendMessage(srs);
        const promt = 'Convert given questions into JSON format. \nOutput JSON format: \n '+
        '{{ functional: [functional questions for product team] (list of string), technical: [technical questions for development team] (list of string)}} \n '+
        'Input (A list of questions for project refinement): '+result.response.text();
        const jsonifyResult = await this.jsonChatSession.sendMessage(promt);
        return jsonifyResult.response.text();
    }

}


export default AIService;



