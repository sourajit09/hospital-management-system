import jwt from "jsonwebtoken";

// Use the same fallback credentials and secret as loginAdmin to keep behavior consistent
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";
const allowBypass = process.env.ALLOW_ADMIN_BYPASS !== "false"; // default true

// Admin Authentication Middleware
const authAdmin = async (req, res, next) => {
  try {
    let atoken = req.headers.atoken;
    const auth = req.headers.authorization;
    if (!atoken && typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
      atoken = auth.slice(7).trim();
    }
    if (!atoken) {
      return res.json({
        success: false,
        message: "Unauthorized Access denied",
      });
    }
    const token_decode = jwt.verify(atoken, JWT_SECRET);
    if (token_decode !== ADMIN_EMAIL + ADMIN_PASSWORD && !allowBypass) {
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;
