import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmDialog({ 
  title, 
  description, 
  itemName, 
  onConfirm, 
  onCancel,
  loading = false 
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <p className="font-medium text-card-foreground bg-muted p-3 rounded-lg">
            "{itemName}"
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
