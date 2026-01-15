import "dotenv/config";
import express from "express";
import sequelize from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendshipRoutes from "./routes/friendship.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"]
}));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, "0.0.0.0", () => console.log("Backend running on http://0.0.0.0:3000"));
}).catch(err => {
  console.error("Database sync error:", err);
  process.exit(1);
});


