import { eden } from "@/features/eden/eden"

export const deleteSubscriber = async (id: string) => {
    const deletedSubscriber = await eden["main-backend"]["delete-user"]({id}).delete()
    console.log(deletedSubscriber)
    return deletedSubscriber
}