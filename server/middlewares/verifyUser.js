import jwt from "jsonwebtoken";
import config from "../config.js";
import User from "../models/User.js";

async function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers["cookie"]; // get the session cookie from request header
    if (!authHeader) return res.sendStatus(401); // if there is no cookie from request header, send an unauthorized response.
    const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt
    jwt.verify(cookie, config.JWT_SECRET_TOKEN, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "This session has expired. Please login",
        });
      }
      const { id } = decoded; // get user id from the decoded token
      const userData = await User.findById(id);
      req.user = userData; // put the data object into req.user
      next();
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
}

export { verifyUser };
