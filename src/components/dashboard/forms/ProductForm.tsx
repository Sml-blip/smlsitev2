"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  type: z.enum(["featured", "top-rated", "most-popular", "new-arrivals"]),
  description: z.string().min(1, "Description is required"),
  aboutItem: z.string().optional(),
  imageUrl: z.string().optional(),
  color: z.string().optional(),
  discount: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "featured",
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          price: data.price,
          category: data.category,
          brand: data.brand,
          description: data.description,
          aboutItem: data.aboutItem,
          discount: data.discount ? parseInt(data.discount) : 0,
          images: data.imageUrl ? [data.imageUrl] : [],
          color: data.color ? data.color.split(',').map(c => c.trim()) : [],
          featured: data.type === 'featured',
          stockItems: 10
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Produit ajouté avec succès!' });
        reset();
        setTimeout(() => router.push('/dashboard/products'), 1500);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Erreur lors de l\'ajout du produit' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout du produit' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto w-full bg-white dark:bg-black rounded-lg shadow-md p-6 my-4 border border-border">
      <h2 className="text-lg font-semibold mb-4">
        Add New Product
      </h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-primary/20 text-black dark:text-white' : 'bg-black/10 dark:bg-white/10'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium">
            Product Name
          </Label>
          <Input
            id="name"
            type="text"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-primary text-sm">{errors.name.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="price" className="block text-sm font-medium">
            Price
          </Label>
          <Input
            id="price"
            type="text"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("price")}
          />
          {errors.price && (
            <span className="text-primary text-sm">{errors.price.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="discount" className="block text-sm font-medium">
            Discount (%)
          </Label>
          <Input
            id="discount"
            type="text"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("discount")}
          />
          {errors.discount && (
            <span className="text-primary text-sm">{errors.discount.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="category" className="block text-sm font-medium">
            Category
          </Label>
          <Input
            id="category"
            type="text"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("category")}
          />
          {errors.category && (
            <span className="text-primary text-sm">{errors.category.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="brand" className="block text-sm font-medium">
            Brand
          </Label>
          <Input
            id="brand"
            type="text"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("brand")}
          />
          {errors.brand && (
            <span className="text-primary text-sm">{errors.brand.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="type" className="block text-sm font-medium">
            Product Type
          </Label>
          <select
            id="type"
            className="mt-1 p-2 block w-full bg-background rounded-md border border-border focus:ring-primary focus:border-primary"
            {...register("type")}
          >
            <option value="featured">Featured</option>
            <option value="top-rated">Top Rated</option>
            <option value="most-popular">Most Popular</option>
            <option value="new-arrivals">New Arrivals</option>
          </select>
          {errors.type && (
            <span className="text-primary text-sm">{errors.type.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="block text-sm font-medium">
            Description
          </Label>
          <textarea
            id="description"
            className="mt-1 p-2 block border bg-background rounded-md w-full border-border focus:ring-primary focus:border-primary"
            {...register("description")}
          />
          {errors.description && (
            <span className="text-primary text-sm">{errors.description.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="color" className="block text-sm font-medium">
            Available Colors (comma separated)
          </Label>
          <Input
            id="color"
            className="mt-1 p-2 block border bg-background w-full rounded-md border-border focus:ring-primary focus:border-primary"
            placeholder="red, blue, green"
            {...register("color")}
          />
          {errors.color && (
            <span className="text-primary text-sm">{errors.color.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="aboutItem" className="block text-sm font-medium">
            About Item
          </Label>
          <textarea
            id="aboutItem"
            className="mt-1 border p-2 block w-full rounded-md bg-background border-border focus:ring-primary focus:border-primary"
            {...register("aboutItem")}
          />
          {errors.aboutItem && (
            <span className="text-primary text-sm">{errors.aboutItem.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="imageUrl" className="block text-sm font-medium">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
            className="mt-1 p-2 block w-full rounded-md border-border focus:ring-primary focus:border-primary"
            {...register("imageUrl")}
          />
        </div>
        
        <div className="lg:col-span-2">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary text-black hover:bg-primary/80">
            {isLoading ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};


export default ProductForm;