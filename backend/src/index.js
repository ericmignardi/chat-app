import express from 'express'
import cookieParser from 'cookie-parser'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB()
})
