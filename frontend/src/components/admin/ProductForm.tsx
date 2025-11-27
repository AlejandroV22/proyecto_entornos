import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Product } from "../shop/ProductCard";
import React from "react";

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

interface ProductFormData {
  name: string;
  price: string;
  type: string;        // ← ahora es el tipo real del backend
  condition: string;
  description: string;
  stock: string;
  imageUrl: string;
  imageFile: File | null;
}

export function ProductForm({ product, isOpen, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    price: product?.price ? product.price.toString() : "",
    type: product?.category || "",   // antes category → ahora type
    condition: product?.condition || "new",
    description: product?.description || "",
    stock: product?.stock ? product.stock.toString() : "",
    imageUrl: product?.image || "",
    imageFile: null,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: product?.name || "",
      price: product?.price ? product.price.toString() : "",
      type: product?.category || "",
      condition: product?.condition || "new",
      description: product?.description || "",
      stock: product?.stock ? product.stock.toString() : "",
      imageUrl: product?.image || "",
      imageFile: null,
    });
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: file ? URL.createObjectURL(file) : prev.imageUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.type) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("nombre", formData.name);
    dataToSend.append("precio", formData.price.toString());
    dataToSend.append("tipo", formData.type);          // ← CAMPO CORRECTO PARA DJANGO
    dataToSend.append("condicion", formData.condition);
    dataToSend.append("descripcion", formData.description);
    dataToSend.append("stock", formData.stock.toString());

    if (formData.imageFile) {
      dataToSend.append("imagen", formData.imageFile);
    }

    setIsSaving(true);
    try {
      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product information below." : "Fill the form to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">

          {/* Name */}
          <div>
            <Label>Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Tipo / Category */}
          <div>
            <Label>Category</Label>
            <Select value={formData.type} onValueChange={(value: string) => handleChange("type", value)}>
              <SelectTrigger>
              <SelectValue placeholder="Selecciona la categoría" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="consola">Consola</SelectItem>
              <SelectItem value="juego">Videojuego</SelectItem>
              <SelectItem value="accesorio">Accesorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div>
            <Label>Condition</Label>
            <Select value={formData.condition} onValueChange={(value: string) => handleChange("condition", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image */}
          <div>
            <Label>Product Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {formData.imageUrl && (
              <img src={formData.imageUrl} className="mt-2 w-full h-32 object-contain rounded" />
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              rows={3}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : product ? "Update" : "Add"} Product
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
