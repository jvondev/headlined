"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { ArrowRight, MessageSquare, Newspaper, PartyPopper, Plane, UserCheck, X, GalleryVerticalEnd, BookText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/common/Header";

const topics = [
  "💡 Artificial Intelligence", "💰 Stock Market", "🎨 UX Design", "🌍 Climate Change",
  "⚡ Productivity", "📱 Tech News", "🏗️ Startups", "✍️ Writing",
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Mockup = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg border bg-background relative flex-col items-center p-4">
      <div className="w-full h-full p-4 relative overflow-hidden">
        <motion.div 
          className="w-full absolute top-0"
          animate={{ y: ["-80%", "80%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="space-y-4">
              <div className="h-12 bg-muted rounded-lg w-full"></div>
              <div className="h-12 bg-muted rounded-lg w-4/5"></div>
              <div className="h-12 bg-muted rounded-lg w-full"></div>
              <div className="h-12 bg-muted rounded-lg w-3/4"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );

const features = [
    {
      Icon: GalleryVerticalEnd,
      name: "Scrolling Experience",
      description: "A TikTok-like feed for articles to prevent doomscrolling and keep you engaged.",
      href: "/",
      cta: "Learn more",
      background: <Mockup />,
      className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-3",
    },
    {
      Icon: BookText,
      name: "Article Summary",
      description: "Get the gist of any article with AI-powered summaries.",
      href: "/",
      cta: "Learn more",
      background: <div />,
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
      {
      Icon: Plane,
      name: "Read Offline",
      description: "Read on the subway, plane, or anywhere.",
      href: "/",
      cta: "Learn more",
      background: <div />,
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: PartyPopper,
      name: "Completely Free",
      description: "Not a 'free trial.' Just free, forever.",
      href: "/",
      cta: "Learn more",
      background: <div />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: UserCheck,
      name: "No Sign-Up",
      description: "Start reading in seconds. No account needed.",
      href: "/",
      cta: "Learn more",
      background: <div />,
      className: "lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4",
    },
  ];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      
      <main className="flex-1 pt-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 text-center">
          <motion.div 
            className="relative container mx-auto px-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 font-headline">
              Everything New Today—In One Scroll
            </motion.h1>
            <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              What happened in tech today? Any design trends? Market moving? Stop wondering. Start knowing.
            </motion.p>
            <motion.div variants={fadeIn} className="flex justify-center gap-4">
                <Link href="/today" passHref>
                    <Button size="lg" className="text-lg h-12 px-8 rounded-lg">
                      Pick Your Topics—Start Reading
                    </Button>
                </Link>
            </motion.div>
            <motion.p variants={fadeIn} className="text-sm text-muted-foreground mt-4">No download. No email. Choose topics and go.</motion.p>
          </motion.div>
        </section>

        {/* Transformation Section */}
        <motion.section 
          className="container mx-auto pb-20 -mt-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="grid grid-cols-1 gap-6">
              <motion.div variants={fadeIn} className="bg-card border p-8 rounded-lg text-center">
                <h3 className="font-bold text-xl text-primary mb-2">From This...</h3>
                <p className="text-muted-foreground mb-6">A chaotic, cluttered mess of tabs and notifications.</p>
                <div className="relative h-48 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="absolute w-4/5 p-4 bg-background rounded-lg shadow-2xl flex items-center space-x-4"
                    >
                        <Image src="/readmore_icon.webp" alt="ReadMore Logo" width={30} height={30} className="rounded-lg"/>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded-lg"></div>
                            <div className="h-4 bg-muted rounded-lg w-3/4"></div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileInView={{ opacity: 0, scale: 0.5, transition: { duration: 0.5, ease: "easeIn" } }}
                        viewport={{ once: true }}
                        className="absolute w-full h-full"
                    >
                        <motion.div className="absolute top-0 left-10 w-3/5 p-3 bg-card rounded-lg shadow-lg flex items-center space-x-2" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <Newspaper className="w-5 h-5 text-destructive"/> <div>Article Tab 1</div>
                        </motion.div>
                        <motion.div className="absolute top-16 left-24 w-2/5 p-3 bg-card rounded-lg shadow-lg flex items-center space-x-2" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}>
                            <MessageSquare className="w-5 h-5 text-primary"/> <div>Social Media</div>
                        </motion.div>
                        <motion.div className="absolute top-8 right-10 w-3/5 p-3 bg-card rounded-lg shadow-lg flex items-center space-x-2" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }}>
                           <X className="w-5 h-5 text-muted-foreground"/> <div>Cluttered Inbox</div>
                        </motion.div>
                    </motion.div>
                </div>
                <h3 className="font-bold text-xl text-primary mt-6 mb-2">...To This</h3>
                <p className="text-muted-foreground">One clean, calm, satisfying scroll.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* New Features Section */}
        <section id="features" className="container mx-auto py-20">
            <h2 className="text-center text-muted-foreground font-semibold tracking-widest uppercase mb-12">Features</h2>
            <BentoGrid className="lg:grid-rows-3">
              {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
        </section>
        
        {/* Topics Section */}
        <motion.section 
          id="topics"
          className="py-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Choose What You Want to Know About</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">Mix any topics. Change them anytime. 50+ topics to choose from.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {topics.map((topic, i) => (
                <motion.div key={topic} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                    <Badge variant="secondary" className="text-md py-2 px-4 rounded-lg">{topic}</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
            id="faq"
            className="container mx-auto py-20 max-w-3xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">What You're Wondering</motion.h2>
          <motion.div variants={fadeIn}>
              <Accordion type="single" collapsible className="w-full rounded-lg border">
                <AccordionItem value="item-1"> <AccordionTrigger className="text-lg px-6">How do I know it's today's stuff?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">We only show posts published in the last 24 hours. If it's old, it's not here.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-2"> <AccordionTrigger className="text-lg px-6">Can I change topics later?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Yes. Anytime. Takes 5 seconds.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-3"> <AccordionTrigger className="text-lg px-6">What if I miss a day?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Doesn't matter. Tomorrow shows tomorrow's posts. No FOMO. No catching up.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-4" className="border-b-0"> <AccordionTrigger className="text-lg px-6">Works on my phone?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Phone, tablet, laptop—anywhere with a browser. Even offline.</AccordionContent> </AccordionItem>
              </Accordion>
          </motion.div>
        </motion.section>
        
        {/* Final CTA */}
        <section className="py-32 text-center">
          <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              variants={staggerContainer}
          >
            <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 font-headline">Stop Wondering. Start Knowing.</motion.h2>
            <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Every topic you care about. Every post from today. One morning scroll. That's it.
            </motion.p>
            <motion.div variants={fadeIn}>
                <Link href="/today" passHref>
                  <Button size="lg" className="text-xl h-14 px-10 rounded-lg">
                    Get Started Free
                  </Button>
                </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
