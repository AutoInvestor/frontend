// src/components/AddAssetForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { Asset } from "@/model/Asset.ts";

interface AddAssetFormProps {
  availableAssets: Asset[];
  onAdd: (
      assetId: string,
      shares: number,
      buyPriceCents: number
  ) => Promise<void>;
}

export function AddAssetForm({
                               availableAssets,
                               onAdd,
                             }: AddAssetFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [shares, setShares] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const { toast } = useToast();

  async function handleAdd() {
    if (!selectedAssetId || !shares || !buyPrice) {
      toast({
        title: "Missing information",
        description: "Please select an asset and enter both shares and price.",
        variant: "destructive",
      });
      return;
    }
    const sharesNum = Number.parseInt(shares, 10);
    const priceNum = Number.parseFloat(buyPrice);
    if (!sharesNum || sharesNum <= 0 || !priceNum || priceNum <= 0) {
      toast({
        title: "Invalid input",
        description:
            "Enter a positive number of shares and a valid purchase price.",
        variant: "destructive",
      });
      return;
    }

    const buyPriceCents = Math.round(priceNum * 100);
    try {
      await onAdd(selectedAssetId, sharesNum, buyPriceCents);
      toast({
        title: "Asset added",
        description: `Added ${sharesNum} × ${availableAssets.find(
            (a) => a.assetId === selectedAssetId
        )?.ticker} @ $${priceNum.toFixed(2)}.`,
      });
      setSelectedAssetId("");
      setShares("");
      setBuyPrice("");
    } catch (err) {
      toast({
        title: "Error adding asset",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Add new asset
          </label>

          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger className="w-full bg-muted border border-border text-foreground">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent className="bg-muted border border-border">
              {availableAssets.map((a) => (
                  <SelectItem
                      key={a.assetId}
                      value={a.assetId}
                      className="hover:bg-muted/75 text-foreground"
                  >
                    {a.ticker} – {a.mic}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Number of shares
          </label>
          <Input
              type="number"
              min={1}
              value={shares}
              onChange={(e) => setShares(e.currentTarget.value)}
              placeholder="e.g. 10"
              className="w-full bg-muted border border-border text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Bought price (USD)
          </label>
          <Input
              type="number"
              step="0.01"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.currentTarget.value)}
              placeholder="e.g. 123.45"
              className="w-full bg-muted border border-border text-foreground placeholder-muted-foreground"
          />
        </div>

        <Button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add asset
        </Button>
      </div>
  );
}
