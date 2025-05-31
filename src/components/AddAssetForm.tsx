import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { Asset } from "@/model/Asset";

interface AddAssetFormProps {
  availableAssets: Asset[];
  onAdd: (assetId: string, shares: number, buyPriceCents: number) => Promise<void>;
}

export function AddAssetForm({ availableAssets, onAdd }: AddAssetFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [shares, setShares] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!selectedAssetId || !shares || !buyPrice) {
      toast({
        title: "Missing Information",
        description: "Please select an asset and enter both shares and price.",
        variant: "destructive",
      });
      return;
    }

    const sharesNum = parseInt(shares, 10);
    const priceNum = parseFloat(buyPrice);
    if (isNaN(sharesNum) || sharesNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a positive number of shares and a valid price.",
        variant: "destructive",
      });
      return;
    }

    const buyPriceCents = Math.round(priceNum * 100);
    try {
      await onAdd(selectedAssetId, sharesNum, buyPriceCents);
      toast({
        title: "Asset Added",
        description: `Added ${sharesNum} shares of ${
            availableAssets.find((a) => a.assetId === selectedAssetId)?.ticker || ""
        } at $${priceNum.toFixed(2)}.`,
      });
      setSelectedAssetId("");
      setShares("");
      setBuyPrice("");
    } catch (err: unknown) {
      // Narrow `err` to an Error instance if possible, otherwise use its string form
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error Adding Asset",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Add new asset
          </label>
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {availableAssets.map((asset: Asset) => (
                  <SelectItem
                      key={asset.assetId}
                      value={asset.assetId}
                      className="text-white hover:bg-gray-600"
                  >
                    {asset.ticker} – {asset.mic}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of shares
          </label>
          <Input
              type="number"
              min={1}
              value={shares}
              onChange={(e) => setShares(e.currentTarget.value)}
              placeholder="e.g. 10"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bought price (USD)
          </label>
          <Input
              type="number"
              step="0.01"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.currentTarget.value)}
              placeholder="e.g. 123.45"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-full"
          />
        </div>

        <Button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Asset
        </Button>
      </div>
  );
}
