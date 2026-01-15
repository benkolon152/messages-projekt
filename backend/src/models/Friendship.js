import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Friendship = sequelize.define("Friendship", {
  status: {
    type: DataTypes.ENUM("pending", "accepted", "blocked"),
    defaultValue: "pending"
  }
});

Friendship.belongsTo(User, { foreignKey: "userId", as: "user" });
Friendship.belongsTo(User, { foreignKey: "friendId", as: "friend" });

export default Friendship;
