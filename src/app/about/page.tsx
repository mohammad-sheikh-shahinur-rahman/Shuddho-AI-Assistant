
import { Users, Lightbulb, Target, UserCircle, Link as LinkIcon, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-4xl">
      <header className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-gray-800">
          আমাদের সম্পর্কে
        </h1>
        <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
          শুদ্ধ AI প্রুফরিডার-এর পেছনের কথা এবং নির্মাতার পরিচিতি।
        </p>
      </header>

      <section className="space-y-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold text-gray-800 mb-2 flex items-center">
              <Lightbulb className="h-7 w-7 mr-3 text-primary" /> আমাদের লক্ষ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              শুদ্ধ AI প্রুফরিডার তৈরি করা হয়েছে বাংলা লেখাকে আরও নির্ভুল, প্রাঞ্জল এবং আকর্ষণীয় করে তোলার লক্ষ্যে। আমরা বিশ্বাস করি, ভাষার শুদ্ধতা ভাবের গভীরতা বাড়ায় এবং যোগাযোগকে আরও শক্তিশালী করে। আমাদের এই প্ল্যাটফর্মটি লেখক, শিক্ষার্থী, এবং পেশাদারসহ সকলের জন্য বাংলা লেখার মান উন্নত করতে সাহায্য করবে।
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold text-gray-800 mb-2 flex items-center">
              <Target className="h-7 w-7 mr-3 text-primary" /> আমাদের প্রযুক্তি
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              আমরা অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা (AI) প্রযুক্তি ব্যবহার করে থাকি, যা বিশেষভাবে বাংলা ভাষার জটিলতা এবং সূক্ষ্মতা বোঝার জন্য প্রশিক্ষিত। এই প্রযুক্তি ব্যাকরণগত ত্রুটি, বানান ভুল এবং বাক্য গঠনে অসংগতি সনাক্ত করে এবং তা সংশোধনের জন্য সঠিক পরামর্শ দেয়।
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold text-gray-800 mb-2 flex items-center">
              <UserCircle className="h-7 w-7 mr-3 text-primary" /> ডেভেলপার পরিচিতি
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-gray-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="https://m.media-amazon.com/images/S/amzn-author-media-prod/b02mvc2hucu96hchlksdjmogii._SY450_CR0%2C0%2C450%2C450_.jpg"
                  alt="মোহাম্মদ শেখ শাহিনুর রহমান"
                  width={180}
                  height={180}
                  className="rounded-lg shadow-md border-2 border-primary/30"
                  data-ai-hint="portrait person"
                />
              </div>
              <div className="text-center md:text-left flex-grow">
                <h3 className="font-headline text-2xl font-bold text-gray-800">মোহাম্মদ শেখ শাহিনুর রহমান</h3>
                <p className="text-primary font-semibold mt-1">
                  কবি • লেখক • সফটওয়্যার ইঞ্জিনিয়ার • প্রোগ্রামার • ডিজিটাল ফরেনসিক বিশেষজ্ঞ • প্রযুক্তি উদ্ভাবক
                </p>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  মোহাম্মদ শেখ শাহিনুর রহমান একজন বহুমাত্রিক প্রতিভার অধিকারী ব্যক্তিত্ব, যিনি একাধারে সাহিত্য ও প্রযুক্তির বিভিন্ন শাখায় অবদান রেখে চলেছেন। তার উদ্ভাবনী ক্ষমতা এবং সৃষ্টিশীল কাজের মাধ্যমে তিনি বাংলা ভাষা ও প্রযুক্তিকে সমৃদ্ধ করার প্রয়াসে নিয়োজিত।
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-1 flex items-center justify-center md:justify-start">
                    <LinkIcon className="h-5 w-5 mr-2 text-primary/80" /> আরও জানুন:
                  </h4>
                  <ul className="space-y-1 text-primary">
                    <li>
                      <a href="https://mohammad-sheikh-shahinur-rahman.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary/80 transition-colors duration-200">
                        ব্যক্তিগত ওয়েবসাইট (mohammad-sheikh-shahinur-rahman.vercel.app)
                      </a>
                    </li>
                    <li>
                      <a href="https://shahinur.amadersomaj.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary/80 transition-colors duration-200">
                        আমাদের সমাজ (shahinur.amadersomaj.com)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold text-gray-800 mb-1 flex items-center">
              <Gift className="h-7 w-7 mr-3 text-primary" /> সকলের জন্য বিনামূল্যে
            </CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              এই অ্যাপ্লিকেশনটি, <span className="font-semibold text-primary">শুদ্ধ AI প্রুফরিডার</span>, মোহাম্মদ শেখ শাহিনুর রহমান কর্তৃক তৈরি করা হয়েছে এবং এটি শিক্ষার্থী, লেখক, গবেষক এবং বাংলা ভাষা ব্যবহারকারী সকলের জন্য সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য। আমাদের লক্ষ্য, ভাষার শুদ্ধতা চর্চায় সকলকে উৎসাহিত করা।
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
             <CardTitle className="font-headline text-2xl font-semibold text-gray-800 mb-2">যোগাযোগ</CardTitle>
          </CardHeader>
          <CardContent className="font-body text-base sm:text-lg text-gray-700">
            <p>
              আপনার যেকোনো প্রশ্ন বা মতামতের জন্য, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার মূল্যবান মতামত গুরুত্বের সাথে বিবেচনা করি।
            </p>
            <p className="mt-2">
              ইমেইল: <a href="mailto:contact@shuddho.ai" className="text-primary hover:underline">contact@shuddho.ai</a>
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="text-center mt-12">
        <Button asChild variant="outline" size="lg">
          <Link href="/">হোমপেজে ফিরে যান</Link>
        </Button>
      </div>

       <footer className="text-center mt-16 py-8 border-t border-border">
        <p className="text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার (মোহাম্মদ শেখ শাহিনুর রহমান কর্তৃক তৈরি)। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
