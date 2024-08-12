import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * The function `RegisterUser` checks if a user already exists in the database and either registers a
 * new user or returns an error message.
 * @param req - The `req` parameter in the `RegisterUser` function typically represents the HTTP
 * request object, which contains information about the incoming request from the client, such as the
 * request headers, parameters, body, and more. In this specific context, `req.body` is used to access
 * the body of the
 * @param res - The `res` parameter in the `RegisterUser` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, headers, and send data back to the client in the form of JSON, HTML, or
 */
async function RegisterUser(req, res) {
	const userDetail = req.body;
	try {
		const existingUser = await User.findOne({ userEmail: userDetail.userEmail });

		if (existingUser) {
			res.status(403).json({
				status: "failed",
				message: "It seems you already have an account. Please log in instead",
			});
		} else {
			const newUser = new User({
				userEmail: userDetail.userEmail,
				password: userDetail.password,
				role: userDetail.role,
				firstName: userDetail.firstName,
				lastName: userDetail.lastName
			});
			const savedUser = await newUser.save();
			res.status(200).json({
				status: "success",
				message:
					"Thank you for registering with us. Your account has been successfully created.",
			});
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error ",
		});
	}
}

/**
 * The function `loginUser` handles user login by checking user credentials and generating a JWT token
 * upon successful login.
 * @param req - The `req` parameter in the `loginUser` function stands for the request object, which
 * contains information about the HTTP request that triggered the function. This object typically
 * includes details such as the request headers, parameters, body, and other relevant information sent
 * by the client to the server. In this case
 * @param res - The `res` parameter in the `loginUser` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, headers, and send data back to the client in the form of JSON, HTML, or
 */
async function loginUser(req, res) {
	const userDetail = req.body;
	try {
		const loggedInUser = await User.findOne({
			userEmail: userDetail.userEmail,
		});
		if (!loggedInUser) {
			res.status(401).json({
				status: "failed",
				message:
					"User doesn't exist. Please register a user with this email first",
			});
		} else {
			const isPasswordCorrect = bcrypt.compareSync(
				userDetail.password,
				loggedInUser.password
			);
			if (!isPasswordCorrect) {
				res.status(401).json({
					status: "failed",
					message: "Your password is incorrect please try again.",
				});
			} else {
				const token = loggedInUser.generateJWTToken();
				res.status(200).json({
					status: "success",
					message: "You have successfully logged in.",
					token: token
				});
			}
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
}

export { RegisterUser, loginUser };
