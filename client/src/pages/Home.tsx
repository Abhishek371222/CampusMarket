import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import CategoryHighlights from "@/components/home/CategoryHighlights";
import RecentListings from "@/components/home/RecentListings";
import AppPromotion from "@/components/home/AppPromotion";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>CampusMarket - Buy and Sell on Campus</title>
        <meta name="description" content="Your trusted marketplace for college essentials. Buy, sell, and connect with other students." />
      </Helmet>
      
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        <HeroSection />
        <FeaturedListings />
        <CategoryHighlights />
        <RecentListings />
        <AppPromotion />
      </motion.div>
    </>
  );
};

export default Home;
