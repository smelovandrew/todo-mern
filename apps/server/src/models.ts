import mongoose from "mongoose";


const todoSchema = new mongoose.Schema({
	task: {
		type: String,
		required: true
	},
	completed: Boolean,
});

export const Todo = mongoose.model('Todo', todoSchema);