import zod from "zod";

function validateRegistrationDetails(req, res, next) {
  const userSchema = zod.object({
    userEmail: zod.string().email(),
    password: zod.string().min(5),
    profile: zod.string(),
  });
  const userDetail = req.body;
  const result = userSchema.safeParse(userDetail);
  if (!result.success) {
    res.status(422).json({ error: result.error });
  }
  next();
}

function validateLoginDetails(req, res, next) {
  const userSchema = zod.object({
    userEmail: zod.string().email(),
    password: zod.string().min(5),
  });
  const userDetail = req.body;
  const result = userSchema.safeParse(userDetail);
  if (!result.success) {
    res.status(422).json({ error: result.error });
  }
  next();
}

export { validateRegistrationDetails, validateLoginDetails };
