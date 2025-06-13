
import { BanglaCorrectorForm } from "@/components/bangla-corrector-form";
import { BookOpen, Coins } from "lucide-react";
import Link from 'next/link';

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
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          <Link href="/about" className="hover:text-primary hover:underline">আমাদের সম্পর্কে</Link>
          <span className="mx-2">|</span>
          <Link href="/donate" className="hover:text-primary hover:underline flex items-center justify-center sm:inline-flex">
            <Coins className="mr-1 h-4 w-4" strokeWidth={1.5} /> আমাদের সহযোগিতা করুন
          </Link>
          <span className="mx-2">|</span>
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার।
        </p>
      </footer>
    </main>
  );
}
