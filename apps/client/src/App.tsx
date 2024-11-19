import { FC, useCallback, useState } from 'react'
import './App.css'
import { Unmounted, useEffectAsync } from "./utils/useEffectAsync.ts";
import { fetchJson } from "./utils/fetchJson.ts";
import TodoForm from "./TodoForm.tsx";
import { Checkbox } from '@atlaskit/checkbox';
import { Box, Grid, Inline, xcss } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import Spinner from '@atlaskit/spinner';

export interface Todo {
  _id: string;
  task: string,
  completed: boolean,
}

const App: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true)

  const addTodo = useCallback((todo: Todo) => {
    setTodos(todos => [...todos, todo]);
  }, []);

  const toggleTodo = async (id: string, value: boolean) => {
    try {
      const response = await fetchJson<{ todo: Todo }>(`http://localhost:3000/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: value })
      });
      if (response.data.status === 'success') {
        setTodos(todos => {
          const todo = todos.find(({ _id }) => _id === id)
          if (todo) {
            return todos.map(todo => {
              if (todo._id === id) {
                return {...todo, completed: value}
              }

              return {...todo}
            });
          }

          return todos
        })
      } else {
        console.error(response.data.message)
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffectAsync(async awaiter  => {
    try {
      const response = await awaiter(fetchJson<{ todos: Todo[]}>('http://localhost:3000/todos', {
        method: "GET",
      }));

      if (response.data.status === 'success') {
        setTodos(response.data.todos)
        setLoading(false)
      }
    } catch (e) {
      const error = e as Error;
      if (!(error instanceof Unmounted)) {
        setLoading(false)
        console.error(`Failed to fetch reports: ${error.message}`);
      }
    }
  }, []);

  return (
    <Grid gap="space.200">
      { loading
        ? <Inline alignInline="center" >
          <Spinner size="medium" label="Loading" />
        </Inline>
        : <>
            <Heading size="xlarge">MERN Stack Todo App</Heading>
            <TodoForm onAddTodo={addTodo} />
            <Grid gap="space.100" alignItems="center">
              {todos.map(todo => (
                <Box key={todo._id}>
                  <Checkbox
                    label={ <Box xcss={xcss({textDecoration: todo.completed ? "line-through" : "none"})}>{ todo.task }</Box> }
                    value={ todo._id }
                    isChecked={todo.completed}
                    onChange={(e) => toggleTodo(todo._id, e.currentTarget.checked)}
                  />
                </Box>
              ))}
            </Grid>
          </>
      }
    </Grid>

  )
}

export default App
