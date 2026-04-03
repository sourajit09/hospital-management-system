import jwt from "jsonwebtoken";

const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL || "doctor@example.com";
const DOCTOR_PASSWORD = process.env.DOCTOR_PASSWORD || "doctor123";
const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";
const allowBypass = process.env.ALLOW_DOCTOR_BYPASS !== "false"; // default true

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
    // token may be a string or object; handle both
    const tokenDoctorId =
      typeof token_decode === "string"
        ? token_decode
        : token_decode?.id || token_decode?.docId || "env-doctor";

    if (tokenDoctorId === "env-doctor" && !allowBypass) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    req.body.docId = tokenDoctorId;
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
