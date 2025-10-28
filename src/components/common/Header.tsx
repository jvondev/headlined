"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";


const ReadMoreLogo = () => {
  return (
    <Link href="/" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black">
      <Image src="/readmore_icon.webp" alt="ReadMore Logo" width={30} height={30} className="rounded-lg"/>
      <span className="font-medium text-black dark:text-white">ReadMore</span>
    </Link>
  );
};

export default function Header() {
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Topics",
      link: "#topics",
    },
    {
      name: "FAQ",
      link: "#faq",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full py-2">
      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Navbar className="rounded-lg border">
          {/* Desktop Navigation */}
          <NavBody>
            <ReadMoreLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton as={Link} href="/today" variant="primary" className="rounded-lg">
                Start Reading <ArrowRight className="w-4 h-4 ml-2" />
              </NavbarButton>
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav className="rounded-lg border">
            <MobileNavHeader>
              <ReadMoreLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              className="rounded-lg"
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                  <NavbarButton
                      as={Link}
                      href="/today"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      className="w-full rounded-lg"
                  >
                      Start Reading
                  </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>
    </div>
  );
}