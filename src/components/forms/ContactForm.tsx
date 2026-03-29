'use client';
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Define Zod schema for form validation
const schema = z.object({
  name: z.string().min(3, 'Le nom est requis'),
  email: z.string().email('Email invalide').min(10, 'L\'email est requis'),
  message: z.string().min(5, 'Le message est requis'),
});

// Define types for form data
type FormData = z.infer<typeof schema>;

const ContactForm: React.FC = () => {
  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
    // Handle form submission logic here
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-black rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8 md:px-10">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Contactez-nous</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <Label htmlFor="name">Votre nom</Label>
              <Input
                type="text"
                id="name"
                autoComplete="name"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md"
                {...register('name')}
              />
              {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <div>
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                type="email"

                id="email"
                autoComplete="email"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md"
                {...register('email')}
              />
              {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="mt-1 bg-white dark:bg-black p-2 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md border"
                rows={10}
                cols={30}
                {...register('message')}
              ></textarea>
              {errors.message && <span className="text-red-500">{errors.message.message}</span>}
            </div>
            <div className="mt-4 flex items-center justify-end">
              <Button
                type="submit"
                className="w-fit flex items-center justify-center py-4 px-6 border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 text-base font-medium"
              >
                Envoyer le message
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
