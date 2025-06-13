
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'শুদ্ধ AI সহকারী',
  description: 'AI-powered Bangla text correction and enhancement tool.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This check runs on the server.
  const apiKeyMissing = !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY;

  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {apiKeyMissing && (
          <div className="container mx-auto px-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key প্রয়োজন</AlertTitle>
              <AlertDescription>
                অ্যাপ্লিকেশনের AI ফিচারগুলো ব্যবহার করার জন্য Google AI API কী প্রয়োজন। অনুগ্রহ করে আপনার প্রজেক্টের <code>.env</code> ফাইলে <code>GOOGLE_API_KEY=আপনার_API_কী</code> সেট করুন। আপনি Google AI Studio থেকে এই কী সংগ্রহ করতে পারেন। এটি সেট না করা থাকলে AI ফিচারগুলো সঠিকভাবে কাজ করবে না এবং এই ধরনের সার্ভার ত্রুটি দেখা দিতে পারে।
              </AlertDescription>
            </Alert>
          </div>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
