import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { Op } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

const router = express.Router();

// Helper: convert relative upload paths to absolute HTTPS URLs
function getAbsoluteProfilePictureUrl(relativePath, req) {
  if (!relativePath) return null;
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${protocol}://${host}${relativePath}`;
}

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "profilePicture"],
      where: {
        id: { [Op.ne]: req.user.id }
      }
    });
    const usersWithAbsoluteUrls = users.map(user => ({
      ...user.toJSON(),
      profilePicture: getAbsoluteProfilePictureUrl(user.profilePicture, req)
    }));
    res.json(usersWithAbsoluteUrls);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "profilePicture"]
    });
    const userData = user.toJSON();
    userData.profilePicture = getAbsoluteProfilePictureUrl(user.profilePicture, req);
    res.json(userData);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.post("/profile-picture", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findByPk(req.user.id);
    
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, "../../uploads", path.basename(user.profilePicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;
    user.profilePicture = profilePictureUrl;
    await user.save();

    const absoluteUrl = getAbsoluteProfilePictureUrl(profilePictureUrl, req);
    res.json({ profilePicture: absoluteUrl });
  } catch (err) {
    console.error("Upload profile picture error:", err);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

export default router;
