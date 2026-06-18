const authMiddleware = require("../midleware/authmiddleware");
const express = require("express");
const router = express.Router();

const {
  getTodos,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
  clearTodos,
} = require("../controllers/todoControllers");

router.get("/", authMiddleware, getTodos);
router.post("/", authMiddleware, createTodo);
router.put("/:id", authMiddleware, updateTodo);
router.patch("/:id", authMiddleware, toggleComplete);
router.delete("/:id", authMiddleware, deleteTodo);
router.delete("/", authMiddleware, clearTodos);

module.exports = router;
