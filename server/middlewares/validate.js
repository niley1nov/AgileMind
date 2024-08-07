import zod from "zod";

function validateRegistrationDetails(req, res, next) {
	const userSchema = zod.object({
		firstName: zod.string(),
		lastName: zod.string(),
		userEmail: zod.string().email(),
		password: zod.string().min(8),
		role: zod.string().refine(
			(role) => {
				const roleTypes = ["Project Manager", "Developer", "Tester"];
				return roleTypes.includes(role);
			},
			{
				message: "Invalid Role",
			}
		),
	});
	const userDetail = req.body;
	const result = userSchema.safeParse(userDetail);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}

function validateLoginDetails(req, res, next) {
	const userSchema = zod.object({
		userEmail: zod.string().email(),
		password: zod.string().min(8),
	});
	const userDetail = req.body;
	const result = userSchema.safeParse(userDetail);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}

function validateProjectDetails(req, res, next) {
	const projectSchema = zod.object({
		projectName: zod.string(),
		projectDecription: zod.string(),
		startDate: zod.coerce.date(),
		releaseDate: zod.coerce.date(),
		fileInfo: zod.object({
			fileName: zod.string(),
			data: zod.array(zod.number()).transform((arr) => Buffer.from(arr)),
			contentType: zod.string().refine(
				(type) => {
					const mimeTypes = ["pdf", "txt"];
					return mimeTypes.includes(type);
				},
				{
					message: "Invalid content type",
				}
			),
		}),
	});
	const projectDetails = req.body;
	const result = projectSchema.safeParse(projectDetails);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}


function validateProjectAssignmentDetails(req, res, next) {
	const projectAssignemtSchema = zod.object({
		userRole: zod.string().refine(
			(role) => {
				const roleTypes = ["Project Manager", "Developer", "Tester"];
				return roleTypes.includes(role);
			},
			{
				message: "Invalid Role",
			}
		),
		userEmail: zod.string().email(),
		startDate: zod.coerce.date(),
		endDate: zod.coerce.date(),
		projectId: zod.string()
	});
	const projectAssignmetDetails = req.body;
	const result = projectAssignemtSchema.safeParse(projectAssignmetDetails);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}


function validateUpdateAnswersDetails(req, res, next) {
	const questionAnswerSchema = zod.array(
		zod.object({
			id: zod.string(),
			answer: zod.string()
		})
	);
	const questionAnswerDetails = req.body;
	const result = questionAnswerSchema.safeParse(questionAnswerDetails);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}

function validateSubmitQuestionsDetails(req, res, next) {
	const questionAnswerSchema = zod.object({
		parentId: zod.string(),
		type: zod.string(),
		questions: zod.array(
			zod.object({
				id: zod.string(),
				answer: zod.string()
			})
		)
	});
	const questionAnswerDetails = req.body;
	const result = questionAnswerSchema.safeParse(questionAnswerDetails);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}

function validateUpdateStoryDetails(req, res, next) {
	const storyDetailSchema = zod.object({
		storyId: zod.string(),
		devOwnerEmail: zod.union([zod.string().email(), zod.string().length(0)]),
		qaOwnerEmail: zod.union([zod.string().email(), zod.string().length(0)]),
		storyStatus: zod.string().refine(
			(status) => {
				const statusList = ["","Planned","Assigned","In Progress","Blocked","Backlog","Completed"];
				return statusList.includes(status);
			},
			{
				message: "Invalid Status",
			}
		),
		confidence: zod.string().refine(
			(confidence) => {
				const confidenceList = ["high", "medium","low"];
				return confidenceList.includes(confidence);
			},
			{
				message: "Invalid Confidence",
			}
		),
		moscow: zod.string().refine(
			(moscow) => {
				const moscowList = ["Must Have", "Should Have", "Could Have", "Won't Have"];
				return moscowList.includes(moscow);
			},
			{
				message: "Invalid MoSCoW",
			}
		),
		storyPoint: zod.coerce.number(),
		reMarks: zod.string()

	});

	const storyDetails = req.body;
	const result = storyDetailSchema.safeParse(storyDetails);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}

function validateStoryRefectorReqDetails(req, res, next) {
	const reqDetailSchema = zod.object({
		storyId: zod.string(),
	});
	const reqDetail = req.body;
	const result = reqDetailSchema.safeParse(reqDetail);
	if (!result.success) {
		res.status(422).json({ error: result.error });
	}else{
		next();
	}
}




export {
	validateRegistrationDetails,
	validateLoginDetails,
	validateProjectDetails,
	validateProjectAssignmentDetails,
	validateUpdateAnswersDetails,
	validateSubmitQuestionsDetails,
	validateUpdateStoryDetails,
	validateStoryRefectorReqDetails
};
