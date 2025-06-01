import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlertCardProps {
  stock: string;
  message: string;
  timestamp: string;
}

export function AlertCard({ stock, message, timestamp }: AlertCardProps) {
  return (
      <Card className="bg-surface-10 border-surface-30 hover:bg-surface-20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-surface-30 rounded flex items-center justify-center text-xs">
                  ⚠️
                </div>
                <Badge
                    variant="secondary"
                    className="bg-surface-30 text-secondary text-xs"
                >
                  {/* If your backend can supply MIC (e.g. "XNAS"), you could render it too */}
                  {stock}
                </Badge>
              </div>
              <p className="text-primary">{message}</p>
            </div>
            <span className="text-muted text-sm whitespace-nowrap ml-4">
            {timestamp}
          </span>
          </div>
        </CardContent>
      </Card>
  );
}
