import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  stocks: string[];
  title: string;
  timestamp: string;
  url: string;
}

export function NewsCard({ stocks, title, timestamp, url }: NewsCardProps) {
  return (
      <Card className="transition-colors bg-card hover:bg-muted border border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Stock list */}
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                  📰
                </div>
                <div className="flex gap-1">
                  {stocks.map((s) => (
                      <Badge
                          key={s}
                          variant="secondary"
                          className="text-xs bg-muted text-foreground"
                      >
                        {s}
                      </Badge>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <h3 className="mb-2 leading-tight text-primary font-medium">
                {title}
              </h3>
            </div>

            {/* Right-hand side */}
            <div className="ml-4 flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {timestamp}
            </span>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
