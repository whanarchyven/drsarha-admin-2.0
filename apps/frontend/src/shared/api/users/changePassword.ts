import { eden } from "@/features/eden/eden"
import { toast } from "sonner"

export const changePassword = async (id: string, password: string) => {
    try{
        const newPassword = await eden.users({id}).password.put({password})
        toast.success('Пароль успешно изменен')
        return newPassword
    }
    catch(error){
        console.error(error)
        toast.error('Ошибка при изменении пароля')
        return null
    }
}