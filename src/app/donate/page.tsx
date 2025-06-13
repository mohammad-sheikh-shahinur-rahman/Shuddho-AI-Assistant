
import { Gift, Heart, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { DonatePageClient } from './donate-client';


export default function DonatePage() {
  const paymentNumber = "01959678229";

  return (
    <>
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-3xl">
        <header className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Gift className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-foreground">
            আমাদের সহযোগিতা করুন
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
            আপনার উদারতা আমাদের এই প্রচেষ্টা কে আরও সামনে এগিয়ে নিয়ে যেতে এবং বাংলা ভাষার উন্নয়নে সাহায্য করবে।
          </p>
        </header>

        <section className="space-y-8">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-primary/30">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-3xl font-semibold mb-2 flex items-center text-primary">
                <Heart className="h-8 w-8 mr-3 text-primary animate-pulse" strokeWidth={1.5} /> অনুদান পাঠান
              </CardTitle>
              <CardDescription className="font-body text-base sm:text-lg text-card-foreground leading-relaxed">
                শুদ্ধ AI প্রুফরিডার একটি অবাণিজ্যিক উদ্যোগ। এই প্ল্যাটফর্মটিকে সচল রাখতে এবং নতুন ফিচার যুক্ত করতে আপনার সহযোগিতা একান্ত কাম্য। আপনার সামান্য অনুদান আমাদের জন্য অনেক মূল্যবান।
              </CardDescription>
            </CardHeader>
            <CardContent className="font-body text-base sm:text-lg text-card-foreground">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="text-xl font-semibold text-foreground mb-3">বিকাশ (পার্সোনাল) নম্বরে পেমেন্ট করুন:</h3>
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-background rounded-md shadow">
                  <p className="text-2xl font-code font-bold text-primary tracking-wider">
                    {paymentNumber}
                  </p>
                  <DonatePageClient paymentNumber={paymentNumber} />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  উপরের বিকাশ পার্সোনাল নম্বরে যেকোনো পরিমাণ অর্থ "সেন্ড মানি" করার মাধ্যমে আপনি আমাদের সহযোগিতা করতে পারেন। আপনার অনুদানের জন্য আমরা কৃতজ্ঞ।
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-muted-foreground font-body">
                    অনুদান সংক্রান্ত যেকোনো জিজ্ঞাসার জন্য, আমাদের সাথে যোগাযোগ করুন: <a href="mailto:donate@shuddho.ai" className="text-primary hover:underline">donate@shuddho.ai</a>
                </p>
              </div>
            </CardContent>
             <CardFooter className="flex-col items-start pt-4">
                <h4 className="font-semibold text-foreground mb-2">কেন অনুদান করবেন?</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm font-body">
                    <li>এই প্ল্যাটফর্মের সার্ভার এবং রক্ষণাবেক্ষণ খরচ বহন করতে।</li>
                    <li>বাংলা ভাষার জন্য আরও উন্নত AI মডেল তৈরি ও প্রশিক্ষণে।</li>
                    <li>নতুন এবং উদ্ভাবনী ফিচার যুক্ত করতে।</li>
                    <li>সকলের জন্য এই সেবাটি বিনামূল্যে সচল রাখতে।</li>
                </ul>
            </CardFooter>
          </Card>
        </section>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} /> হোমপেজে ফিরে যান
            </Link>
          </Button>
        </div>

        <footer className="text-center mt-16 py-8 border-t border-border">
          <p className="text-sm text-muted-foreground font-body">
            &copy; {new Date().getFullYear()} শুদ্ধ AI প্রুফরিডার। আপনার সহযোগিতার জন্য ধন্যবাদ।
          </p>
        </footer>
      </main>
      <Toaster />
    </>
  );
}
