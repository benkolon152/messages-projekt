import express from "express";
import Friendship from "../models/Friendship.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const friendships = await Friendship.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ userId: req.user.id }, { friendId: req.user.id }]
      },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "profilePicture"] },
        { model: User, as: "friend", attributes: ["id", "username", "profilePicture"] }
      ]
    });

    const friends = friendships.map(f => {
      return f.userId === req.user.id ? f.friend : f.user;
    });

    res.json(friends);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ error: "Failed to get friends" });
  }
});

router.post("/request/:userId", auth, async (req, res) => {
  try {
    const friendId = req.params.userId;
    const userId = req.user.id;

    if (userId === parseInt(friendId)) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Request already exists" });
    }

    const friendship = await Friendship.create({
      userId,
      friendId,
      status: "pending"
    });

    res.json(friendship);
  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

router.post("/accept/:friendshipId", auth, async (req, res) => {
  try {
    const friendship = await Friendship.findByPk(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    if (friendship.friendId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    friendship.status = "accepted";
    await friendship.save();

    res.json(friendship);
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

router.get("/requests/pending", auth, async (req, res) => {
  try {
    const requests = await Friendship.findAll({
      where: {
        friendId: req.user.id,
        status: "pending"
      },
      include: [{
        model: User,
        as: "user",
        attributes: ["id", "username", "profilePicture"]
      }]
    });
    res.json(requests);
  } catch (err) {
    console.error("Get pending requests error:", err);
    res.status(500).json({ error: "Failed to get pending requests" });
  }
});

router.post("/decline/:friendshipId", auth, async (req, res) => {
  try {
    const friendship = await Friendship.findByPk(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    if (friendship.friendId !== req.user.id && friendship.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await friendship.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("Decline friend request error:", err);
    res.status(500).json({ error: "Failed to decline friend request" });
  }
});

export default router;
