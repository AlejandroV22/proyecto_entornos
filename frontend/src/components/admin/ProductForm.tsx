import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Product } from "../shop/ProductCard";
import React from 'react';

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
}

export function ProductForm({ product, isOpen, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || '',
    condition: product?.condition || 'new',
    description: product?.description || '',
    stock: product?.stock || 0,
    imageUrl: product?.image || '', // para mostrar la preview
    imageFile: null as File | null
  });

  useEffect(() => {
    setFormData({
      name: product?.name || '',
      price: product?.price || 0,
      category: product?.category || '',
      condition: product?.condition || 'new',
      description: product?.description || '',
      stock: product?.stock || 0,
      imageUrl: product?.image || '',
      imageFile: null
    });
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: file ? URL.createObjectURL(file) : prev.imageUrl
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // enviamos todo el form, incluyendo imageFile si hay
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the product information below.' : 'Fill in the details to add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Console, Games, Accessories"
              required
            />
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imageFile">Product Image</Label>
            <Input
              id="imageFile"
              type = 'file'
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="mt-2 w-12 h-24 object-cover" />
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}