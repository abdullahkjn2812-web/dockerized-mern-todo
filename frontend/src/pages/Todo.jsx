import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Todo() {
  const [todos, SetTodos] = useState([]);
  const [editIndex, SetEditIndex] = useState(null);
  const [input, SetInput] = useState("");
  const [search, SetSearch] = useState("");

  const navigate = useNavigate();

  const handleLougout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      SetTodos((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.log("Error deleting todo:", err);
    }
  };

  const handleAddOrUpdate = async () => {
    //  function called
    console.log("function called");

    const normalizedInput = input.trim().toLocaleLowerCase();
    const isDuplicate = todos.some((item) =>
      editIndex
        ? item._id !== editIndex && item.text.toLowerCase() === normalizedInput
        : item.text.toLowerCase() === normalizedInput,
    );
    if (isDuplicate) {
      alert("Todo already exists!");
      return;
    }
    if (input.trim() === "") return;

    if (editIndex !== null) {
      // Edit mode
      console.log("Edit Mode");

      const response = await fetch(`${API_URL}/todos/${editIndex}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          text: input.trim(),
          completed: false,
        }),
      });
      const updatedTodo = await response.json();
      console.log("Updated Todo:", updatedTodo);
      SetTodos((prev) =>
        prev.map((item) => (item._id === editIndex ? updatedTodo : item)),
      );
      SetEditIndex(null);
      SetInput("");
    } else {
      //add mode

      console.log("Add Mode");
      const response = await fetch(
        `${API_URL}/todos`,
        // response check
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            text: input.trim(),
          }),
        },
      );
      console.log("response", response);
      const newTodo = await response.json();
      SetTodos((prev) => [newTodo, ...prev]);
    }
    SetInput("");
  };

  const handleEdit = (id) => {
    const todo = todos.find((item) => item._id === id);
    SetInput(todo.text);
    SetEditIndex(id);
  };

  useEffect(() => {
    fetch(`${API_URL}/todos`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => SetTodos(data))
      .catch((err) => console.error("Error Fetching Todos:", err));
  }, []);

  const ToggleComplete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const updatedTodo = await response.json();

      SetTodos((prev) =>
        prev.map((item) => (item._id === updatedTodo._id ? updatedTodo : item)),
      );
    } catch (err) {
      console.log(err);
    }
  };
  const handleClearAll = async () => {
    const confirmation = window.confirm("Are you sure ?");
    if (confirmation) {
      await fetch(`${API_URL}/todos/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      SetTodos([]);
    }
  };

  return (
    <div className="todo-container-main">
      <h1> Todo List </h1>
      <div className="logout-wrapper">
        <button onClick={handleLougout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="input-container">
        <input
          className="task-input"
          placeholder="Enter a new task..."
          value={input}
          name="..."
          onChange={(e) => SetInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddOrUpdate();
            }
          }}
        />
        <input
          className="search-input"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => SetSearch(e.target.value)}
        />
        <div className="button-group">
          <button onClick={handleClearAll} className="clear-button">
            Clear All
          </button>
          <button onClick={handleAddOrUpdate} className="add-button">
            Add
          </button>
        </div>
      </div>
      <div>
        <ul className="todo-list">
          {todos
            .filter((item) =>
              item.text.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <li key={item._id} className="todo-container">
                <div className="todo-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => ToggleComplete(item._id)}
                  />

                  <span
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                    }}
                  >
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="remove-button"
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    handleEdit(item._id);
                  }}
                  className="edit-button"
                >
                  Edit
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Todo;
