import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SubscriptionRenewalModalProps {
  isOpen: boolean
  onClose: () => void
  onRenew: (plan: "month" | "year") => void
}

export function SubscriptionRenewalModal({ isOpen, onClose, onRenew }: SubscriptionRenewalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Период продления</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <Button
            onClick={() => {
              onRenew("month")
              onClose()
            }}
            className="h-20 text-lg"
          >
            Месяц
          </Button>
          <Button
            onClick={() => {
              onRenew("year")
              onClose()
            }}
            className="h-20 text-lg"
          >
            Год
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

