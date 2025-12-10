
import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/common/Header';

// Title: 50 chars | Description: 154 chars
export const metadata: Metadata = {
  title: 'Terms of Service | Headlined News Reader',
  description: 'Terms of service for Headlined, a free news aggregation service. Learn about acceptable use, content policies, and your rights as a user.',
  alternates: {
    canonical: 'https://headlined.app/terms-of-service'
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: December 10, 2024</p>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Please read these Terms of Service ("Terms") carefully before using the Headlined website (the "Service") operated by us.
            </p>

            <h2 className="text-2xl font-semibold pt-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h2 className="text-2xl font-semibold pt-4">2. Use of the Service</h2>
            <p>
              Headlined is a free content reader provided for your personal, non-commercial use. You agree not to use the Service for any unlawful purpose or in a way that could harm, disable, or impair the Service.
            </p>

            <h2 className="text-2xl font-semibold pt-4">3. Content</h2>
            <p>
              The content displayed on Headlined is aggregated from various third-party sources. We do not own or control the content and are not responsible for its accuracy, legality, or appropriateness. You acknowledge that you access this content at your own risk.
            </p>

            <h2 className="text-2xl font-semibold pt-4">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of Headlined and its licensors.
            </p>

            <h2 className="text-2xl font-semibold pt-4">5. Limitation of Liability</h2>
            <p>
              In no event shall Headlined, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2 className="text-2xl font-semibold pt-4">6. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
            </p>

            <h2 className="text-2xl font-semibold pt-4">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
