import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Message = sequelize.define("Message", {
  content: DataTypes.TEXT,
  senderId: DataTypes.INTEGER,
  receiverId: DataTypes.INTEGER,
});

Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

export default Message;