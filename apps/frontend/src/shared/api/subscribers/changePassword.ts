import { eden } from "@/features/eden/eden"

export const changePassword=async(id:string,password:string)=>{
    console.log(id,password)
    const result= await eden["main-backend"]["reset-pass"]({id}).put(password)
    console.log(result)
    return result
}