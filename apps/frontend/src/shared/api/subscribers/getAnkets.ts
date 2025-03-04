import { eden } from "@/features/eden/eden"

export const getAnkets = async () => {
    const response = await eden["main-backend"]["get-users-list"].get()
    return response.data
}