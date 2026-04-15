'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";
import { useForm, } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaGoogle } from "react-icons/fa6";
import { Button } from "../ui/button";

// Define Zod schema for form validation
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormData) => {
    console.log(data); // Handle form submission
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-yellow-50/30 to-white p-2">
      <div className="bg-white border border-yellow-100 shadow-sm p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">
          Créer un compte
        </h2>
        <div>
          <Button className="w-full p-6 flex items-center justify-center gap-2 text-lg rounded-lg focus:outline-none mt-6 bg-black text-white hover:bg-black/80">
            <FaGoogle size={25} /> S&apos;inscrire avec Google
          </Button>
          <p className="text-lg font-bold my-2 text-center">OU</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label
              htmlFor="name"
              className="block text-sm font-medium"
            >
              Nom complet
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="Votre nom complet"
              className={`w-full border ${
                errors.name ? "border-primary" : "border-border"
              } rounded-lg px-4 py-2 focus:outline-none`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-primary text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Adresse e-mail
            </Label>
            <Input
              type="email"
              placeholder="vous@exemple.com"
              id="email"
              className={`w-full border ${
                errors.email ? "border-primary" : "border-border"
              } rounded-lg px-4 py-2 focus:outline-none`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-primary text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              Mot de passe
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="******"
              className={`w-full border ${
                errors.password ? "border-primary" : "border-border"
              } rounded-lg px-4 py-2 focus:outline-none`}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-primary text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirmer le mot de passe
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="******"
              className={`w-full border ${
                errors.confirmPassword ? "border-primary" : "border-border"
              } rounded-lg px-4 py-2 focus:outline-none`}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-primary text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-black py-3 px-6 rounded-lg hover:bg-primary/80 focus:outline-none"
          >
            S&apos;inscrire
          </Button>
        </form>
        <p className="text-center mt-4">
          Déjà un compte ?{" "}
          <Link className="underline text-primary" href="/sign-in">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
