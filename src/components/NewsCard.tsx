// src/components/NewsCard.tsx

import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ExternalLink} from "lucide-react";

/**
 * Props:
 *  - stocks: string[]    (e.g. ["AAPL", "TSLA"])
 *  - title: string
 *  - timestamp: string   (already formatted)
 *  - url: string         (link to the original news)
 */
interface NewsCardProps {
  stocks: string[];
  title: string;
  timestamp: string;
  url: string;
}

export function NewsCard({ stocks, title, timestamp, url }: NewsCardProps) {
  return (
      <Card className="bg-surface-10 border-surface-30 hover:bg-surface-20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-surface-30 rounded flex items-center justify-center text-xs">
                  📰
                </div>
                <div className="flex gap-1">
                  {stocks.map((stock) => (
                      <Badge
                          key={stock}
                          variant="secondary"
                          className="bg-surface-30 text-secondary text-xs"
                      >
                        {stock}
                      </Badge>
                  ))}
                </div>
              </div>
              <h3 className="text-primary font-medium mb-2 leading-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
            <span className="text-muted text-sm whitespace-nowrap">
              {timestamp}
            </span>
              {/* Clicking the button opens the URL in a new tab */}
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-muted hover:text-primary">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
