import {FC, useCallback, useState} from 'react'
import './App.css'
import { Unmounted, useEffectAsync } from "./utils/useEffectAsync.ts";
import { fetchJson } from "./utils/fetchJson.ts";
import TodoForm from "./TodoForm.tsx";

export interface Todo {
  _id: string;
  task: String,
  completed: Boolean,
}

const App: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  console.log(todos)

  const addTodo = useCallback((todo: Todo) => {
    setTodos(todos => [...todos, todo]);
  }, []);

  useEffectAsync(async awaiter  => {
    try {
      const response = await awaiter(fetchJson<{ todos: Todo[]}>('http://localhost:3000/todos', {
        method: "GET",
      }));

      if (response.data.status === 'success') {
        setTodos(response.data.todos)
      }
    } catch (e) {
      const error = e as Error;
      if (!(error instanceof Unmounted)) {
        console.error(`Failed to fetch reports: ${error.message}`);
      }
    }
  }, []);

  return (
    <div>
      <h1>MERN Stack Todo App</h1>
      <TodoForm onAddTodo={addTodo} />
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.task}</li>
        ))}
      </ul>
    </div>

  )
}

export default App
