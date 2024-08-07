import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: "First Name is a required field" },
    lastName: { type: String, required: "Last Name is a required field" },
    userEmail: {
      type: String,
      required: "Email is a required field",
      unique: true,
    },
    password: { type: String, required: "Password is a required field" },
    role: { type: String, required: "Role is a required field" },
  },
  {
    methods: {
      generateJWTToken() {
        const payload = { id: this._id };
        return jwt.sign(payload, config.JWT_SECRET_TOKEN, {
          expiresIn: "60m",
        });
      },
    },
  }
);

//Trigger before creating any user in database
userSchema.pre("save", function (next) {
  const saltRounds = 10;
  bcrypt.hash(this.password, saltRounds, (err, hash) => {
    if (err) {
      next(err);
    } else {
      this.password = hash;
      next();
    }
  });
});

export default mongoose.model("users", userSchema);
