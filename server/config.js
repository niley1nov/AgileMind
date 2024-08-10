import dotenv from 'dotenv';
dotenv.config();

const config = {
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN,
	GEMINI_API_TOKEN: process.env.GEMINI_API_TOKEN
};

export default config;