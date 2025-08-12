import { useEffect } from "react";
import { HomePage } from "@/components/HomePage";

const Home = () => {
  useEffect(() => {
    document.title = "Home - MMMES College Library";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Discover books, manage loans, and explore services at MMMES College Library.");
    }
  }, []);
  return <HomePage />;
};

export default Home;