import express from "express";
import Friendship from "../models/Friendship.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

function normalizeProfileUrl(url, req) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${protocol}://${host}${url.startsWith("/") ? url : `/${url}`}`;
}

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
      const friend = f.userId === req.user.id ? f.friend : f.user;
      const data = friend.toJSON();
      data.profilePicture = normalizeProfileUrl(data.profilePicture, req);
      return data;
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
    const normalized = requests.map(r => ({
      ...r.toJSON(),
      user: {
        ...r.user.toJSON(),
        profilePicture: normalizeProfileUrl(r.user.profilePicture, req)
      }
    }));
    res.json(normalized);
  } catch (err) {
    console.error("Get pending requests error:", err);
    res.status(500).json({ error: "Failed to get pending requests" });
  }
});

router.get("/all-pending", auth, async (req, res) => {
  try {
    const requests = await Friendship.findAll({
      where: {
        userId: req.user.id,
        status: "pending"
      },
      attributes: ["id", "friendId", "status", "createdAt"]
    });
    res.json(requests);
  } catch (err) {
    console.error("Get all pending requests error:", err);
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
