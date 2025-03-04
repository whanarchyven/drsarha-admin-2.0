import { eden } from "@/features/eden/eden"

interface User {
    email: string
    firstName: string
    lastName: string
}

export const editUser = async (id:string,{email, firstName, lastName}:User) => {
    try{
        const newUser = await eden.users({id}).put({email, firstName, lastName})
        return newUser.data
    }
    catch(error){
        console.error(error)
        return null
    }
}