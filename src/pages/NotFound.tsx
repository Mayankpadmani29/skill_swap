import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AnimatedBackground variant="subtle">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          {/* Animated 404 text */}
          <motion.h1
            className="text-8xl font-bold bg-gradient-to-r from-primary via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            404
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-4 text-xl text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Oops! The page you were looking for doesn’t exist.
          </motion.p>

          {/* Fun hint */}
          <motion.p
            className="mt-2 text-sm text-muted-foreground/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Maybe it’s hiding... or swapped skills with another page 🤔
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default NotFound;
