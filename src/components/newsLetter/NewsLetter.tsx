import React from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { Plane } from "lucide-react";

const NewsLetter = () => {
  return (
    <section className="p-2 md:p-4 my-4 bg-muted shadow">
      <div className="max-w-screen-xl mx-auto  rounded-lg h-[20rem]   grid place-content-center">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center  gap-4">
          <Plane size={100} className="text-primary animate-bounce" />
          <div className="flex flex-col items-center gap-2 p-4">
            <h2 className="text-2xl md:text-5xl font-bold capitalize flex items-center mt-2 text-center gap-2">
              Subscribe to our newsletter
            </h2>
            <p className="text-center">
              To get latest products update and recommendation subscribe our
              newsletter.
            </p>
            <form
              action=""
              className="flex items-center justify-between border border-primary rounded-full w-full md:w-[50rem] mt-2"
            >
              <Input
                className="rounded-full w-full  md:w-[50%] bg-transparent border-none flex-1 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter Your Email"
              />
              <Button
                type="submit"
                className="bg-primary text-black text-xl p-8 rounded-full hover:bg-primary/80 duration-200 font-medium"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
