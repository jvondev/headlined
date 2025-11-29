'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion';
import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import { BentoCard, BentoGrid } from '@repo/ui/components/ui/bento-grid';
import { AnimatedList } from '@repo/ui/components/ui/animated-list';
import { ArrowRight, GalleryVerticalEnd, BookText, Plane, PartyPopper, UserCheck, Twitter, MessageCircle, AppWindow, Sparkles, Clock, CheckCircle, Sun, Repeat, AlertCircle, Meh, Film, Square, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/common/Header';
import { ReactElement } from 'react';
import { LineShadowText } from '@repo/ui/components/ui/line-shadow-text';

const topics = [
  '💡 Artificial Intelligence', '💰 Stock Market', '🎨 UX Design', '🌍 Climate Change',
  '⚡ Productivity', '📱 Tech News', '🏗️ Startups', '✍️ Writing',
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
    <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-lg border bg-background relative flex-col items-center p-4">
      <div className="w-full h-full p-4 relative overflow-hidden">
        <motion.div 
          className="w-full h-full absolute top-0"
          animate={{ y: ['-80%', '80%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
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
      name: 'Scrolling Experience',
      description: 'A TikTok-like feed for articles to prevent doomscrolling and keep you engaged.',
      href: '/',
      background: <Mockup />,
      className: 'lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-3',
    },
    {
      Icon: BookText,
      name: 'Article Summary',
      description: 'Get the gist of any article with AI-powered summaries.',
      href: '/',
      background: <div />,
      className: 'lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2',
    },
      {
      Icon: Plane,
      name: 'Read Offline',
      description: 'Read on the subway, plane, or anywhere.',
      href: '/',
      background: <div />,
      className: 'lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3',
    },
    {
      Icon: PartyPopper,
      name: 'Completely Free',
      description: "Not a 'free trial.' Just free, forever.",
      href: '/',
      background: <div />,
      className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
    },
    {
      Icon: UserCheck,
      name: 'No Sign-Up',
      description: 'Start reading in seconds. No account needed.',
      href: '/',
      background: <div />,
      className: 'lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-4',
    },
  ];

const beforeItems = [
    { name: "Scroll TikTok", description: "Hours gone, brain feels empty", icon: <Film /> },
    { name: "Open Twitter", description: "Can't tell what's real news and rage bait", icon: <Twitter /> },
    { name: "Check Reddit", description: "Lost in random threads", icon: <MessageCircle /> },
    { name: "Scroll Instagram", description: "Feel behind on everything", icon: <Film /> },
];

const afterItem = {
    name: "Open Readmore",
    icon: <AppWindow />,
    description: [
        "Scroll your topics for 5 minutes",
        "Know what's happening, move on with your day"
    ]
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      
      <main className="flex-1 pt-12 w-full px-4 lg:mx-auto lg:max-w-7xl">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 text-center">
          <motion.div 
            className="relative w-full lg:container lg:mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 font-headline">
              <LineShadowText as="span">Everything</LineShadowText> <LineShadowText as="span">New</LineShadowText> <span>Today—In</span> <LineShadowText as="span">One</LineShadowText> <LineShadowText as="span">Scroll</LineShadowText>
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

        {/* How Your Morning Changes Section */}
        <section className="w-full px-4 py-20 lg:container lg:mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-2">
                How Your <LineShadowText as="span">Morning</LineShadowText> Changes
            </h2>
            <p className="text-center text-lg text-muted-foreground mt-2 mb-12">
                You stay informed without the chaos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-card border p-8 rounded-lg">
                    <h3 className="font-bold text-xl text-muted-foreground mb-6">Before</h3>
                    <AnimatedList>
                        {beforeItems.map((item, index) => (
                            <li key={index} className={`group list-none p-3 rounded-lg bg-muted/50 transition-all duration-300 ease-in-out hover:bg-muted hover:scale-[1.02]`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl text-muted-foreground`}>{item.icon}</span>
                                    <span className="text-muted-foreground text-lg font-semibold">{item.name}</span>
                                </div>
                                <p className="text-muted-foreground text-md mt-1 pl-10">{item.description}</p>
                            </li>
                        ))}
                    </AnimatedList>
                </div>
                <div className="bg-card border p-8 rounded-lg border-white/50">
                    <h3 className="font-bold text-xl text-muted-foreground mb-6">After</h3>
                    <div className="group p-3 rounded-lg border border-white/20 bg-muted/50 transition-all duration-300 ease-in-out hover:bg-muted hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl text-muted-foreground">{afterItem.icon}</span>
                            <span className="text-muted-foreground text-lg font-semibold">{afterItem.name}</span>
                        </div>
                        <div className="pl-10 mt-1">
                            <AnimatedList className="gap-1 list-none">
                                {afterItem.description.map((desc, i) => (
                                    <li key={i} className="text-muted-foreground text-md">
                                        {desc}
                                    </li>
                                ))}
                            </AnimatedList>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* New Features Section */}
        <section id="features" className="w-full px-4 py-20 lg:container lg:mx-auto">
            <h2 className="text-center text-4xl font-semibold tracking-widest mb-12"><LineShadowText as="span">Features</LineShadowText></h2>
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
          <div className="w-full px-4 lg:container lg:mx-auto">
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
            className="w-full px-4 py-20 lg:container lg:mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">What You're Wondering</motion.h2>
          <motion.div variants={fadeIn}>
              <Accordion type="single" collapsible defaultValue="item-free" className="w-full rounded-lg">
                <AccordionItem value="item-free" className="mb-4 rounded-lg">
                  <AccordionTrigger className="text-lg px-6 font-bold rounded-lg">Is ReadMore truly 100% free?</AccordionTrigger>
                  <AccordionContent className="text-lg text-muted-foreground px-6">Yes, absolutely. ReadMore is completely free to use, with no hidden costs or subscriptions.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1" className="mb-4 rounded-lg"> <AccordionTrigger className="text-lg px-6 font-bold rounded-lg">How do I know it's today's stuff?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">We only show posts published in the last 24 hours. If it's old, it's not here.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-2" className="mb-4 rounded-lg"> <AccordionTrigger className="text-lg px-6 font-bold rounded-lg">Can I change topics later?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Yes. Anytime. Takes 5 seconds.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-3" className="mb-4 rounded-lg"> <AccordionTrigger className="text-lg px-6 font-bold rounded-lg">What if I miss a day?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Doesn't matter. Tomorrow shows tomorrow's posts. No FOMO. No catching up.</AccordionContent> </AccordionItem>
                <AccordionItem value="item-4" className="border-b-0 mb-4 rounded-lg"> <AccordionTrigger className="text-lg px-6 font-bold rounded-lg">Works on my phone?</AccordionTrigger> <AccordionContent className="text-lg text-muted-foreground px-6">Phone, tablet, laptop—anywhere with a browser. Even offline.</AccordionContent> </AccordionItem>
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
            <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 font-headline"><span>Stop</span> <LineShadowText as="span">Wondering.</LineShadowText> <span>Start</span> <LineShadowText as="span">Knowing.</LineShadowText></motion.h2>
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
    </div>
  );
}
