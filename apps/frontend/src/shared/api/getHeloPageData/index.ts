import { eden } from '@/features/eden/eden';
import { handleError } from '../utils/handleError';


export const getHeloPageData = async () => {
    const data = await eden.users.index.get()
    if(data.error) {
        handleError(data.error)
    }
    return data.data
}


