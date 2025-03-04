"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Eye, EyeOff, Lock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { changePassword } from "@/shared/api/users/changePassword"
import { createUser } from "@/shared/api/users/createUser"
import { editUser } from "@/shared/api/users/editUser"
import { deleteUser } from "@/shared/api/users/deleteUser"
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleType } from "@/shared/types/roleType"
import { User } from "@/entities/User/model/types"

interface UsersTableProps {
  initialUsers: User[]
}

type DialogType = "password" | "edit" | "create" | null

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)

  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Новое состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [editForm, setEditForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [createForm, setCreateForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    password: "",
    confirmPassword: "",
  })

  const handleDelete = async (userId: string) => {
    try{
      await deleteUser(userId)
      setUsers(users.filter((user) => user._id !== userId))
      setDeleteDialogOpen(false)
      toast.success("Пользователь успешно удален")
    }
    catch(error){
      toast.error("Ошибка при удалении пользователя")
    }
  }

  
  const openDialog = (type: DialogType, user?: User) => {
    if (user) {
      setSelectedUser(user)
      if (type === "edit") {
        setEditForm({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      }
    } else {
      setSelectedUser(null)
    }
    setActiveDialog(type)
    
    // Сбрасываем форму создания пользователя при открытии
    if (type === "create") {
      setCreateForm({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "editor",
        confirmPassword: "",
      })
    }
  }
  
  // Функция для открытия диалога удаления
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают")
      return
    }
    // Here you would typically call an API to update the password
    console.log("Changing password for user:", selectedUser?._id, "New password:", newPassword)
    if(selectedUser?._id){
      console.log(selectedUser?._id, newPassword)
      await changePassword(selectedUser?._id, newPassword)
      setActiveDialog(null)
      setNewPassword("")
      setConfirmPassword("")
    }
    
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    // Here you would typically call an API to update the user

    const editedUser = await editUser(selectedUser._id, {
      email: editForm.email,
      firstName: editForm.firstName,
      lastName: editForm.lastName
    })

    setUsers(users.map((user) => (user._id === selectedUser._id ? { ...user, ...editedUser as unknown as User } : user)))
    setActiveDialog(null)
  }

  const handleCreateUser = async () => {
    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Пароли не совпадают")
      return
    }

    const newUser = await createUser({
      email: createForm.email,
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      password: createForm.password,
      role: createForm.role as RoleType
    })
    if(newUser){
      setUsers([...users, newUser as unknown as User])
      setActiveDialog(null)
      setCreateForm({
        email: "",
        firstName: "",  
        lastName: "",
        role: "editor",
        password: "",
        confirmPassword: "",
      })
      toast.success("Пользователь успешно создан")
    }
    else{
      toast.error("Ошибка при создании пользователя")
    }
    
    
  }

  return (
    <>
      <div className="w-full overflow-auto">
      <div className='flex justify-between items-center'>
            <p className='text-cBlack text-2xl font-bold'>Пользователи</p>
            <Button variant={'cPrimary'} onClick={() => openDialog("create")}>Добавить пользователя</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Фамилия</TableHead>
              <TableHead>Когда создано</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="w-[200px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{format(new Date(user.createdAt), "dd.MM.yyyy HH:mm")}</TableCell>
                  <TableCell>{RoleType[user.role as keyof typeof RoleType]}</TableCell>
                  
                  <TableCell className="flex gap-2">
                  <Button
                      className="w-full"
                      variant="default"
                      size="icon"
                      onClick={() => openDialog("edit", user)}
                      aria-label="Редактировать пользователя"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      className="w-full"
                      variant="cPrimary"
                      size="icon"
                      onClick={() => openDialog("password", user)}
                      aria-label="Сменить пароль"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      className="w-full"
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(user)}
                      aria-label="Удалить пользователя"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={activeDialog === "password"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription>Введите новый пароль для пользователя {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Отмена
            </Button>
            <Button onClick={handlePasswordChange}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={activeDialog === "edit"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Измените данные пользователя</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Отмена
            </Button>
            <Button onClick={handleEditUser}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Используем наш новый компонент DeleteConfirmationDialog */}
      <ConfirmationDialog type="destructive" title="Удалить"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedUser && handleDelete(selectedUser._id)}
        itemName="пользователя"
        itemIdentifier={selectedUser?.email || ""}
      />

      {/* Create User Dialog */}
      <Dialog open={activeDialog === "create"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать пользователя</DialogTitle>
            <DialogDescription>Введите данные нового пользователя</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-firstName">Имя</Label>
              <Input
                id="create-firstName"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-lastName">Фамилия</Label>
              <Input
                id="create-lastName"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-lastName">Роль</Label>
              <Select onValueChange={(value) => setCreateForm({ ...createForm, role: value as RoleType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="admin">Админ</SelectItem>
                  <SelectItem value="developer">Разработчик</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">Пароль</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-confirm-password">Подтвердите пароль</Label>
              <Input
                id="create-confirm-password"
                type="password"
                value={createForm.confirmPassword}
                onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Отмена
            </Button>
            <Button onClick={handleCreateUser}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

