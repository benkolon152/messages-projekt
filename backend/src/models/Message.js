const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define("Message", {
  content: DataTypes.TEXT,
  senderId: DataTypes.INTEGER,
  receiverId: DataTypes.INTEGER,
});

module.exports = Message;