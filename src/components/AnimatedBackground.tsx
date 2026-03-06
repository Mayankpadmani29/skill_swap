import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "default" | "hero" | "subtle";
  children?: React.ReactNode; // ✅ now optional
}

export const AnimatedBackground = ({ variant = "default", children }: AnimatedBackgroundProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "hero":
        return "bg-gradient-to-br from-background via-primary/5 to-info/10";
      case "subtle":
        return "bg-gradient-to-br from-background to-muted/30";
      default:
        return "bg-gradient-to-br from-background via-muted/20 to-background";
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getVariantClasses()}`}>
      {/* Floating orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-primary/10 to-info/5 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 -right-32 w-80 h-80 bg-gradient-to-br from-warning/10 to-success/5 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      <motion.div
        className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-br from-info/10 to-primary/5 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px', '0px 0px']
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content (if provided) */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};
