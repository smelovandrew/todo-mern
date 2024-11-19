import {FC, useState} from 'react';
import { Todo } from "./App.tsx";
import { fetchJson } from "./utils/fetchJson.ts";
import Button from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import { xcss, Box } from '@atlaskit/primitives';


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
		<Box xcss={xcss({display: "inline-flex", gap: "space.150"})}>
			<Textfield
				name='add-task'
				placeholder="Add task"
				value={task}
				onChange={(e) => setTask(e.currentTarget.value)}
			/>
			<Button
				appearance="primary"
				isDisabled={!task}
				onClick={addTodo}>Add Todo</Button>
		</Box>
	);
};
export default TodoForm;