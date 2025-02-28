import { Elysia, t } from 'elysia';
import type { Db } from 'mongodb';
import { UserService } from '../services/UserService';

export function createUserController(db: Db) {
    const userService = new UserService(db);

    return new Elysia({ prefix: '/users' })
        .post('/login', async ({ body }) => {
            const result = await userService.login(body);
            if (!result) {
                throw new Error('Invalid credentials');
            }
            return result;
        }, {
            body: t.Object({
                email: t.String(),
                password: t.String()
            })
        })
        
        .get('/', async () => {
            return await userService.findAll();
        })
        
        .get('/:id', async ({ params: { id } }) => {
            const user = await userService.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }, {
            params: t.Object({
                id: t.String()
            })
        })
        
        .post('/', async ({ body }) => {
            return await userService.create(body);
        }, {
            body: t.Object({
                email: t.String(),
                password: t.String(),
                firstName: t.String(),
                lastName: t.String(),
                role: t.Optional(t.String())
            })
        })
        
        .put('/:id', async ({ params: { id }, body }) => {
            const user = await userService.update(id, body);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }, {
            params: t.Object({
                id: t.String()
            }),
            body: t.Object({
                email: t.Optional(t.String()),
                firstName: t.Optional(t.String()),
                lastName: t.Optional(t.String()),
                role: t.Optional(t.String())
            })
        })
        
        .delete('/:id', async ({ params: { id } }) => {
            const success = await userService.delete(id);
            if (!success) {
                throw new Error('User not found');
            }
            return { success: true };
        }, {
            params: t.Object({
                id: t.String()
            })
        });
} 