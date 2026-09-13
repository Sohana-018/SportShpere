import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-muted/20 backdrop-blur-sm rounded-2xl border border-border border-dashed">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-lg max-w-sm mb-8">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
