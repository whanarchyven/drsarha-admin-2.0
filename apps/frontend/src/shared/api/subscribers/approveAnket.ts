import { eden } from "@/features/eden/eden"

export const approveAnket = async (id: string) => {
    await eden["main-backend"].approve({id}).post()
}