import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import axios from "axios";
import styles from "./App.module.css";

type Todo = {
  id: number;
  title: string;
  isComplete: boolean;
};

const updateTodoDebounced = debounce((id: number, update: Partial<Todo>) => {
  axios.patch(`/todos/${id}`, update);
}, 250);

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get("/todos").then((res) => setTodos(res.data));
  }, []);

  useEffect(() => {
    if (inputRef.current == null) return;

    if (typeof inputRef?.current?.focus === "function") {
      inputRef.current.focus();
    }
  }, [inputRef.current, selectedIndex]);

  const updateTodo = (id: number, index: number, update: Partial<Todo>) => {
    setTodos(
      todos.map((todo, i) => {
        if (i !== index) return todo;

        return {
          ...todo,
          ...update,
        };
      })
    );

    updateTodoDebounced(id, update);
  };

  return (
    <div className={styles.root}>
      <h2 className={styles.header}>Todo</h2>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();

          axios
            .post("/todos", { title: newTodo, isComplete: false })
            .then((res) => setTodos([...todos, res.data]));

          setNewTodo("");
        }}
      >
        <input
          className={styles.input}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button className={styles.button}>Add Todo</button>
      </form>

      <ul className={styles.todoList}>
        {todos.map((todo, index) => {
          return (
            <li className={styles.todoListItem} key={todo.id}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={todo.isComplete}
                onChange={(e) =>
                  updateTodo(todo.id, index, { isComplete: e.target.checked })
                }
              />
              {selectedIndex === index ? (
                <input
                  className={styles.input}
                  ref={inputRef}
                  onBlur={(e) => setSelectedIndex(-1)}
                  value={todo.title}
                  onChange={(e) => {
                    updateTodo(todo.id, index, { title: e.target.value });
                  }}
                />
              ) : (
                <span
                  onClick={(e) => {
                    setSelectedIndex(index);
                  }}
                >
                  {todo.title}
                </span>
              )}
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  axios.delete(`/todos/${todo.id}`).then((res) => {
                    const newTodos = todos.filter((todo, i) => index !== i);
                    setTodos(newTodos);
                  });
                }}
              >
                X
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
