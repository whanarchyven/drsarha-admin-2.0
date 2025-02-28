import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { connectDB } from './db'
import { createUserController } from './controllers/UserController'

const db = await connectDB()

const app = new Elysia()
    .use(cors({
        origin: ['http://localhost:3001', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }))
    .use(createUserController(db))
    .listen(3000)

console.log('🦊 Сервер запущен на порту 3000')

export type App = typeof app 