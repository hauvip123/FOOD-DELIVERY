import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedRestaurants } from "@/components/home/FeaturedRestaurants";
import { PopularDishes } from "@/components/home/PopularDishes";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <FeaturedRestaurants />
      <PopularDishes />
    </main>
  );
}
