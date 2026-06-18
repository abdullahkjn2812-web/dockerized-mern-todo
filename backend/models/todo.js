const mongoose = require("mongoose");

const todoschema = new mongoose.Schema({
  text: String,
  completed: Boolean,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Todo", todoschema);
