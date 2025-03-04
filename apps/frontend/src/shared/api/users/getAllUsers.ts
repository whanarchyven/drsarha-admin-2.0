export const dynamic = 'force-dynamic'

import { eden } from "@/features/eden/eden"

export const getAllUsers = async () => {
    const users=await eden.users.index.get()
    return users.data
}

