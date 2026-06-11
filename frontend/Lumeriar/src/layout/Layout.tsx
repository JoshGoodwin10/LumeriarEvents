import Header from "./header/Header.tsx";
import Footer from "./footer/Footer.tsx";
import type { ReactNode } from "react";
import { useEffect } from "react";
import "./public.css";
import "aos/dist/aos.css";
import AOS from "aos";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  useEffect(() => {
    AOS.init({
      duration: 800,      // animation duration in ms
      once: true,         // whether animation should happen only once
      offset: 50,         // offset (in px) from the original trigger point
      easing: "ease-in-out",
    });
  }, []);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;