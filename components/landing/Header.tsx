"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, token } = useAuthStore();
  const isLoggedIn = !!token && !!user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const navLinks = [
    { text: "Home", href: "#home" },
    { text: "About", href: "#about" },
    { text: "For Drivers", href: "#drivers" },
    { text: "Safety", href: "#safety" },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div
          className={`flex items-center justify-between border px-3 py-2 transition-all duration-300 ease-out sm:px-6 sm:py-3 ${
            isScrolled
              ? "bg-primary border-transparent shadow-lg backdrop-blur-2xl"
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Left section */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold text-primary-foreground transition-colors"
            >
              <Logo className="w-8 h-auto" variant="light" />
              <span>UniRide</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-primary-foreground/70 hover:text-primary-foreground text-xs transition-all duration-200"
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <Link href={isLoggedIn ? "/dashboard" : "/auth/signin"}>
                {isLoggedIn ? "Dashboard" : "Admin Portal"}
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/driver-apply">Become a Driver</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-primary-foreground/70 hover:text-primary-foreground transition-all duration-200"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 top-0 z-40 md:hidden transition-all duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-65 bg-primary shadow-2xl transform transition-all duration-500 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-auto" variant="light" />
              <span className="text-sm font-bold text-primary-foreground">
                UniRide
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-primary-foreground/70" />
            </button>
          </div>

          <Separator className="bg-primary-foreground/10" />

          {/* Navigation Links */}
          <nav className="flex flex-col p-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={handleLinkClick}
                className="group relative flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-primary-foreground/10"
              >
                <span className="relative">
                  {link.text}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary-foreground transition-all duration-200 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5 border-t border-primary-foreground/10 bg-primary/95">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary-foreground/20 hover:bg-primary-foreground/10"
              asChild
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/signin"}
                onClick={handleLinkClick}
              >
                {isLoggedIn ? "Dashboard" : "Admin Portal"}
              </Link>
            </Button>
            <Button size="sm" className="w-full" asChild>
              <Link href="/driver-apply" onClick={handleLinkClick}>
                Become a Driver
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
