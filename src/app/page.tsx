
import { BanglaCorrectorForm } from "@/components/bangla-corrector-form";
import { BanglaSummarizerForm } from "@/components/bangla-summarizer-form";
import { BookOpen, Coins, ScrollText, Bot } from "lucide-react";
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-5xl">
      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
           <BookOpen className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-foreground">
          শুদ্ধ AI প্রুফরিডার
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          আপনার বই, পাণ্ডুলিপি বা যেকোনো দীর্ঘ বাংলা লেখাকে নির্ভুল ও প্রাঞ্জল করুন।
        </p>
      </header>
      <BanglaCorrectorForm />

      <Separator className="my-12 sm:my-16 md:my-20" />

      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
           <ScrollText className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-foreground">
          বাংলা লেখা সারাংশকরণ
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          দীর্ঘ বাংলা লেখা থেকে মূলভাব ও প্রয়োজনীয় তথ্যগুলো সংক্ষিপ্ত আকারে পান।
        </p>
      </header>
      <BanglaSummarizerForm />

      <Separator className="my-12 sm:my-16 md:my-20" />

      <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="items-center text-center pb-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
                <Bot className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <CardTitle className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
                ভাষাবিদ AI চ্যাট
            </CardTitle>
            <CardDescription className="font-body text-md text-muted-foreground mt-2 max-w-lg mx-auto">
                বাংলা ভাষা, ব্যাকরণ, শব্দার্থ বা লেখা সম্পর্কিত যেকোনো প্রশ্ন করুন আমাদের AI ভাষাবিদকে।
            </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/language-expert">
                    ভাষাবিদের সাথে কথা বলুন
                    <Bot className="ml-2 h-5 w-5" strokeWidth={1.5} />
                </Link>
            </Button>
        </CardContent>
      </Card>


      <footer className="text-center mt-16 py-8 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          <Link href="/about" className="hover:text-primary hover:underline">আমাদের সম্পর্কে</Link>
          <span className="mx-2">|</span>
          <Link href="/donate" className="hover:text-primary hover:underline flex items-center justify-center sm:inline-flex">
            <Coins className="mr-1 h-4 w-4" strokeWidth={1.5} /> আমাদের সহযোগিতা করুন
          </Link>
           <span className="mx-2">|</span>
          <Link href="/language-expert" className="hover:text-primary hover:underline flex items-center justify-center sm:inline-flex">
            <Bot className="mr-1 h-4 w-4" strokeWidth={1.5} /> ভাষাবিদের সাথে কথা বলুন
          </Link>
          <span className="mx-2">|</span>
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}

