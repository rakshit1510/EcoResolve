import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 

import resourcesRoutes from './routes/resource.route.js'
import workerRoutes from './routes/worker.route.js'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json());

// Routes
app.use('/api/resources', resourcesRoutes)
app.use("/api/workers", workerRoutes);



export {app}