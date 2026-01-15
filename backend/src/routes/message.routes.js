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
      where: {
        [Op.or]: [
          { receiverId: req.user.id },
          { senderId: req.user.id }
        ]
      },
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

    console.log("POST /messages - senderId:", senderId, "receiverId:", receiverId, "content:", content);

    if (senderId === receiverId) {
      console.log("Error: Cannot message yourself");
      return res.status(400).json({ error: "Cannot message yourself" });
    }

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
      console.log("Error: Not friends. senderId:", senderId, "receiverId:", receiverId);
      return res.status(403).json({ error: "You must be friends to message" });
    }

    const message = await Message.create({
      content,
      senderId,
      receiverId
    });

    console.log("Message created successfully:", message.toJSON());
    res.json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
