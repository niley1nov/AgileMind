import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from 'cors';
import config from "./config.js";
import authRouter from "./routes/auth.js";
import projectRouter from "./routes/projectRouter.js";
import userRouter from "./routes/userRouter.js";

import cookieParser from "cookie-parser";


const PORT = process.env.PORT || 3000;

const app = express();

//Middleware to parse body in json format
app.use(bodyParser.json({ limit: '20mb' }));
app.use(cookieParser());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/project",projectRouter);
app.use("/api/user",userRouter);



//Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Start server on the given port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
