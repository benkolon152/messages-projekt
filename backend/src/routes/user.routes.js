import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username"],
      where: {
        id: { [Op.ne]: req.user.id }
      }
    });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
