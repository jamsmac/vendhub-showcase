/**
 * Supplier Form Component with Dictionary Integration
 * 
 * Manages supplier/counterparty information with dictionary-based type selection
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDictionaryOptions } from "@/hooks/useDictionaries";
import { trpc } from "@/lib/trpc";

interface SupplierFormProps {
  supplierId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupplierForm({ supplierId, onSuccess, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    taxId: "",
    bankAccount: "",
    notes: "",
  });

  const [showDetails, setShowDetails] = useState(false);

  // Get dictionary options for supplier types
  const supplierTypeOptions = useDictionaryOptions('counterparty_types');

  // Mock mutations - replace with actual tRPC calls
  const createMutation = { mutateAsync: async (data: any) => {}, isPending: false };
  const updateMutation = { mutateAsync: async (data: any) => {}, isPending: false };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast.error("Supplier name is required");
      return;
    }
    if (!formData.type) {
      toast.error("Supplier type is required");
      return;
    }
    if (!formData.phone && !formData.email) {
      toast.error("At least phone or email is required");
      return;
    }

    try {
      if (supplierId) {
        // await updateMutation.mutateAsync({
        //   id: supplierId,
        //   ...formData,
        // });
        toast.success("Supplier updated successfully");
      } else {
        // await createMutation.mutateAsync(formData);
        toast.success("Supplier created successfully");
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {supplierId ? "Edit Supplier" : "Create New Supplier"}
          </h2>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-gray-600">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., ABC Beverages Ltd."
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Supplier Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier type" />
                </SelectTrigger>
                <SelectContent>
                  {supplierTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., john@abc-beverages.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +998 71 123 45 67"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {showDetails ? "Hide" : "Show"} Additional Details
          </button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Tashkent"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., Uzbekistan"
                  />
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID / INN</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789"
                  />
                </div>

                <div>
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input
                    id="bankAccount"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    placeholder="e.g., 1234567890"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this supplier..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : supplierId
              ? "Update Supplier"
              : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}

export default SupplierForm;
