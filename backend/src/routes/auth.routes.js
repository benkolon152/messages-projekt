import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username }});
  if (!user) return res.sendStatus(401);

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.sendStatus(401);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token });
});

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error("Register error:", err.message);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Registration failed" });
  }
});

export default router;