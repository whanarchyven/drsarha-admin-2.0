import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { connectDB } from './db'
import { createUserController } from './controllers/UserController'
import { createExternalApiController } from './controllers/ExternalApiController'
import { createArticlesApiController } from './controllers/ArticlesApiController'
const db = await connectDB()

const app = new Elysia({

})
    .use(cors({
        origin: ['http://localhost:3003', 'http://localhost:3004'],
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }))
    .use(createUserController(db))
    .use(createExternalApiController())
    .use(createArticlesApiController())
    .listen({
        idleTimeout: 60,
        port: 3004
    })

console.log('🦊 Сервер запущен на порту 3004')

export type App = typeof app 