import express from "express";
import dotenv from "dotenv"
import Connection from "./database/db.js";
import bodyParser from "body-parser";
import newRoute from "./server/newRoute.js"
import newTaskroutes from './server/newTaskRoutes.js'
import cors from 'cors';

//import path from "path";


import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
dotenv.config();
Connection();

app.use(cors({
    origin: '*',  // Or specify your domain: 'https://TaskSync.20.197.23.82.nip.io'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
  
app.options('*', cors()); // Handle preflight requests

app.use("/", newRoute)
// app.use('/task', TaskRoutes)
app.use('/task', newTaskroutes)
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.port, () => console.log(`Server started at port ${process.env.port}`));