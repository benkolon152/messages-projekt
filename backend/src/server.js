require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");

const app = express();
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/messages", require("./routes/message.routes"));

sequelize.sync().then(() => {
  app.listen(3000, () => console.log("Backend running"));
});

const cors = require("cors");

app.use(cors({
  origin: "https://your-frontend.vercel.app"
}));