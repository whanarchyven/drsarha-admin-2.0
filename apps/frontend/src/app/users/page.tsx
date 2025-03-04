export const revalidate = 0
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers } from "@/shared/api/users/getAllUsers"
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import UsersTable from "@/widgets/users-table";

export default async function UsersPage() {
    const users=await getAllUsers()
    console.log(users)
    
  return <div className=''>
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        
        {users&&<UsersTable initialUsers={users}/>}
      </div>
    </div>
  </div>;
}
