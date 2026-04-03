import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";

// User Authentication Middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized Access denied",
      });
    }
    const token_decode = jwt.verify(token, JWT_SECRET);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    // Handle bad/expired token without crashing flow
    console.error("Auth error:", error?.message || error);
    res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please login again.",
      code: "INVALID_TOKEN",
    });
  }
};

export default authUser;
