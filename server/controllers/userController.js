import User from '../models/User.js';
import Story from '../models/Story.js';
import Epic from '../models/Epic.js';
import Phase from '../models/Phase.js';
import Project from '../models/Project.js';

/**
 * The function `getUserByEmail` retrieves user details based on email and role from the database and
 * returns them as JSON, handling errors with a 500 status code if necessary.
 * @param req - The `req` parameter typically represents the request object in Node.js applications. It
 * contains information about the HTTP request that triggered the function, such as request headers,
 * parameters, query strings, and more. In the provided code snippet, `req` is used to access query
 * parameters using `req.query`.
 * @param res - The `res` parameter in the `getUserByEmail` function is typically used to send a
 * response back to the client making the request. In this case, it is the response object that will be
 * used to send the JSON response containing the user details back to the client.
 */
async function getUserByEmail(req, res) {
	try {
		const userDetails = req.query;
		const users = await User.find(
			{ userEmail: new RegExp(userDetails.userEmail, 'i'), role: userDetails.userRole },
			'_id userEmail'
		);
		res.json(users);
	} catch (err) {
		es.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


/**
 * The function `getNavigationInfo` retrieves navigation information based on the provided page name
 * and record ID, handling different cases for various page types like Story, Epic, Phase, and Project.
 * @param req - `req` is the request object containing information about the HTTP request such as query
 * parameters, headers, and body data. In this function, `req` is used to extract the `id` and
 * `pageName` query parameters to determine the navigation flow.
 * @param res - The `res` parameter in the `getNavigationInfo` function is the response object that
 * will be used to send a response back to the client making the request. In this case, the function is
 * expected to return a JSON response containing the navigation information based on the provided `req`
 * (request)
 */
async function getNavigationInfo(req, res) {
	try {
		let recordId = req.query.id;
		let pageName = req.query.pageName;
		const navigationList = [];

		if(pageName == 'Functional Questions' || pageName == 'Technical Questions'){
			navigationList.unshift({ label: pageName, link: null });
			pageName = 'Project';
		}
		if(pageName == 'Phase Questions'){
			navigationList.unshift({ label: pageName, link: null });
			pageName = 'Phase';
		}

		if (pageName == 'Story') {
			const storyData = await Story.findOne({ _id: recordId });
			navigationList.unshift({ label: 'Story: ' + storyData.storyName, link: null });
			recordId = storyData.epicId;
			pageName = 'Epic';
		}

		if (pageName == 'Epic') {
			const epicData = await Epic.findOne({ _id: recordId });
			navigationList.unshift({ label: 'Epic: ' + epicData.epicName, link: `/Epic/${recordId}` });
			recordId = epicData.phaseId;
			pageName = 'Phase';
		}

		if (pageName == 'Phase') {
			const phaseData = await Phase.findOne({ _id: recordId });
			navigationList.unshift({ label: phaseData.phaseName, link: `/Phase/${recordId}` });
			recordId = phaseData.projectId;
			pageName = 'Project';
		}

		if (pageName == 'Project') {
			const projectData = await Project.findOne({ _id: recordId });
			navigationList.unshift({ label: 'Project: ' + projectData.projectName, link: `/Project/${recordId}` });
			navigationList.unshift({ label: 'Dashboard', link: '/' });
		}
		res.json(navigationList);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `getUserInfo` retrieves and returns the first name and role of a user from the request
 * object in a JSON response, handling errors with a 500 status code if any occur.
 * @param req - The `req` parameter typically represents the request object in Node.js applications. It
 * contains information about the HTTP request that is being made, such as the request headers,
 * parameters, body, and more. In this context, `req.user.firstName` and `req.user.role` are likely
 * properties that hold
 * @param res - The `res` parameter in the `getUserInfo` function is typically the response object in
 * Node.js that is used to send a response back to the client making the request. It is commonly used
 * to send JSON data, set status codes, and provide other response-related functionalities.
 */
async function getUserInfo(req, res){
	try{
		res.json({userFirstName: req.user.firstName, userRole: req.user.role});
	}catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}

}


export { getUserByEmail, getNavigationInfo, getUserInfo};