import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const extension = path.extname(file.originalname || "");
    const baseName = path
      .basename(file.originalname || "doctor-image", extension)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    callback(
      null,
      `${Date.now()}-${baseName || "doctor-image"}${extension || ".jpg"}`
    );
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
  ]);

  if (
    file.mimetype?.startsWith("image/") ||
    allowedExtensions.has(extension)
  ) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
