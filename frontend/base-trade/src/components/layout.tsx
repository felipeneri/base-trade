import type { PropsWithChildren } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { LineAnimation } from "./lineAnimation";

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from background to-muted">
      <LineAnimation />
      <Header />
      <main
        className="relative flex-1 container mx-auto px-4 py-8 overflow-hidden"
        style={{
          backgroundImage: "url('src/assets/geometry.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "30% auto",
          backgroundPosition: "right bottom",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};
