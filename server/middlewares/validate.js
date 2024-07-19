import zod from "zod";

function validateRegistrationDetails(req, res, next) {
  const userSchema = zod.object({
    firstName: zod.string(),
    lastName: zod.string(),
    userEmail: zod.string().email(),
    password: zod.string().min(8),
    contentType: zod.string().refine(
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
  }
  next();
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
  }
  next();
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
          const mimeTypes = ["pdf"];
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
  }
  console.log()
  next();
}


function validateSearchUserPayload(req, res, next){
  const userSchema = zod.object({
    userEmail: zod.string(),
    userRole: zod.string(),
  });
  const userDetail = req.body;
  const result = userSchema.safeParse(userDetail);
  if (!result.success) {
    res.status(422).json({ error: result.error });
  }
  next();
}

export {
  validateRegistrationDetails,
  validateLoginDetails,
  validateProjectDetails,
  validateSearchUserPayload
};
