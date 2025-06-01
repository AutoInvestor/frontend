// src/components/AlertCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlertCardProps {
  stock: string;
  message: string;
  timestamp: string;
}

export function AlertCard({ stock, message, timestamp }: AlertCardProps) {
  return (
      <Card className="transition-colors bg-card hover:bg-muted border border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                  ⚠️
                </div>
                <Badge
                    variant="secondary"
                    className="text-xs bg-muted text-foreground"
                >
                  {stock}
                </Badge>
              </div>
              <p className="text-primary">{message}</p>
            </div>
            <span className="ml-4 whitespace-nowrap text-sm text-muted-foreground">
            {timestamp}
          </span>
          </div>
        </CardContent>
      </Card>
  );
}
