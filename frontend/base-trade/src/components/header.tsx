import logo from "@/assets/logo.svg";
import { ThemeToggle } from "./themeToggle";
import { motion } from "motion/react";

export const Header = () => {
  return (
    <motion.header
      className="sticky top-0 z-10 w-full backdrop-blur-sm py-4 border-b border-border flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.1,
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-12 h-8">
        <img
          src={logo}
          alt="Base Trade"
          width={178}
          height={36}
          className="w-auto h-auto dark:saturate-0"
        />
      </div>
      <div className="flex items-center justify-end px-4">
        <ThemeToggle />
      </div>
    </motion.header>
  );
};
