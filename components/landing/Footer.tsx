"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Logo className="w-10 h-auto" variant="light" />
              <h3 className="text-lg font-bold">UniRide</h3>
            </Link>
            <p className="text-primary-foreground/70 mb-4 text-xs sm:text-sm">
              Your trusted campus transportation partner. Safe, reliable, and
              affordable rides for university students across Nigeria.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 focus-visible:border-primary-foreground/40 placeholder:text-primary-foreground/50 backdrop-blur-sm h-10"
              />
              <Button variant="secondary" size="sm" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-1.5 text-primary-foreground/70 text-xs sm:text-sm">
              <li>
                <a
                  href="#about"
                  className="hover:text-primary-foreground transition"
                >
                  About UniRide
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-primary-foreground transition"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  className="hover:text-primary-foreground transition"
                >
                  Safety
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-primary-foreground transition"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-foreground transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-primary-foreground transition"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">For Students</h4>
            <ul className="space-y-1.5 text-primary-foreground/70 text-xs sm:text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition"
                >
                  Download App
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition"
                >
                  Book a Ride
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition"
                >
                  Payment Methods
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition"
                >
                  Student FAQs
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  className="hover:text-primary-foreground transition"
                >
                  Safety Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">For Drivers</h4>
            <ul className="space-y-1.5 text-primary-foreground/70 text-xs sm:text-sm">
              <li>
                <Link
                  href="/driver-apply"
                  className="hover:text-primary-foreground transition"
                >
                  Become a Driver
                </Link>
              </li>
              <li>
                <a
                  href="#drivers"
                  className="hover:text-primary-foreground transition"
                >
                  Requirements
                </a>
              </li>
              <li>
                <a
                  href="#drivers"
                  className="hover:text-primary-foreground transition"
                >
                  Earnings
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  className="hover:text-primary-foreground transition"
                >
                  Driver Safety
                </a>
              </li>
              <li>
                <a
                  href="mailto:drivers@uniride.ng"
                  className="hover:text-primary-foreground transition"
                >
                  Driver Support
                </a>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-primary-foreground transition"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="bg-primary-foreground/20 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/70 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} UniRide. All rights reserved.
          </p>
          <div className="flex gap-3">
            {[
              {
                icon: Facebook,
                href: "https://facebook.com/uniride",
                label: "Facebook",
              },
              {
                icon: Twitter,
                href: "https://twitter.com/uniride",
                label: "Twitter",
              },
              {
                icon: Instagram,
                href: "https://instagram.com/uniride",
                label: "Instagram",
              },
              {
                icon: Linkedin,
                href: "https://linkedin.com/company/uniride",
                label: "LinkedIn",
              },
            ].map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="icon"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
