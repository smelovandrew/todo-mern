import express, { Request, Response } from "express";
import dotenv from "dotenv";
import * as mongoose from "mongoose";
import { Todo } from "./models";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost/mern-stack-db');

app.get('/', (req:Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});