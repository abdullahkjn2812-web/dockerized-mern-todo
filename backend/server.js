const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const todoRoutes = require("./routes/todoRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);
app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

connectDB();
