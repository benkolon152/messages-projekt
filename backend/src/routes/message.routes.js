import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Friendship from "../models/Friendship.js";
import auth from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: req.user.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Can't message yourself
    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    // Check if users are friends
    const friendship = await Friendship.findOne({
      where: {
        status: "accepted",
        [Op.or]: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({ error: "You must be friends to message" });
    }

    const message = await Message.create({
      content,
      senderId,
      receiverId
    });

    res.json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
