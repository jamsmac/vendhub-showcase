import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StockTransferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      toast.success("Transfer request submitted successfully", {
        description: "Warehouse manager will review your request shortly."
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Request Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0f172a]/95 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Request Stock Transfer</DialogTitle>
          <DialogDescription className="text-gray-400">
            Request items from the central warehouse to your vehicle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item" className="text-gray-300">Item</Label>
            <Select required>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                <SelectItem value="cola">Cola Zero 330ml</SelectItem>
                <SelectItem value="protein">Protein Bar Choco</SelectItem>
                <SelectItem value="water">Water Still 500ml</SelectItem>
                <SelectItem value="chips">Potato Chips Salt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter amount"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              required
              min="1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-gray-300">Priority</Label>
            <Select defaultValue="normal">
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                <SelectItem value="low">Low (Next Restock)</SelectItem>
                <SelectItem value="normal">Normal (24h)</SelectItem>
                <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
