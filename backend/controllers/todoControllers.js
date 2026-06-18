const Todo = require("../models/todo");

const getTodos = async (req, res) => {
  const todos = await Todo.find({
    user: req.user.userId,
  });
  res.json(todos);
};

const createTodo = async (req, res) => {
  try {
    const existing = await Todo.findOne({
      text: { $regex: new RegExp(`^${req.body.text.trim()}$`, "i") },
      user: req.user.userId,
    });

    if (existing) {
      return res.status(400).json({ error: "Todo already exists!" });
    }
    const newTodo = new Todo({
      text: req.body.text.trim(),
      user: req.user.userId,
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);
    if (todo) {
      if (todo.user.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      todo.text = req.body.text.trim();
      todo.completed = false;
      await todo.save();
      res.json(todo);
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleComplete = async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);
    if (todo) {
      if (todo.user.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      todo.completed = !todo.completed;
      await todo.save();
      res.json(todo);
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);
    if (todo) {
      if (todo.user.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const deletedTodo = await Todo.findByIdAndDelete(id);
      res.json(deletedTodo);
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clearTodos = async (req, res) => {
  try {
    await Todo.deleteMany({ user: req.user.userId });
    res.json({ message: "All todos cleared!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
  clearTodos,
};
