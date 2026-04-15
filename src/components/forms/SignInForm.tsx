'use client';
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa6";

// Define Zod schema for form validation
const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = (data: SignInFormData) => {
    console.log(data); // Handle form submission
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="bg-white border border-yellow-100 shadow-sm p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">
          Connexion
        </h2>
        <div>
          <Button className="w-full p-6 flex items-center justify-center gap-2 text-lg mt-6 bg-black text-white hover:bg-black/80">
            <FaGoogle size={25} /> Connexion avec Google
          </Button>
          <p className="text-lg font-bold my-2 text-center">OU</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Adresse e-mail
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="you@example.com"
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
              placeholder="********"
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
          <Button
            type="submit"
            className="w-full bg-primary text-black py-3 px-6 rounded-lg hover:bg-primary/80 focus:outline-none"
          >
            Se connecter
          </Button>
        </form>
        <p className="text-center m-1">
          Pas encore de compte ?{" "}
          <Link className="underline text-primary" href={"/sign-up"}>
            S&apos;inscrire
          </Link>
        </p>
        <div className="font-medium">
          Mot de passe oublié ?
          <Link className="underline p-2 text-primary" href={"/forgot-password"}>
            Cliquez ici
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
