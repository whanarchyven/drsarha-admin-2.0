import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { connectDB } from './db'
import { createUserController } from './controllers/UserController'
import { createExternalApiController } from './controllers/ExternalApiController'
import { createArticlesApiController } from './controllers/ArticlesApiController'
import { createTelegramBotController } from './controllers/TelegramBotController'
const db = await connectDB()

const app = new Elysia({

})
    .use(cors({
        origin: ['http://localhost:3002', 'http://localhost:3003','https://admin.drsarha.ru',"https://admin-backend.drsarha.ru"],
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }))
    .use(createUserController(db))
    .use(createExternalApiController())
    .use(createArticlesApiController())
    .use(createTelegramBotController())
    .listen({
        idleTimeout: 60,
        port: 3003
    })

console.log('🦊 Сервер запущен на порту 3003')

export type App = typeof app 