"use client"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import {  useState, useEffect } from "react"
import { toast } from "sonner"

interface SubscriptionPasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onPasswordChange: (password:string) => Promise<void>
}

export function SubscriptionPasswordChangeModal({ isOpen, onClose, onPasswordChange }: SubscriptionPasswordChangeModalProps) {

  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState("")
  
  // Сбрасываем поля при закрытии модального окна
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Сброс пароля</DialogTitle>
        </DialogHeader>

          <div className="space-y">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>


          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={async()=>{
              if(confirmPassword==password){
                if(password.length>=6){
                  await onPasswordChange(password);
                  setPassword('');
                  setConfirmPassword("")
                  onClose()
                }
                else{
                  toast.error("Минимальняа длина пароля - 6 символов")
                }
              }
              else{
                toast.error("Пароли не совпадают!")
              }
              }}>Сохранить</Button>
          </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

