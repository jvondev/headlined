
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, PartyPopper, Plane, UserCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const topics = [
  "💡 Artificial Intelligence", "💰 Stock Market", "🎨 UX Design", "🌍 Climate Change",
  "⚡ Productivity", "📱 Tech News", "🏗️ Startups", "✍️ Writing",
];

const testimonials = [
  {
    quote: "I was checking 10 sites every morning. Now it's just one.",
    author: "Designer who follows UX, Tech, Productivity",
  },
  {
    quote: "Finally I can keep up with AI without living on Twitter.",
    author: "Developer who just wants the highlights",
  },
  {
    quote: "I read offline on my commute. Best 20 minutes of my day.",
    author: "Marketer learning about new tools daily",
  },
];

const comparison = [
    { platform: "Twitter", con: "Too much noise, you miss real news" },
    { platform: "Reddit", con: "You're scrolling r/all, not your topics" },
    { platform: "Google News", con: "Generic headlines, not your interests" },
    { platform: "Newsletters", con: "Inbox clutter, you'll read 'later' (never)" },
    { platform: "Bookmarks", con: "Tabs pile up, you never go back" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image src="/readmore_icon.webp" alt="ReadMore Logo" width={32} height={32} />
            <span>ReadMore</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
             <Link href="/today" passHref>
                <Button variant="ghost">Get Started</Button>
              </Link>
              <Link href="/today" passHref>
                <Button>
                  Let's Explore <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 text-center">
          <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20 dark:opacity-10">
            <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400"></div>
            <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300"></div>
          </div>
          <div className="relative container mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 font-headline">
              Everything New Today—In One Scroll
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              What happened in tech today? Any design trends? Market moving? Stop wondering. Start knowing.
            </p>
            <div className="flex justify-center gap-4">
                <Link href="/today" passHref>
                    <Button size="lg" className="text-lg h-12 px-8">
                      Pick Your Topics—Start Reading
                    </Button>
                </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No download. No email. Choose topics and go.</p>
          </div>
        </section>

        {/* App Showcase */}
        <section className="container mx-auto pb-20 -mt-16">
            <div className="relative mx-auto border-border/20 border-2 bg-card/50 rounded-2xl shadow-2xl w-full max-w-5xl">
                <div className="p-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-2xl font-medium">[Live App Demo Placeholder]</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Problem Section */}
        <section className="container mx-auto py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">You Just Want to Know What's New</h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            Every morning, same question: "What did I miss?" In AI. In your industry. In topics you care about. You don't want to read everything. You just want to stay in the loop. We get it. That's why we exist.
          </p>
        </section>

        {/* Features Section */}
        <section className="container mx-auto py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/20 text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <CardTitle>Completely Free</CardTitle>
              </CardHeader>
              <CardContent><p className="text-muted-foreground">Not "free trial." Just free. Forever. No hidden costs, no premium upsells.</p></CardContent>
            </Card>
            <Card className="bg-card/50 border-border/20 text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                  <Plane className="w-8 h-8" />
                </div>
                <CardTitle>Read Offline</CardTitle>
              </CardHeader>
              <CardContent><p className="text-muted-foreground">Download posts. Read on the subway, plane, anywhere.</p></CardContent>
            </Card>
            <Card className="bg-card/50 border-border/20 text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                  <UserCheck className="w-8 h-8" />
                </div>
                <CardTitle>No Sign-Up</CardTitle>
              </CardHeader>
              <CardContent><p className="text-muted-foreground">Pick topics. Start reading. Takes 10 seconds.</p></CardContent>
            </Card>
          </div>
        </section>

        {/* Before/After Section */}
        <section className="container mx-auto py-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">How Your Morning Changes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/50 border-destructive/20">
              <CardHeader><CardTitle>Before</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <p>Open Twitter → scroll random stuff</p>
                <p>Check Reddit → open 5 tabs</p>
                <p>Forget what you were looking for</p>
                <p className="font-semibold text-foreground/80">"Did I miss something important?"</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20">
              <CardHeader><CardTitle>After</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <p>Open app → see today's posts</p>
                <p>Scroll 5 minutes</p>
                <p>Get on with your day</p>
                <p className="font-semibold text-primary">"Okay, I know what's happening"</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Choose What You Want to Know About</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">Mix any topics. Change them anytime. 50+ topics to choose from.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {topics.map((topic) => <Badge key={topic} variant="secondary" className="text-md py-2 px-4">{topic}</Badge>)}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="container mx-auto py-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">Why This Beats Everything Else</h2>
            <Card className="max-w-2xl mx-auto bg-card/50 border-border/20">
                <CardContent className="divide-y divide-border/20 p-6">
                    {comparison.map(item => (
                        <div key={item.platform} className="flex items-center justify-between py-3">
                            <span className="font-semibold">{item.platform}</span>
                            <span className="text-muted-foreground flex items-center gap-2"><X className="w-4 h-4 text-destructive"/> {item.con}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between py-3 text-primary">
                        <span className="font-semibold">ReadMore</span>
                        <span className="font-semibold flex items-center gap-2"><Check className="w-4 h-4"/> One clean scroll.</span>
                    </div>
                </CardContent>
            </Card>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto py-20 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">What You're Wondering</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">How do I know it's today's stuff?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground">We only show posts published in the last 24 hours. If it's old, it's not here.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">Can I change topics later?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground">Yes. Anytime. Takes 5 seconds.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">What if I miss a day?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground">Doesn't matter. Tomorrow shows tomorrow's posts. No FOMO. No catching up.</AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">Works on my phone?</AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground">Phone, tablet, laptop—anywhere with a browser. Even offline.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        {/* Final CTA */}
        <section className="py-32 text-center">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 font-headline">Stop Wondering. Start Knowing.</h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Every topic you care about. Every post from today. One morning scroll. That's it.
            </p>
            <Link href="/today" passHref>
              <Button size="lg" className="text-xl h-14 px-10">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container mx-auto py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
