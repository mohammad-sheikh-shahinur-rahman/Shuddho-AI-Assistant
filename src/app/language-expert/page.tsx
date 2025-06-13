
import { LanguageExpertChat } from "@/components/language-expert-chat";
import { Bot, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LanguageExpertPage() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col items-center min-h-screen">
      <header className="text-center mb-8 sm:mb-10 w-full max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
           <Bot className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-foreground">
          ভাষাবিদ AI চ্যাট
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          আপনার বাংলা ভাষা সম্পর্কিত যেকোনো প্রশ্ন করুন এবং তাৎক্ষণিক উত্তর ও বিশ্লেষণ পান।
        </p>
      </header>
      
      <LanguageExpertChat />

      <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} /> হোমপেজে ফিরে যান
            </Link>
          </Button>
        </div>

      <footer className="text-center mt-12 py-6 border-t border-border w-full max-w-3xl">
        <p className="text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার ও ভাষাবিদ। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
