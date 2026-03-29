"use client";

import React, { useEffect, useState, use } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import Loader from "@/components/others/Loader";
import { Product } from "@/types";

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

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

const EditProductPage = ({ params }: EditProductPageProps) => {
  const { slug } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProduct(data);
          reset({
            name: data.name || '',
            price: String(data.price) || '',
            category: data.category || '',
            brand: data.brand || '',
            type: data.featured ? 'featured' : 'new-arrivals',
            description: data.description || '',
            aboutItem: data.aboutItem || '',
            imageUrl: data.images?.[0] || '',
            color: data.colors?.join(', ') || '',
            discount: String(data.discount || 0),
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setMessage({ type: 'error', text: 'Failed to load product' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [slug, reset]);

  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          price: data.price,
          category: data.category,
          brand: data.brand,
          description: data.description,
          aboutItem: data.aboutItem,
          discount: data.discount ? parseInt(data.discount) : 0,
          images: data.imageUrl ? [data.imageUrl] : product.images,
          colors: data.color ? data.color.split(',').map(c => c.trim()) : [],
          featured: data.type === 'featured',
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        setTimeout(() => router.push('/dashboard/products'), 1500);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Error updating product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating product' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="p-4">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="p-2 w-full">
      <BreadcrumbComponent links={['/dashboard', '/products']} pageText={`Edit ${product.name}`} />
      <div className="max-w-screen-xl mx-auto w-full bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 my-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Product
        </h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
              Product Name
            </Label>
            <Input
              id="name"
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("name")}
            />
            {errors.name && <span className="text-red-500">{errors.name.message}</span>}
          </div>

          <div>
            <Label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-white">
              Price
            </Label>
            <Input
              id="price"
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("price")}
            />
            {errors.price && <span className="text-red-500">{errors.price.message}</span>}
          </div>

          <div>
            <Label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-white">
              Discount (%)
            </Label>
            <Input
              id="discount"
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("discount")}
            />
            {errors.discount && <span className="text-red-500">{errors.discount.message}</span>}
          </div>

          <div>
            <Label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-white">
              Category
            </Label>
            <Input
              id="category"
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("category")}
            />
            {errors.category && <span className="text-red-500">{errors.category.message}</span>}
          </div>

          <div>
            <Label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-white">
              Brand
            </Label>
            <Input
              id="brand"
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("brand")}
            />
            {errors.brand && <span className="text-red-500">{errors.brand.message}</span>}
          </div>

          <div>
            <Label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-white">
              Product Type
            </Label>
            <select
              id="type"
              className="mt-1 p-2 block w-full dark:bg-black rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("type")}
            >
              <option value="featured">Featured</option>
              <option value="top-rated">Top Rated</option>
              <option value="most-popular">Most Popular</option>
              <option value="new-arrivals">New Arrivals</option>
            </select>
            {errors.type && <span className="text-red-500">{errors.type.message}</span>}
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white">
              Description
            </Label>
            <textarea
              id="description"
              className="mt-1 p-2 block border bg-white dark:bg-black rounded-md w-full border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("description")}
            />
            {errors.description && <span className="text-red-500">{errors.description.message}</span>}
          </div>

          <div>
            <Label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-white">
              Available Colors (comma separated)
            </Label>
            <Input
              id="color"
              className="mt-1 p-2 block border dark:bg-black w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              placeholder="red, blue, green"
              {...register("color")}
            />
            {errors.color && <span className="text-red-500">{errors.color.message}</span>}
          </div>

          <div>
            <Label htmlFor="aboutItem" className="block text-sm font-medium text-gray-700 dark:text-white">
              About Item
            </Label>
            <textarea
              id="aboutItem"
              className="mt-1 border p-2 block w-full rounded-md dark:bg-black border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("aboutItem")}
            />
            {errors.aboutItem && <span className="text-red-500">{errors.aboutItem.message}</span>}
          </div>

          <div>
            <Label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-white">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="text"
              placeholder="https://example.com/image.jpg"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              {...register("imageUrl")}
            />
          </div>
          
          <div className="lg:col-span-2 flex gap-4">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? 'Saving...' : 'Update Product'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full md:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
