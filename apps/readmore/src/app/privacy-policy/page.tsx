
import Link from 'next/link';
import { Header } from '@/components/common/Header';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              ReadMore ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
            </p>

            <h2 className="text-2xl font-semibold pt-4">1. Information We Collect</h2>
            <p>
              Since ReadMore does not require user registration, we collect minimal information. The data we collect is limited to:
              <ul>
                <li><strong>Usage Data:</strong> We may automatically collect information about your device and how you interact with our website. This may include your IP address, browser type, operating system, and browsing behavior.</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your experience, such as remembering your preferred topics and settings.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold pt-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
              <ul>
                <li>Provide, operate, and maintain our website.</li>
                <li>Improve, personalize, and expand our website.</li>
                <li>Understand and analyze how you use our website.</li>
                <li>Serve advertisements through third-party partners like Google AdSense.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold pt-4">3. Third-Party Services</h2>
            <p>
              We may use third-party services, such as Google AdSense, to display advertisements. These services may use cookies and similar technologies to collect information about your browsing activities to provide targeted advertising. We do not control the practices of these third parties.
            </p>

            <h2 className="text-2xl font-semibold pt-4">4. Your Choices</h2>
            <p>
              You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, this can affect how you are able to interact with our site as well as other websites.
            </p>

            <h2 className="text-2xl font-semibold pt-4">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2 className="text-2xl font-semibold pt-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
