import { treaty } from '@elysiajs/eden';
import type { App } from '../../../../backend/index';

// Используем переменную окружения для URL бэкенда или относительный путь
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const eden = treaty<App>(API_URL);
