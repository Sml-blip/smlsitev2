"use client";

import React, { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Loader2, Upload, ImageIcon, Trash2, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "ACCESSOIRES",
  "COMPOSANTS",
  "CONSOLES",
  "ECRANS",
  "IMAGE & SON",
  "PC PORTABLE",
  "SÉCURITÉ & PROTECTION",
  "SMARTPHONE ACCESSOIRES",
];

interface ProductActionsProps {
  product: Product;
  onDelete?: (productId: number) => void;
  onUpdate?: (product: Product) => void;
}

const ProductActions = ({ product, onDelete, onUpdate }: ProductActionsProps) => {
  const productSlug = product.slug || product.id;
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [editData, setEditData] = useState({
    name: product.name,
    price: product.price,
    description: product.description || "",
    stock_items: product.stock_items || 0,
    category: product.category || "",
  });
  const [currentImage, setCurrentImage] = useState(product.images?.[0] || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteClick = () => {
    setPopoverOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }
      
      setShowDeleteConfirm(false);
      if (onDelete) {
        onDelete(product.id);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editData.name,
          price: editData.price,
          description: editData.description,
          stock_items: editData.stock_items,
          category: editData.category,
          images: currentImage ? [currentImage] : product.images,
        })
        .eq("id", product.id);
      
      if (error) throw error;
      
      if (onUpdate) {
        onUpdate({
          ...product,
          name: editData.name,
          price: editData.price,
          description: editData.description,
          stock_items: editData.stock_items,
          category: editData.category,
          images: currentImage ? [currentImage] : product.images,
        });
      }
      setShowQuickEdit(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", String(product.id));

      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setCurrentImage(result.imageUrl);
      alert("Image mise à jour avec succès!");
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Erreur lors du téléchargement de l'image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!currentImage) {
      alert("Pas d'image à traiter");
      return;
    }

    setRemovingBg(true);
    try {
      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: currentImage,
          productId: product.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setCurrentImage(result.newImageUrl);
      alert("Arrière-plan supprimé avec succès!");
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Erreur lors de la suppression de l'arrière-plan");
    } finally {
      setRemovingBg(false);
    }
  };

  return (
    <div>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger className="">
          <div className="flex items-center justify-center hover:bg-slate-200 p-2 rounded-full dark:hover:bg-slate-900 duration-200">
            <MoreHorizontal />
          </div>
        </PopoverTrigger>
        <PopoverContent className="text-start w-48">
          <button
            onClick={() => {
              setPopoverOpen(false);
              setShowQuickEdit(true);
            }}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900 text-left flex items-center gap-2"
          >
            <Edit2 size={16} />
            Modifier rapidement
          </button>
          <Link
            href={`/dashboard/products/${productSlug}`}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900"
          >
            Voir le produit
          </Link>
          <Link
            href={`/dashboard/products/${productSlug}/edit`}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900"
          >
            Modifier (complet)
          </Link>
          <button 
            onClick={handleDeleteClick}
            disabled={deleting}
            className="w-full text-start hover:bg-red-100 dark:hover:bg-red-900/30 py-2 px-4 rounded-md text-red-600 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce produit ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{product.name}&quot; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Edit Dialog */}
      <Dialog open={showQuickEdit} onOpenChange={setShowQuickEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier rapidement: {product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40 bg-muted rounded-lg overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-muted-foreground" size={48} />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Changer l&apos;image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveBackground}
                  disabled={removingBg || !currentImage}
                >
                  {removingBg ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  Supprimer fond
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom</label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Catégorie</label>
                  <Select
                    value={editData.category}
                    onValueChange={(value) => setEditData({ ...editData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Prix (TND)</label>
                  <Input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock</label>
                  <Input
                    type="number"
                    value={editData.stock_items}
                    onChange={(e) => setEditData({ ...editData, stock_items: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowQuickEdit(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductActions;
