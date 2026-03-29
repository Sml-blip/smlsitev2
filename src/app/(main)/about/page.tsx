import { AboutPage } from "@/features/about";
import NewsLetterTwo from "@/components/newsLetter/NewsLetterTwo";

export default function AboutPageRoute() {
  return (
    <div>
      <AboutPage variant="alternate" />
      <NewsLetterTwo />
    </div>
  );
}
