
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We'd love to hear from you! Whether you have a question, a feature request, or just want to say hello, feel free to reach out to us.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                className="mt-1 block w-full"
                placeholder="Your message..."
              />
            </div>
            <Button type="submit">Send Message</Button>
          </form>

          <div className="mt-12">
            <p className="text-lg text-muted-foreground">
              You can also reach us directly at <a href="mailto:support@headlined.com" className="text-primary hover:underline">support@headlined.com</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
