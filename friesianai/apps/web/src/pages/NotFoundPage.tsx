import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={<Compass />}
        title="Page not found"
        description="This page doesn't exist — it may have been moved or deleted."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to workspace
          </Button>
        }
      />
    </div>
  );
}
