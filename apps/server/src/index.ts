import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { Todo } from "./models";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect('mongodb://localhost/mern-stack-db');

app.get('/', (req:Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json({ todos });
});

app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo(req.body);
        await newTodo.save();
        res.json({ todo: newTodo });
    } catch (e) {
        const error = e as Error
        console.error(error);
        res.status(400).send({ status: 'error', message: error.message });
    }

});

app.put('/todos/:id', async (req, res) => {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTodo);
});

app.delete('/todos/:id', async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});