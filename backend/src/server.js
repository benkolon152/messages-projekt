import "dotenv/config";
import express from "express";
import sequelize from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendshipRoutes from "./routes/friendship.routes.js";

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"]
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);
app.use("/friendships", friendshipRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

sequelize.sync().then(() => {
  app.listen(3000, "0.0.0.0", () => console.log("Backend running on http://0.0.0.0:3000"));
}).catch(err => {
  console.error("Database sync error:", err);
  process.exit(1);
});


