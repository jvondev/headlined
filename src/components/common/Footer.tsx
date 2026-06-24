
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Headlined. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
            About
          </Link>
          <a href="mailto:jvon.dev@gmail.com" className="text-sm text-muted-foreground hover:text-primary">
            Contact
          </a>
          <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
