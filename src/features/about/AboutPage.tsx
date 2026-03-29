import Image from "next/image";
import React from "react";

export type AboutPageVariant = "default" | "alternate";

interface AboutPageProps {
  variant?: AboutPageVariant;
}

const AboutPage = ({ variant = "default" }: AboutPageProps) => {
  if (variant === "alternate") {
    return <AboutPageAlternate />;
  }
  return <AboutPageDefault />;
};

const AboutPageDefault = () => {
  return (
    <section className="max-w-screen-xl mx-auto p-2 md:p-4">
      <h2 className="text-4xl font-bold mb-4 text-center">À propos de nous</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative w-full h-[20rem] md:h-[30rem]">
          <Image
            className="rounded-xl object-contain"
            src={"/images/people/group-image.avif"}
            alt="about image"
            fill
          />
        </div>
        <div className="text-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Bienvenue dans notre paradis de l&apos;électronique ! Nous sommes passionnés par
            la fourniture des derniers et meilleurs gadgets aux passionnés de technologie
            du monde entier. Notre mission est d&apos;offrir des produits de haute qualité à
            des prix abordables, accompagnés d&apos;un service client exceptionnel.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Avec des années d&apos;expérience dans l&apos;industrie, nous avons sélectionné une collection
            de produits qui répond aux exigences des modes de vie modernes. Que
            vous recherchiez des smartphones de pointe, des ordinateurs portables puissants ou
            des appareils domestiques intelligents innovants, nous avons ce qu&apos;il vous faut.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Nous croyons en l&apos;innovation, la fiabilité et la satisfaction du client.
            Nous mettons constamment à jour notre inventaire pour rester à la pointe
            et vous apporter les dernières tendances technologiques. Notre équipe dévouée
            travaille sans relâche pour garantir que votre expérience d&apos;achat soit fluide
            du début à la fin.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Merci de nous avoir choisis comme votre destination privilégiée pour tout ce qui concerne
            l&apos;électronique. Rejoignez-nous dans cette aventure passionnante alors que nous continuons à
            redéfinir la façon dont vous achetez la technologie.
          </p>
        </div>
      </div>
    </section>
  );
};

const AboutPageAlternate = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Story
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget
            ipsum id neque laoreet tincidunt. Suspendisse potenti. Curabitur
            fringilla nunc ac diam consequat, et mattis magna pulvinar.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Fusce at maximus mi. Aliquam bibendum magna sit amet nisi efficitur,
            ut viverra nisi lacinia. Mauris sed mi a turpis blandit facilisis.
            Nunc id ex a nibh cursus convallis.
          </p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-[16rem]">
                <Image
                  src="/images/people/group-image.avif"
                  alt="Team Member 1"
                  className="w-full h-64 object-cover"
                  fill
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  John Doe
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Co-Founder & CEO
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-[16rem]">
                <Image
                  src="/images/people/group-image.avif"
                  alt="Team Member 2"
                  className="w-full h-64 object-cover"
                  fill
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Jane Smith
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Co-Founder & CTO
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget
              ipsum id neque laoreet tincidunt. Suspendisse potenti. Curabitur
              fringilla nunc ac diam consequat, et mattis magna pulvinar.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>Lorem ipsum dolor sit amet</li>
              <li>Consectetur adipiscing elit</li>
              <li>Nullam eget ipsum id neque</li>
              <li>Suspendisse potenti</li>
              <li>Curabitur fringilla nunc ac diam</li>
            </ul>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget
              ipsum id neque laoreet tincidunt. Suspendisse potenti. Curabitur
              fringilla nunc ac diam consequat, et mattis magna pulvinar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
