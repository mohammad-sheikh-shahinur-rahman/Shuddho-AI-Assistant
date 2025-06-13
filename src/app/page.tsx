import { BanglaCorrectorForm } from "@/components/bangla-corrector-form";
import { BookText } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-3xl">
      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
           <BookText className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-gray-800">
          শুদ্ধ AI সহকারী
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          আপনার বাংলা লেখাকে আরও নির্ভুল, আকর্ষণীয় ও সঠিক টোনে রূপান্তর করুন।
        </p>
      </header>
      <BanglaCorrectorForm />
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} শুদ্ধ AI সহকারী. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
