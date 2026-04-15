import ContactForm from "@/components/forms/ContactForm";
import { Locate, Mail, Phone } from "lucide-react";
import React from "react";

export type ContactPageVariant = "default" | "alternate";

interface ContactPageProps {
  variant?: ContactPageVariant;
}

const ContactPage = ({ variant = "default" }: ContactPageProps) => {
  if (variant === "alternate") {
    return <ContactPageAlternate />;
  }
  return <ContactPageDefault />;
};

const ContactPageDefault = () => {
  return (
    <section className="max-w-screen-xl mx-auto p-2 md:p-8">
      <h2 className="text-4xl my-2 font-bold text-center">Get In Touch</h2>
      <div className="flex flex-col md:flex-row  md:max-h-[50rem] gap-4 overflow-hidden  dark:bg-slate-900 rounded-md shadow">
        <div className="w-full flex-1">
          <ContactForm />
        </div>
        <div className=" bg-blue-600 w-full md:w-fit md:min-h-screen p-2 lg:p-8">
          <h3 className="text-xl font-semibold text-center mt-4">Contact Us</h3>
          <div className="flex items-center md:items-start w-full h-full justify-start mt-4 flex-col gap-6 md:text-xl">
            <div className="flex items-center gap-4">
              <Locate size={40} />
              <p className="whitespace-nowrap">gazipur, dhaka, bangladesh</p>
            </div>
            <div className="flex items-center gap-4 ">
              <Phone size={40} />
              <p>+1 000 000 000</p>
            </div>
            <div className="flex gap-4 items-center">
              <Mail size={40} />
              www.example@gmail.com{" "}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactPageAlternate = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ContactForm />
        <div className="lg:col-span-1 bg-white border border-yellow-100 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-8 md:px-10">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Informations de contact</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Adresse</h3>
                <p className="mt-1 text-sm text-gray-500">123 Rue Principale, Tunis, Tunisie</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Téléphone</h3>
                <p className="mt-1 text-sm text-gray-500">+216 12 345 678</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Email</h3>
                <p className="mt-1 text-sm text-gray-500">info@sml-informatique.tn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
