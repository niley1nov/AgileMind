import User from "../models/User.js";
import bcrypt from "bcrypt";

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
