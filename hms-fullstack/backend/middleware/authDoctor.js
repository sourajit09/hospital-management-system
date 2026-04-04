import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";

// Doctor Authentication Middleware
const authDoctor = async (req, res, next) => {
  try {
    let dtoken = req.headers.dtoken;
    const auth = req.headers.authorization;
    if (!dtoken && typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
      dtoken = auth.slice(7).trim();
    }
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Unauthorized Access denied",
      });
    }
    const token_decode = jwt.verify(dtoken, JWT_SECRET);
    const tokenDoctorId =
      typeof token_decode === "string"
        ? null
        : token_decode?.id || token_decode?.docId;

    if (!tokenDoctorId) {
      return res.json({
        success: false,
        message: "Invalid doctor session",
      });
    }

    req.body.docId = tokenDoctorId;
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
