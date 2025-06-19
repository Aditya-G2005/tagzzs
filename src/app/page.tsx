import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  FileText,
  Bookmark,
  Tag,
  Folder,
  ArrowRight,
  Play,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FeatureCard } from "./components/Feature-Card";
import { TestimonialCard } from "./components/Testimonial-Card";
import { HowItWorksStep } from "./components/How-It-Works-Step";
import { ScreenshotCarousel } from "./components/Screenshot-Carousel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Tagzs</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#demo"
              className="text-sm font-medium hover:text-primary"
            >
              Demo
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant={"outline"} asChild>
              <Link href="/auth/signin">Signin</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Signup</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.02]"></div>
          <div className="container relative z-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="flex flex-col gap-6">
                <Badge className="w-fit" variant="outline">
                  Join Now
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Organize Your Digital World Effortlessly
                </h1>
                <p className="text-xl text-muted-foreground">
                  Tagzs brings all your files, notes, bookmarks, and digital
                  content into one searchable, tag-based system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Button size="lg" className="gap-2">
                    <Link href={"/auth/signup"} className="flex items-center justify-center gap-2">
                      Signup <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    Learn More <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden border shadow-lg">
                <Image
                  src="https://plus.unsplash.com/premium_photo-1664105111034-33e24dc90a78?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b3JnYW5pc2V8ZW58MHx8MHx8fDA%3D"
                  alt="Tagzs dashboard preview"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  The Problem with Digital Clutter
                </h2>
                <p className="text-lg text-muted-foreground">
                  In today&apos;s digital world, we&apos;re overwhelmed with
                  information spread across multiple apps, platforms, and
                  devices. Finding what you need when you need it has become
                  increasingly difficult.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Files scattered across cloud services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Bookmarks lost in browser chaos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Notes trapped in different apps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Important information that&apos;s hard to find</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  Our Solution: Tagzs
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tagzs brings everything together in one place with a powerful
                  tagging system that works the way your brain does. No more
                  rigid folder structures or searching through multiple apps.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Universal Search
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Find anything in seconds, regardless of where it&apos;s
                        stored.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Smart Tagging</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Organize content your way with flexible,
                        cross-referenced tags.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Powerful Features for Digital Organization
              </h2>
              <p className="text-lg text-muted-foreground">
                Tagzs combines powerful organization tools with an intuitive
                interface to help you take control of your digital life.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<FileText className="h-10 w-10 text-primary" />}
                title="Universal Content Hub"
                description="Connect and access all your files, documents, and media from a single dashboard."
              />
              <FeatureCard
                icon={<Tag className="h-10 w-10 text-primary" />}
                title="Smart Tagging System"
                description="Create custom tags and organize content across traditional boundaries."
              />
              <FeatureCard
                icon={<Bookmark className="h-10 w-10 text-primary" />}
                title="Bookmark Manager"
                description="Save and organize web content with automatic categorization and previews."
              />
              <FeatureCard
                icon={<Folder className="h-10 w-10 text-primary" />}
                title="Cross-Platform Sync"
                description="Access your organized content from any device with real-time synchronization."
              />
              <FeatureCard
                icon={<MessageCircle className="h-10 w-10 text-primary" />}
                title="Collaborative Spaces"
                description="Share and collaborate on collections with team members or friends."
              />
              <FeatureCard
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
                title="AI-Powered Organization"
                description="Let AI suggest tags and connections between your content for effortless organization."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                How Tagzs Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Getting started with Tagzs is simple. Follow these steps to
                organize your digital world.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
              <HowItWorksStep
                number={1}
                title="Connect Your Accounts"
                description="Link your cloud storage, note apps, and bookmark services to Tagzs."
              />
              <HowItWorksStep
                number={2}
                title="Import Your Content"
                description="Tagzs automatically imports and indexes your existing digital content."
              />
              <HowItWorksStep
                number={3}
                title="Organize with Tags"
                description="Create custom tags or use AI-suggested tags to organize everything."
              />
              <HowItWorksStep
                number={4}
                title="Search & Discover"
                description="Find anything instantly with powerful search and discover new connections."
              />
            </div>
          </div>
        </section>

        {/* Product Demo */}
        <section id="demo" className="py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                See Tagzs in Action
              </h2>
              <p className="text-lg text-muted-foreground">
                Watch how Tagzs transforms digital organization and makes
                finding information effortless.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="relative aspect-video rounded-lg overflow-hidden border shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-background/80 backdrop-blur-sm"
                  >
                    <Play
                      className="h-5 w-5 text-primary"
                      fill="currentColor"
                    />
                    Watch Demo
                  </Button>
                </div>
                <Image
                  src="/landingpg.jpg"
                  alt="Tagzs video thumbnail"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Product Screenshots</h3>
                <p className="text-muted-foreground">
                  Explore the intuitive interface and powerful features of Tagzs
                  through these screenshots.
                </p>
                <ScreenshotCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                What Early Users Are Saying
              </h2>
              <p className="text-lg text-muted-foreground">
                Our beta testers are already experiencing the benefits of an
                organized digital life.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <TestimonialCard
                quote="Tagzs has completely transformed how I organize my research. I can finally find everything in seconds!"
                author="Sarah K."
                role="UX Researcher"
              />
              <TestimonialCard
                quote="As someone with ADHD, traditional folders never worked for me. Tagzs' tagging system matches how my brain actually works."
                author="Michael T."
                role="Software Developer"
              />
              <TestimonialCard
                quote="I've tried dozens of organization tools, but Tagzs is the first one that actually brings everything together seamlessly."
                author="Elena R."
                role="Content Creator"
              />
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-xl font-medium mb-6">
                Trusted by early adopters from
              </h3>
              <div className="flex flex-wrap justify-center gap-8 opacity-70">
                <div className="h-8 w-32 bg-foreground/20 rounded"></div>
                <div className="h-8 w-32 bg-foreground/20 rounded"></div>
                <div className="h-8 w-32 bg-foreground/20 rounded"></div>
                <div className="h-8 w-32 bg-foreground/20 rounded"></div>
                <div className="h-8 w-32 bg-foreground/20 rounded"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Early Access */}
        <section id="pricing" className="py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Early Access Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Join our waitlist today and be among the first to experience
                Tagzs with special early adopter benefits.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <Card className="border-muted">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>
                    Basic organization for individuals
                  </CardDescription>
                  <div className="mt-4 text-4xl font-bold">$0</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Connect up to 3 services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Basic tagging system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>1GB storage for notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Standard search</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Join Waitlist
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary md:scale-105 shadow-lg">
                <CardHeader>
                  <Badge className="absolute right-4 top-4">Popular</Badge>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>
                    Advanced features for power users
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Unlimited service connections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Advanced tagging with AI suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>10GB storage for notes and files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Full-text search with filters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Priority early access</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Pro Waitlist</Button>
                </CardFooter>
              </Card>

              <Card className="border-muted">
                <CardHeader>
                  <CardTitle>Team</CardTitle>
                  <CardDescription>
                    Collaboration for small teams
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Up to 5 team members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Collaborative workspaces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>50GB shared storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Admin controls</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Join Team Waitlist
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-6">
                All plans during beta include a 30% lifetime discount when we
                launch.
              </p>
              <Button size="lg" id="waitlist" className="gap-2">
                Join the Waitlist <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions about Tagzs? Find answers to the most common
                questions below.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    When will Tagzs be available?
                  </AccordionTrigger>
                  <AccordionContent>
                    We&apos;re currently in private beta and plan to launch
                    publicly in Q3 2023. Join our waitlist to get early access
                    and be notified when we launch.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Which services and platforms does Tagzs integrate with?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tagzs integrates with popular cloud storage services (Google
                    Drive, Dropbox, OneDrive), note-taking apps (Notion,
                    Evernote), bookmark managers (Chrome, Firefox), and more.
                    We&apos;re constantly adding new integrations.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Is my data secure with Tagzs?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, security is our top priority. Tagzs uses end-to-end
                    encryption for all data, and we never store your credentials
                    for third-party services. We use OAuth for secure
                    authentication and follow industry best practices for data
                    protection.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I use Tagzs offline?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Tagzs has offline capabilities. You can access your
                    recently viewed content and make changes that will sync once
                    you&apos;re back online. Full offline support is available
                    for Pro and Team plans.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    How is Tagzs different from other organization tools?
                  </AccordionTrigger>
                  <AccordionContent>
                    Unlike traditional tools that focus on specific content
                    types or use rigid folder structures, Tagzs brings
                    everything together with a flexible tagging system. This
                    allows for cross-referencing and organizing content in
                    multiple ways simultaneously, matching how your brain
                    naturally connects information.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    Can I cancel my subscription anytime?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, you can cancel your subscription at any time. If you
                    cancel, you&apos;ll continue to have access until the end of
                    your billing period, after which you&apos;ll be downgraded
                    to the free plan.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Stay Updated
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our newsletter to get the latest updates, early access
                opportunities, and organization tips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Support</span>
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Tagzs</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Organize your digital world effortlessly with our powerful
                tagging system.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Beta Program
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tagzs. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
