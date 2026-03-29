import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CheckoutBtn = () => {
  return (
    <Link
      href={"/checkout"}
      className="w-full flex items-center justify-center gap-3 my-2 text-xl bg-primary text-primary-foreground py-3 px-8 rounded-full hover:bg-yellow-500 focus:outline-none"
    >
      {" "}
      <ArrowRight /> Passer à la caisse
    </Link>
  );
};

export default CheckoutBtn;
