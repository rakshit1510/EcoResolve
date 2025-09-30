import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 

import dotenv from "dotenv";
dotenv.config(
    { path: './.env' }
); 
const app=express()
const allowedOrigins = process.env.CORS_ORIGIN.split(',')
app.use(cors({
    origin: allowedOrigins,
    credentials:true
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export {app}