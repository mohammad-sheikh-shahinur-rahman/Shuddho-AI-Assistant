
import { Users, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-3xl">
      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-gray-800">
          আমাদের সম্পর্কে
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          শুদ্ধ AI প্রুফরিডার-এর পেছনের কথা।
        </p>
      </header>

      <section className="space-y-8 font-body text-base sm:text-lg text-gray-700">
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="font-headline text-2xl font-semibold text-gray-800 mb-3 flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-primary" /> আমাদের লক্ষ্য
          </h2>
          <p>
            শুদ্ধ AI প্রুফরিডার তৈরি করা হয়েছে বাংলা লেখাকে আরও নির্ভুল, প্রাঞ্জল এবং আকর্ষণীয় করে তোলার লক্ষ্যে। আমরা বিশ্বাস করি, ভাষার শুদ্ধতা ভাবের গভীরতা বাড়ায় এবং যোগাযোগকে আরও শক্তিশালী করে। আমাদের এই প্ল্যাটফর্মটি লেখক, শিক্ষার্থী, এবং পেশাদারসহ সকলের জন্য বাংলা লেখার মান উন্নত করতে সাহায্য করবে।
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="font-headline text-2xl font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="h-6 w-6 mr-2 text-primary" /> আমাদের প্রযুক্তি
          </h2>
          <p>
            আমরা অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা (AI) প্রযুক্তি ব্যবহার করে থাকি, যা বিশেষভাবে বাংলা ভাষার জটিলতা এবং সূক্ষ্মতা বোঝার জন্য প্রশিক্ষিত। এই প্রযুক্তি ব্যাকরণগত ত্রুটি, বানান ভুল এবং বাক্য গঠনে অসংগতি সনাক্ত করে এবং তা সংশোধনের জন্য সঠিক পরামর্শ দেয়।
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="font-headline text-2xl font-semibold text-gray-800 mb-3">
            যোগাযোগ
          </h2>
          <p>
            আপনার যেকোনো প্রশ্ন বা মতামতের জন্য, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার মূল্যবান মতামত গুরুত্বের সাথে বিবেচনা করি।
          </p>
          <p className="mt-2">
            ইমেইল: <a href="mailto:contact@shuddho.ai" className="text-primary hover:underline">contact@shuddho.ai</a>
          </p>
        </div>
      </section>

      <div className="text-center mt-12">
        <Button asChild variant="outline">
          <Link href="/">হোমপেজে ফিরে যান</Link>
        </Button>
      </div>

       <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
