import {FC, useState} from 'react';
import { Todo } from "./App.tsx";
import {fetchJson} from "./utils/fetchJson.ts";

interface Props {
	onAddTodo: (todo: Todo) => void
}

const TodoForm: FC<Props> = ({ onAddTodo }) => {
	const [task, setTask] = useState('');
	const addTodo = async () => {
		try {
			const response = await fetchJson<{todo: Todo}>('http://localhost:3000/todos', {
				method: 'POST',
				body: JSON.stringify({ task })
			});
			if (response.data.status === 'success') {
				onAddTodo(response.data.todo);
				setTask('');
			} else {
				console.error(response.data.message)
			}
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<div>
			<input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
			<button onClick={addTodo}>Add Todo</button>
		</div>
	);
};
export default TodoForm;