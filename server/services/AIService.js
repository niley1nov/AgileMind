import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { models, getPrompts } from "./AIConfigData.js";
import config from "../config.js";
import { getGenConfig } from "../utilities/AIUtil.js";

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_TOKEN);
    this.jsonifyModel = {};
    this.jsonChatSession = {};
  }

  initJsonSession(projectSummary) {
    this.jsonifyModel = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("jsonify_model", [projectSummary]),
    });
    this.jsonChatSession = this.jsonifyModel.startChat({
      generationConfig: getGenConfig(0.2, "application/json"),
      history: [],
    });
  }

  async getProjectSummary(srs) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("project_summary"),
    });
    let chatSession = model.startChat({
      generationConfig: getGenConfig(1, "text/plain"),
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
      generationConfig: getGenConfig(0.8, "text/plain", 16384),
      history: [],
    });

    const result = await chatSession.sendMessage(srs);
    const prompt = `Convert given questions into JSON format.
Output JSON format:
{
	functional: [functional questions for product team] (list of string),
	technical: [technical questions for development team] (list of string)
}

Input (A list of questions for project refinement):
` + result.response.text();
    const jsonifyResult = await this.jsonChatSession.sendMessage(prompt);
    return jsonifyResult.response.text();
  }

  async documentProjectDiscussion(
		projectSRS,
		projectFunChat,
		projectTechChat
	) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("document_project_level_discussion", [
        projectSRS,
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.4, "text/plain", 16384, 0.95, 64),
      history: [],
    });
    const resultFunDoc = await chatSession.sendMessage(JSON.stringify(projectFunChat));
    const resultTechDoc = await chatSession.sendMessage(JSON.stringify(projectTechChat));
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
      generationConfig: getGenConfig(0.5, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    const chatMessage = `Prepare a full project structure based on SRS and functional discussion document.
It should contain all functional features.
Structure should contain features and sub features.
Don't add technical details for now. Don't give numbering to tasks.`;
    const projectStructureRes = await chatSession.sendMessage(chatMessage);

    const chatMessageToJsonify = `Convert below document in JSON structure.
JSON format -
[
	{
		feature: name of feature (string)
		content: content of feature as it is (string)
	}
]

` + projectStructureRes.response.text();
    const projectFunStructure = await this.jsonChatSession.sendMessage(
      chatMessageToJsonify
    );
    let projectFunStructureDetailed = [];
    for (let feature of JSON.parse(projectFunStructure.response.text())) {
      let promptForDetailedStructure = `Add functional details to this feature based on SRS and Fuctional Discussion Document.
Ignore technical implementation details for now.

Feature -
` + JSON.stringify(feature);
      const projectStructureRes = await chatSession.sendMessage(
        promptForDetailedStructure
      );
      projectFunStructureDetailed.push(projectStructureRes.response.text());
    }

    return {
      projectFunStructure: JSON.parse(projectFunStructure.response.text()),
      projectFunStructureDetailed: projectFunStructureDetailed,
    };
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
      generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    const chatMessage = `Use below project requirement document and technical discussion document to create a detailed project implementation plan for the team.
Divide the project into phases. Each phase can have analysis, design, development, testing, deployment or any other type of tasks.
Don't give numbering to tasks.

Project requirement structure -
` + projectFunStructureDetailed.join('\n\n');
    const projectStructureRes = await chatSession.sendMessage(chatMessage);
    const chatMessageToJsonify = `Convert below project structure document into JSON structure.
Output JSON format -
[
	{
		phase: phase name (string)
		sections: [
			{
				type: [] list of task types (list of string) example: [Analysis, Design]
				tasks: [] list of tasks (list of string)
			}
		]
	}
]

` + projectStructureRes.response.text();
    const projectTechnicalStructure = await this.jsonChatSession.sendMessage(
      chatMessageToJsonify
    );
    return JSON.parse(projectTechnicalStructure.response.text());
  }

  async getPhaseLevelQuestions(
    projectFunStructureDetailed,
    projectTechnicalStructure
  ) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("questions_from_phase", [
        projectFunStructureDetailed.join("\n\n"),
        JSON.stringify(projectTechnicalStructure),
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.8, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    let phaseLevelQuestions = []
    for(let phase of projectTechnicalStructure) {
      const phaseQuestionsRes = await chatSession.sendMessage(JSON.stringify(phase));
      const chatMessageToJsonify = `Convert given questions into JSON format.
Output JSON format -
[
    {
        question: (string)
        roles: [] question target to which team member roles (list of string)
    }
]
    
Input (A list of questions for project phase refinement):
` + phaseQuestionsRes.response.text();
      const phaseQuestionsJSON = await this.jsonChatSession.sendMessage(
        chatMessageToJsonify
      );
      phaseLevelQuestions.push(JSON.parse(phaseQuestionsJSON.response.text()));
    }

    return phaseLevelQuestions;
  }

	async documentPhaseDiscussion(
		projectSummary,
		phase,
		phaseChat
	) {
		let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("document_phase_level_discussion", [
        projectSummary
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: [],
    });

		const phaseDiscussionDocument = await chatSession.sendMessage(phase['phase'] + "\n\n" + JSON.stringify(phaseChat));
		return phaseDiscussionDocument.response.text();
	}

	async filterPhaseInformation(
		projectFunStructureDetailed,
    projectTechStructure
	) {
		let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("filter_phase_related_information", [
        projectFunStructureDetailed.join("\n\n")
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: [],
    });

    const phaseRelatedFunctionalDetails = []
    for(let phase of projectTechStructure) {
      const filteredDetails = await chatSession.sendMessage(JSON.stringify(phase));
      phaseRelatedFunctionalDetails.push(filteredDetails.response.text())
    }
    return phaseRelatedFunctionalDetails;
	}

  async preparePhaseRefinementHistory(
    phases,
    phaseDiscussionDocuments,
    phaseStructureTexts
  ) {
    const history = [];
    for(let i = 0; i < phases.length; i++) {
      history.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify(phases[i]) + "\n\n" + phaseDiscussionDocuments[i]
          }
        ]
      });
      history.push({
        role: "model",
        parts: [
          {
            text: phaseStructureTexts[i]
          }
        ]
      });
    }
    return history;
  }
  
  async refinePhase(
    projectFunStructureDetailed,
    projectTechDiscussionDocument,
    phase,
    phaseDiscussionDocument,
    phaseRefinementHistory
  ) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("refine_phase", [
        projectFunStructureDetailed.join("\n\n"),
        projectTechDiscussionDocument
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: phaseRefinementHistory,
    });

    try {
      const phaseStructureText = await chatSession.sendMessage(JSON.stringify(phase) + "\n\n" + phaseDiscussionDocument);
      const chatMessageToJsonify = `Convert below software project phase structure document into JSON structure.
Remove unnecessary prefix like Story 2.1, Epic 1, Task 3, Phase 1. Keep the actual name for items. Example: Phase 1: Project Setup and Core Backend Development -> Project Setup and Core Backend Development

Output JSON format -
{
  name: phase name (string)
	epics: [
		{
			name: epic name (string)
			stories: [
				{
					name: story name (string)
					tasks: [] list of tasks (list of string)
				}
			]
		}
	],
	notes: [] additional information or phase level notes (list of string)
}

` + phaseStructureText.response.text();
      const phaseStructureJSON = await this.jsonChatSession.sendMessage(
        chatMessageToJsonify
      );
      return {
        phaseStructureText: phaseStructureText.response.text(),
        phaseStructureJSON: JSON.parse(phaseStructureJSON.response.text())
      };
    } catch(ex) {
      console.log(ex);
      console.log(phaseStructureText.response.text());
      console.log(phaseStructureJSON.response.text());
      return {};
    }
  }

  async refineEpic(
    phase,
    projectFunStructure,
    phaseRelatedFunctionalDetails,
    projectTechDiscussionDocument,
    phaseDiscussionDocument
  ) {
    let model = this.genAI.getGenerativeModel({
      model: models["pro"],
      systemInstruction: getPrompts("refine_epic", [
        JSON.stringify(projectFunStructure),
        phaseRelatedFunctionalDetails,
        projectTechDiscussionDocument,
        phaseDiscussionDocument,
        phase["notes"].join("\n")
      ]),
    });

    let chatSession = model.startChat({
      generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
      history: phaseRefinementHistory,
    });

    const phaseData = {
      name: phase["name"],
      epics: []
    };
    let i = 0;
    for(let epic of phase["epics"]) {
      epicData = {
        name: epic["name"]
      };
      const epicStructureText = await chatSession.sendMessage(JSON.stringify(epic), {timeout: 1500});
      epicData["data"] = epicStructureText.response.text();
      phaseData["epics"].push(epicData);
      console.log("Completed epic", i);
      i++;
    }
    console.log("Completed phase");
    return phaseData;
  }

  async storyJsonify(
    epic
  ) {
    const chatMessageToJsonify = `Convert below software project epic (` + epic["name"] + `) structure document into JSON structure.
Output JSON format:
{
	stories: [
		{
			name: story name (string),
            description: story description (string),
            tasks: [
                {
                    name: task name (string),
                    description: task description (string),
                }
            ]
		}
	],
	notes: list of epic level notes (list of string),
  dependencies: list of dependencies (list of string),
}

` + epic["data"];
    const epicStructureText = await this.jsonChatSession.sendMessage(
      chatMessageToJsonify
    );
    const epicStructureJSON = JSON.parse(epicStructureText.response.text());
    epic["stories"] = epicStructureJSON["stories"];
    epic["notes"] = epicStructureJSON["notes"];
    epic["dependencies"] = epicStructureJSON["dependencies"];
    return epic;
  }
}

export default AIService;
