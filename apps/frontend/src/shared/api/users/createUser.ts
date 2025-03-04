import { eden } from "@/features/eden/eden"
import { RoleType } from "@/shared/types/roleType"
interface User {
    email: string
    firstName: string
    lastName: string
    password: string
    role: RoleType
}

export const createUser = async ({email, firstName, lastName, role, password}:User) => {
    console.log("createUser", email, firstName, lastName, role, password)
    try{
        const newUser = await eden.users.index.post({email, firstName, lastName, role, password})
        return newUser.data
    }
    catch(error){
        console.error(error)
        return null
    }
}