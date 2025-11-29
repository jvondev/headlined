
import Link from 'next/link';
import { Header } from '@repo/ui/components/common/Header';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About ReadMore</h1>
          <p className="text-lg text-muted-foreground mb-8">
            ReadMore is a modern content reader designed for a fast, intuitive, and enjoyable reading experience, inspired by the seamless vertical scrolling of platforms like TikTok. Our mission is to help you stay updated with your favorite topics and news sources without the clutter and noise of traditional content platforms.
          </p>
          
          <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
          <p className="text-lg text-muted-foreground mb-8">
            In a world of information overload, we believe that staying informed should be simple and engaging. We created ReadMore to be a free, no-login-required platform where you can instantly dive into content that matters to you. Whether you're catching up on tech news, design trends, or market analysis, ReadMore provides a clean, focused, and personalized feed.
          </p>

          <h2 className="text-3xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-lg text-muted-foreground space-y-4 mb-8">
            <li><strong>TikTok-style Scrolling:</strong> Effortlessly swipe through articles and posts in a vertical feed.</li>
            <li><strong>No Sign-up Required:</strong> Jump right into reading without creating an account.</li>
            <li><strong>Personalized Topics:</strong> Choose from a wide range of topics to customize your feed.</li>
            <li><strong>Clean & Modern UI:</strong> A beautiful, minimalist interface that puts the content first.</li>
            <li><strong>Free to Use:</strong> Access all our features completely free of charge.</li>
          </ul>

          <p className="text-lg text-muted-foreground">
            We are constantly working to improve ReadMore and add new features to enhance your reading experience. Thank you for being a part of our community.
          </p>
        </div>
      </main>
    </div>
  );
}
