import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, ButtonProps } from "@/components/ui/button"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName: string
  itemIdentifier: string,
  type?:ButtonProps["variant"]
  title?:string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemIdentifier,
  type,
  title
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите {title?.toLowerCase()} {itemName} {itemIdentifier}? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant={type || "default"} onClick={onConfirm}>
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 