import { treaty } from '@elysiajs/eden';
import type { App } from '../../../../backend/index';

export const eden = treaty<App>('localhost:3004');
