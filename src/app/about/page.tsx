
import { Users, Lightbulb, Target, Link as LinkIcon, Gift, Mail, Building, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-4xl">
      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-foreground">
          আমাদের সম্পর্কে
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          শুদ্ধ AI প্রুফরিডার-এর পেছনের কথা, লক্ষ্য এবং আমাদের সহযোগী প্রতিষ্ঠানসমূহ।
        </p>
      </header>

      <section className="space-y-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold mb-2 flex items-center">
              <Lightbulb className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} /> আমাদের লক্ষ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
            <p>
              শুদ্ধ AI প্রুফরিডার তৈরি করা হয়েছে বাংলা লেখাকে আরও নির্ভুল, প্রাঞ্জল এবং আকর্ষণীয় করে তোলার লক্ষ্যে। আমরা বিশ্বাস করি, ভাষার শুদ্ধতা ভাবের গভীরতা বাড়ায় এবং যোগাযোগকে আরও শক্তিশালী করে। আমাদের এই প্ল্যাটফর্মটি লেখক, শিক্ষার্থী, এবং পেশাদারসহ সকলের জন্য বাংলা লেখার মান উন্নত করতে সাহায্য করবে।
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold mb-2 flex items-center">
              <Target className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} /> আমাদের প্রযুক্তি
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
            <p>
              আমরা অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা (AI) প্রযুক্তি ব্যবহার করে থাকি, যা বিশেষভাবে বাংলা ভাষার জটিলতা এবং সূক্ষ্মতা বোঝার জন্য প্রশিক্ষিত। এই প্রযুক্তি ব্যাকরণগত ত্রুটি, বানান ভুল এবং বাক্য গঠনে অসংগতি সনাক্ত করে এবং তা সংশোধনের জন্য সঠিক পরামর্শ দেয়।
            </p>
          </CardContent>
        </Card>

        <Card id="amadersomaj-prokashoni" className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold mb-2 flex items-center">
              <Building className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} /> আমাদের সমাজ প্রকাশনী
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
            <p>
              আমাদের সমাজ প্রকাশনী একটি সৃজনশীল এবং মননশীল প্রকাশনা সংস্থা। আমরা বাংলা সাহিত্য ও সংস্কৃতিকে সমৃদ্ধ করার লক্ষ্যে কাজ করে যাচ্ছি। আমাদের প্রকাশিত বইগুলো বিভিন্ন পাঠকশ্রেণির মন জয় করেছে।
            </p>
            {/* আপনি এখানে আরও বিস্তারিত তথ্য যোগ করতে পারেন */}
            <div className="mt-4">
                <h4 className="font-semibold text-card-foreground mb-1 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2 text-primary/80" strokeWidth={1.5} /> আরও জানুন:
                </h4>
                <ul className="space-y-1 text-primary">
                    <li>
                    <a href="https://amadersomaj.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary/80 transition-colors duration-200">
                        অফিসিয়াল ওয়েবসাইট (amadersomaj.com)
                    </a>
                    </li>
                </ul>
            </div>
          </CardContent>
        </Card>

        <Card id="montaj-fatema-foundation" className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold mb-2 flex items-center">
              <HeartHandshake className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} /> মন্তাজ ফাতেমা ফাউন্ডেশন
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
            <p>
              মন্তাজ ফাতেমা ফাউন্ডেশন একটি অলাভজনক প্রতিষ্ঠান যা শিক্ষা, স্বাস্থ্য এবং সামাজিক উন্নয়নে নিবেদিত। আমরা সমাজের পিছিয়ে পড়া জনগোষ্ঠীর জীবনমান উন্নয়নে বিভিন্ন প্রকল্প বাস্তবায়ন করে থাকি।
            </p>
            {/* আপনি এখানে আরও বিস্তারিত তথ্য যোগ করতে পারেন */}
             <div className="mt-4">
                <p className="text-muted-foreground">যোগাযোগ বা আরও তথ্যের জন্য, অনুগ্রহ করে ইমেইল করুন: <a href="mailto:foundation@montajfatema.org" className="text-primary hover:underline">foundation@montajfatema.org</a></p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold mb-1 flex items-center">
              <Gift className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} /> সকলের জন্য বিনামূল্যে
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
            <p>
              এই অ্যাপ্লিকেশনটি, <span className="font-semibold text-primary">শুদ্ধ AI প্রুফরিডার</span>, শিক্ষার্থী, লেখক, গবেষক এবং বাংলা ভাষা ব্যবহারকারী সকলের জন্য সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য। আমাদের লক্ষ্য, ভাষার শুদ্ধতা চর্চায় সকলকে উৎসাহিত করা এবং বাংলা ভাষার ডিজিটাল রিসোর্স বৃদ্ধি করা।
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
             <CardTitle className="font-headline text-2xl font-semibold mb-2 flex items-center">
                <Mail className="h-7 w-7 mr-3 text-primary" strokeWidth={1.5} />
                যোগাযোগ
             </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-card-foreground">
            <p>
              আপনার যেকোনো প্রশ্ন বা মতামতের জন্য, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার মূল্যবান মতামত গুরুত্বের সাথে বিবেচনা করি।
            </p>
            <p className="mt-2">
              ইমেইল: <a href="mailto:contact@shuddho.ai" className="text-primary hover:underline">contact@shuddho.ai</a>
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="text-center mt-12 space-x-4">
        <Button asChild variant="outline" size="lg">
          <Link href="/">হোমপেজে ফিরে যান</Link>
        </Button>
        <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/donate">আমাদের সহযোগিতা করুন</Link>
        </Button>
      </div>

       <footer className="text-center mt-16 py-8 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার। সর্বস্বত্ব সংরক্ষিত।
          <Link href="/donate" className="ml-2 text-primary hover:underline">আমাদের সহযোগিতা করুন</Link>
        </p>
      </footer>
    </main>
  );
}
