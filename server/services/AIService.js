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

	/**
	 * Initializes a JSON conversion session using gemini model.
	 * This function sets up a session to convert provided text into JSON format.
	 * 
	 * @param {string} projectSummary - A plain text project summary as a context for jsonify model.
	 */
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

	/**
	 * Asynchronously generates a project summary from a given Software Requirement Specification (SRS) document.
	 * Utilizes a generative AI model to interpret and summarize the SRS document into a coherent paragraph.
	 * 
	 * @param {string} srs - The full text of the Software Requirement Specification document.
	 * @returns {Promise<string>} A promise that resolves to a string containing the summarized project description.
	 */
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

	/**
	 * Asynchronously generates project-specific questions from an SRS document and formats them into JSON.
	 * This function processes an SRS document to generate functional and technical questions, which are then converted into a JSON structure suitable for further processing or decision-making.
	 * 
	 * @param {string} srs - The full text of the Software Requirement Specification document.
	 * @returns {Promise<string>} A promise that resolves to a JSON string categorizing questions into functional and technical types.
	 */
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

		// Prepares the prompt for converting the generated questions into JSON format.
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

	/**
	 * Asynchronously converts project-related functional and technical chat discussions from JSON format into structured document formats.
	 * This function takes JSON-formatted chat data, processes it through an AI model, and returns the discussions in a formal document format suitable for reports or presentation.
	 * 
	 * @param {string} projectSRS - The full text of the Software Requirement Specification, used for context in generating responses.
	 * @param {Array} projectFunChat - JSON list containing the functional chat discussion about the project.
	 * @param {Array} projectTechChat - JSON list containing the technical chat discussion about the project.
	 * @returns {Promise<Object>} A promise that resolves to an object containing two properties with the document format of functional and technical discussions.
	 */
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

		// Sends the functional chat JSON to the model and awaits the document-formatted response.
		const resultFunDoc = await chatSession.sendMessage(JSON.stringify(projectFunChat));

		// Sends the technical chat JSON to the model and awaits the document-formatted response.
		const resultTechDoc = await chatSession.sendMessage(JSON.stringify(projectTechChat));

		// Returns the formatted documents for both functional and technical discussions.
		return {
			projectFunDiscussionDocument: resultFunDoc.response.text(),
			projectTechDiscussionDocument: resultTechDoc.response.text(),
		};
	}

	/**
	 * Asynchronously generates and refines the functional structure of a project based on the SRS and functional discussion documents.
	 * This function processes textual inputs to produce a detailed functional breakdown of a project, which is then formatted into JSON.
	 * 
	 * @param {string} projectSRS - The Software Requirement Specification document for context.
	 * @param {string} projectFunDiscussionDocument - The document containing functional discussions related to the project.
	 * @returns {Promise<Object>} A promise that resolves to an object containing two properties: the initial JSON formatted structure and a detailed version of the structure.
	 */
	async generateFunctionalStructure(
		projectSRS,
		projectFunDiscussionDocument
	) {
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

		// Sends a message to the AI model to generate a project structure based on the provided documents, excluding technical details.
		const chatMessage = `Prepare a full project structure based on SRS and functional discussion document.
It should contain all functional features.
Structure should contain features and sub features.
Don't add technical details for now. Don't give numbering to tasks.`;
		const projectStructureRes = await chatSession.sendMessage(chatMessage);

		// Prepares the generated structure for conversion into a JSON format.
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

		// Iterates through each feature in the JSON structure to add detailed functional descriptions.
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

		// Returns both the initial structured JSON and the detailed versions.
		return {
			projectFunStructure: JSON.parse(projectFunStructure.response.text()),
			projectFunStructureDetailed: projectFunStructureDetailed,
		};
	}

	/**
	 * Asynchronously generates a detailed technical implementation plan for a software project from a project summary, technical discussions, and a detailed functional structure.
	 * This function processes the provided texts to produce a structured technical breakdown of the project, which is then formatted into JSON.
	 *
	 * @param {string} projectSummary - A summary of the project that provides high-level information.
	 * @param {string} projectTechDiscussionDocument - The document containing technical discussions related to the project.
	 * @param {Array} projectFunStructureDetailed - The detailed functional structure of the project, used as a basis for the technical plan.
	 * @returns {Promise<Object>} A promise that resolves to a JSON object detailing the project's technical implementation phases and tasks.
	 */
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

		// Sends a message to the AI model to generate a project implementation plan based on the provided documents.
		const chatMessage = `Use below project requirement document and technical discussion document to create a detailed project implementation plan for the team.
Divide the project into phases. Each phase can have analysis, design, development, testing, deployment or any other type of tasks.
Don't give numbering to tasks.

Project requirement structure -
` + projectFunStructureDetailed.join('\n\n');
		const projectStructureRes = await chatSession.sendMessage(chatMessage);

		// Prepares the generated structure for conversion into a JSON format.
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

		// Returns the structured JSON detailing the project's technical phases and tasks.
		return JSON.parse(projectTechnicalStructure.response.text());
	}

	/**
	 * Asynchronously generates targeted questions for each phase of a project using a generative AI model, based on detailed functional and technical structures.
	 * This function processes each phase to produce a list of questions that are then formatted into JSON for clarity and ease of use.
	 *
	 * @param {string} projectFunStructureDetailed - A detailed string representation of the project's functional structure.
	 * @param {Array} projectTechnicalStructure - An array of objects, each representing a phase of the project's technical structure.
	 * @returns {Promise<Array>} A promise that resolves to an array of JSON objects, each containing questions for a specific phase of the project.
	 */
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
		// Iterates through each phase of the technical structure to generate questions.
		for (let phase of projectTechnicalStructure) {
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

	/**
	 * Asynchronously generates a detailed document from a phase-specific chat discussion for a software project.
	 * This function processes a JSON-formatted chat discussion related to a project phase and converts it into a coherent, structured text document.
	 *
	 * @param {string} projectSummary - A summary of the project that provides context for the discussion.
	 * @param {object} phase - An object representing a specific phase of the project, including its name and other relevant details.
	 * @param {Array} phaseChat - JSON array containing the chat discussion about the project phase.
	 * @returns {Promise<string>} A promise that resolves to a string containing the formatted phase discussion document.
	 */
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

		// Sends the phase information and chat discussion to the model and awaits the formatted document.
		const phaseDiscussionDocument = await chatSession.sendMessage(phase['phase'] + "\n\n" + JSON.stringify(phaseChat));
		return phaseDiscussionDocument.response.text();
	}

	/**
	 * Asynchronously filters and extracts functional details relevant to specific phases of a project using a generative AI model.
	 * This function processes the project's functional structure to identify and extract details relevant to each phase defined in the technical structure.
	 *
	 * @param {string} projectFunStructureDetailed - A detailed string representation of the project's functional structure.
	 * @param {Array} projectTechStructure - An array of objects, each representing a phase of the project's technical structure.
	 * @returns {Promise<Array>} A promise that resolves to an array of strings, each containing the functional details relevant to a specific phase of the project.
	 */
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
		// Iterates through each phase of the technical structure to filter relevant functional details.
		for (let phase of projectTechStructure) {
			const filteredDetails = await chatSession.sendMessage(JSON.stringify(phase));
			phaseRelatedFunctionalDetails.push(filteredDetails.response.text())
		}
		return phaseRelatedFunctionalDetails;
	}

	/**
	 * Constructs a chat history for previous interactions between a user and an AI model regarding phase refinement.
	 * This function generates a structured history that can be used to provide context in subsequent AI interactions, ensuring consistency and coherence in the AI's responses based on past discussions.
	 *
	 * @param {Array} phases - An array of phase objects, each representing a specific phase of the project.
	 * @param {Array} phaseDiscussionDocuments - An array of strings, each containing discussion details about a corresponding phase.
	 * @param {Array} phaseStructureTexts - An array of strings, each representing the AI-generated structured text for a corresponding phase.
	 * @returns {Array} A history array structured to simulate a chat session between a user and an AI model.
	 */
	preparePhaseRefinementHistory(
		phases,
		phaseDiscussionDocuments,
		phaseStructureTexts
	) {
		const history = [];
		for (let i = 0; i < phases.length; i++) {
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

	/**
	 * Asynchronously refines a project phase using a generative AI model, based on functional and technical discussion documents.
	 * This function processes the phase details and related discussion documents to generate a refined phase structure, which is then converted into JSON.
	 *
	 * @param {string} projectFunStructureDetailed - A detailed string representation of the project's functional structure.
	 * @param {string} projectTechDiscussionDocument - The document containing technical discussions about the project.
	 * @param {object} phase - An object representing a specific phase of the project.
	 * @param {string} phaseDiscussionDocument - A text document that contains discussion details about the phase.
	 * @param {Array} phaseRefinementHistory - An array of previous interactions/messages that provide context for the current refinement session.
	 * @returns {Promise<Object>} A promise that resolves to an object containing the refined phase structure in both text and JSON formats.
	 */
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
		let phaseStructureText = {};
		let phaseStructureJSON = {};
		try {
			// Sends the current phase details and discussion to the model and awaits the refined structure.
			phaseStructureText = await chatSession.sendMessage(JSON.stringify(phase) + "\n\n" + phaseDiscussionDocument);
			console.log('\n phaseStructureText '+JSON.stringify(phaseStructureText));
			// Prepares the refined structure for conversion into JSON.
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
			phaseStructureJSON = await this.jsonChatSession.sendMessage(
				chatMessageToJsonify
			);
			console.log('>>>> AISERVICE phaseStructureText ' + phaseStructureText.response.text());
			console.log('>>>> AISERVICE phaseStructureJSON ' + phaseStructureJSON.response.text());
			return {
				phaseStructureText: phaseStructureText.response.text(),
				phaseStructureJSON: JSON.parse(phaseStructureJSON.response.text())
			};
		} catch (ex) {
			// Handle exceptions by logging errors and returning an empty object if the process fails.
			console.log('\n Exception '+JSON.stringify(ex));
			console.log(phaseStructureText.response.text());
			console.log(phaseStructureJSON.response.text());
			return {};
		}
	}

	/**
	 * Asynchronously refines each epic within a project phase using a generative AI model.
	 * This function processes the details of each epic, enhancing them with additional descriptions and tasks based on a comprehensive set of project documents.
	 *
	 * @param {object} phase - The current phase object, including names and any specific notes related to the phase.
	 * @param {object} projectFunStructure - The entire project's functional structure.
	 * @param {string} phaseRelatedFunctionalDetails - Functional details specific to the current phase.
	 * @param {string} projectTechDiscussionDocument - A document containing technical discussions about the project.
	 * @param {string} phaseDiscussionDocument - A document containing discussions specifically about the current phase.
	 * @returns {Promise<object>} A promise that resolves to an object containing the refined details of each epic within the phase.
	 */
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
				phase["notes"] ? phase["notes"].join("\n") : ''
			]),
		});

		let chatSession = model.startChat({
			generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
			history: [],
		});

		const phaseData = {
			name: phase["name"],
			epics: []
		};
		let i = 0;
		// Iterates through each epic in the phase.
		for (let epic of phase["epics"]) {
			let epicData = {
				name: epic["name"]
			};
			// Sends each epic to the AI model for refinement.
			const epicStructureText = await chatSession.sendMessage(JSON.stringify(epic), { timeout: 1500 });
			epicData["data"] = epicStructureText.response.text();
			phaseData["epics"].push(epicData);
			console.log("Completed epic", i);
			i++;
		}
		console.log("Completed phase");
		return phaseData;
	}

	/**
	 * Asynchronously converts an epic's refined text data into a structured JSON format, detailing stories, notes, and dependencies.
	 * This function processes text data for an epic to extract and structure stories, notes, and dependencies into JSON, aiding in systematic project management and documentation.
	 *
	 * @param {object} epic - An object representing an epic, containing both the name and refined text data of the epic.
	 * @returns {Promise<object>} A promise that resolves to the same epic object, now enhanced with structured JSON data for stories, notes, and dependencies.
	 */
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
      tasks: story tasks as it is (string)
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
		console.log('>>>> EPIC FROM AI CLASS ' + epic);
		return epic;
	}

	/**
	 * Asynchronously enriches each story in an epic with metadata using a generative AI model.
	 * This function processes each story to generate metadata based on technical and functional documents related to the project phase and epic.
	 *
	 * @param {object} epic - The epic object, which includes an array of stories.
	 * @param {string} projectTechDiscussionDocument - A document containing technical discussions about the project.
	 * @param {string} phaseDiscussionDocument - A document containing discussions specifically about the current phase.
	 * @param {string} phaseRelatedFunctionalDetails - Functional details specific to the current phase.
	 * @returns {Promise<object>} A promise that resolves to the epic object with enriched story metadata.
	 */
	async initStoryMetadata(
		epic,
		projectTechDiscussionDocument,
		phaseDiscussionDocument,
		phaseRelatedFunctionalDetails
	) {
		let model = this.genAI.getGenerativeModel({
			model: models["pro"],
			systemInstruction: getPrompts("story_metadata", [
				JSON.stringify(epic["data"]),
				projectTechDiscussionDocument,
				phaseDiscussionDocument,
				phaseRelatedFunctionalDetails
			]),
		});

		let chatSession = model.startChat({
			generationConfig: getGenConfig(0.4, "application/json", 4096, 0.95, 64),
			history: [],
		});

		// Iterates through each story in the epic and requests metadata from the AI model.
		for (let story of epic["stories"]) {
			const metadataText = await chatSession.sendMessage(
				JSON.stringify(story)
			);
			const storyMetadata = JSON.parse(metadataText.response.text());
			story["metadata"] = storyMetadata; // Assigns the generated metadata back to the story object.
		}

		return epic; // Returns the epic object with enriched stories.
	}

	/**
	 * Asynchronously refines or splits a story within an epic based on its metadata and other project-related documents.
	 * This function uses a generative AI model to analyze the story, its context, and related documents, deciding on the need for refinement or breaking down the story into smaller, manageable parts.
	 *
	 * @param {object} epic - The epic object containing stories and notes relevant to the story being refactored.
	 * @param {string} projectTechDiscussionDocument - A document containing technical discussions about the project.
	 * @param {string} phaseDiscussionDocument - A document containing discussions specifically about the current phase.
	 * @param {string} phaseRelatedFunctionalDetails - Functional details specific to the current phase.
	 * @param {object} story - The specific story within the epic that needs to be refactored.
	 * @returns {Promise<Array>} A promise that resolves to an array of new or refined stories.
	 */
	async refactorStory(
		epic,
		projectTechDiscussionDocument,
		phaseDiscussionDocument,
		phaseRelatedFunctionalDetails,
		story
	) {
		let model = this.genAI.getGenerativeModel({
			model: models["pro"],
			systemInstruction: getPrompts("refactor_story", [
				JSON.stringify(epic["stories"]),
				epic["notes"].join("\n"),
				projectTechDiscussionDocument,
				phaseDiscussionDocument,
				phaseRelatedFunctionalDetails
			]),
		});

		let chatSession = model.startChat({
			generationConfig: getGenConfig(0.3, "text/plain", 16384, 0.95, 64),
			history: [],
		});

		const newStoriesText = await chatSession.sendMessage(
			JSON.stringify(story)
		);
		const chatMessageToJsonify = `Convert below list of user stories into JSON structure.
Output JSON format:
[
	{{
		name: story name (String),
		description: story description (string),
        tasks: story tasks as it is (string),
		metadata: {{
			story_points: A unit of measurement used to estimate the relative effort required to complete a piece of work. This can be a number from fibonacci series. Example- 1, 2, 3, 5, 8, 13 (Integer).
			confidence: How confident are you about given story. output can be low, medium, high (Enum).
			MoSCoW: Story Priority. Output can be Must Have, Should Have, Could Have, Won't Have (Enum).
		}}
	}}
]

` + newStoriesText.response.text();
		const jsonResponse = await this.jsonChatSession.sendMessage(
			chatMessageToJsonify
		);
		const newStories = JSON.parse(jsonResponse.response.text());
		return newStories;
	}

	/**
	 * Asynchronously calculates dependencies among stories within an epic using a generative AI model.
	 * This function analyzes the stories in an epic to identify finish-to-start dependencies and prepares a structured representation of these relationships.
	 *
	 * @param {object} epic - An object representing an epic that includes a list of stories and notes.
	 * @returns {Promise<object>} A promise that resolves to an object mapping each story to its dependencies, index in the sequence, and story points.
	 */
	async calculateDependencies(
		epic
	) {
		let model = this.genAI.getGenerativeModel({
			model: models["pro"],
			systemInstruction: getPrompts("calculate_dependencies", [
				epic["name"],
				JSON.stringify(epic["stories"]),
				epic["notes"] ? epic["notes"].join("\n") : ''
			]),
		});

		let chatSession = model.startChat({
			generationConfig: getGenConfig(0.2, "application/json", 16384, 0.95, 64),
			history: [],
		});

		const inputStories = []; // Prepares a list to store the basic story information.
		const storyPoints = {}; // A dictionary to store story points by story name.
		for (let story of epic["stories"]) {
			inputStories.push({
				story: story["name"],
				dependencies: [] // Initializes an empty list for dependencies.
			})
			storyPoints[story["name"]] = Number(story["metadata"]["story_points"])
		}

		// Sends the list of stories to the AI model to calculate dependencies.
		const dependenciesText = await chatSession.sendMessage(
			JSON.stringify(inputStories)
		);
		const dependencies = JSON.parse(dependenciesText.response.text());
		const dependsOn = {}; // Prepares an object to map each story to its dependencies and other details.
		let i = 0;
		for (let story of dependencies) {
			dependsOn[story.story] = {
				"deps": story.dependencies, // List of dependencies for the story.
				"index": i, // Index of the story in the input list.
				"points": storyPoints[story.story] // Story points associated with the story.
			};
			i++;
		}
		return dependsOn;
	}
}

export default AIService;
