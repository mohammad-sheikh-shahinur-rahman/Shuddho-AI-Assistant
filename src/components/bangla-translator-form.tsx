
"use client";

import { useState, useEffect, useActionState, useTransition, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  TranslateTextFormState, 
  handleTranslateText,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, AlertCircle, CheckCircle, Sparkles, DownloadCloud, Trash2, Languages, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const formSchema = z.object({
  text: z.string().min(1, "অনুবাদ করার জন্য টেক্সট লিখুন।"),
  sourceLanguage: z.enum(['bn', 'en'], { required_error: "মূল ভাষা নির্বাচন করুন।"}),
  targetLanguage: z.enum(['bn', 'en'], { required_error: "লক্ষ্য ভাষা নির্বাচন করুন।"}),
}).refine(data => data.sourceLanguage !== data.targetLanguage, {
  message: "মূল এবং লক্ষ্য ভাষা ভিন্ন হতে হবে।",
  path: ["targetLanguage"], 
});


function SubmitButton({ className, isPending }: { className?: string; isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground", className)}>
      {isPending ? "অনুবাদ হচ্ছে..." : "অনুবাদ করুন"}
      {!isPending && <Sparkles className="ml-2 h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}

export function BanglaTranslatorForm() {
  const { toast } = useToast();
  
  const initialFormState: TranslateTextFormState = { 
    message: "", error: undefined, result: undefined, originalTextSnippet: undefined 
  };
  const [translateFormState, translateFormAction, isTranslationPending] = useActionState<TranslateTextFormState, FormData>(
    handleTranslateText,
    initialFormState
  );
  const [, startTransition] = useTransition();

  const translationForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      sourceLanguage: "bn",
      targetLanguage: "en",
    },
  });

  const [translatedText, setTranslatedText] = useState<string | undefined>(undefined);
  const [processedSourceText, setProcessedSourceText] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (translateFormState.message && translateFormState.result) { 
      toast({
        title: "সফল",
        description: translateFormState.message,
        action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
      });
    }
    if (translateFormState.result) {
      setTranslatedText(translateFormState.result.translatedText);
      if(translateFormState.originalTextSnippet) {
        setProcessedSourceText(translateFormState.originalTextSnippet);
      }
      // Keep form values for potential re-translation or adjustments
    } else { 
        setTranslatedText(undefined);
        if (!translateFormState.error) { 
            setProcessedSourceText(undefined);
        }
    }

    if (translateFormState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: translateFormState.error,
      });
      setTranslatedText(undefined);
      // Don't clear original text snippet on error, so user knows what failed
      // setProcessedSourceText(undefined); 
    }
  }, [translateFormState, toast]);


  const handleCopyToClipboard = (text: string | undefined, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "কপি হয়েছে",
        description: `${type} ক্লিপবোর্ডে কপি করা হয়েছে।`,
        action: <CheckCircle className="text-green-500" strokeWidth={1.5} />,
      });
    }
  };

  const handleDownloadText = (text: string | undefined, baseFilename: string) => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "ডাউনলোড ত্রুটি",
        description: "ডাউনলোড করার জন্য কোনো লেখা নেই।",
      });
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().split('T')[0];
    link.download = `${baseFilename}_${dateStamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({
      title: "ডাউনলোড শুরু হয়েছে",
      description: `${link.download} ফাইলটি ডাউনলোড হচ্ছে।`,
      action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
    });
  };
  
  const onRHFSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("text", data.text);
    formData.append("sourceLanguage", data.sourceLanguage);
    formData.append("targetLanguage", data.targetLanguage);
    
    setTranslatedText(undefined); // Clear previous results
    setProcessedSourceText(undefined);

    startTransition(() => {
      translateFormAction(formData);
    });
  };

  const handleClearInputs = () => {
    translationForm.reset({ text: "", sourceLanguage: "bn", targetLanguage: "en" });
    setTranslatedText(undefined);
    setProcessedSourceText(undefined);
    translationForm.clearErrors();
    
    toast({ 
        title: "ইনপুট মুছে ফেলা হয়েছে", 
        description: "টেক্সটবক্স এবং ভাষা নির্বাচন পরিষ্কার করা হয়েছে। ফলাফলও মুছে ফেলা হয়েছে।" 
    });
  };

  const handleSwapLanguages = () => {
    const currentSource = translationForm.getValues("sourceLanguage");
    const currentTarget = translationForm.getValues("targetLanguage");
    translationForm.setValue("sourceLanguage", currentTarget);
    translationForm.setValue("targetLanguage", currentSource);
  };

  return (
    <div className="space-y-8">
      <Form {...translationForm}>
        <form onSubmit={translationForm.handleSubmit(onRHFSubmit)} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center">
                <Languages className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
                অনুবাদ করার জন্য টেক্সট
              </CardTitle>
              <CardDescription className="font-body">
                নিচের টেক্সটবক্সে আপনার লেখা পেস্ট করুন অথবা টাইপ করুন এবং মূল ও লক্ষ্য ভাষা নির্বাচন করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={translationForm.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="translate-text">আপনার লেখা</FormLabel>
                    <FormControl>
                      <Textarea
                        id="translate-text"
                        placeholder="এখানে আপনার লেখা লিখুন..."
                        className="min-h-[150px] font-body text-base border-input focus:ring-primary"
                        rows={10}
                        disabled={isTranslationPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-end">
                <div className="sm:col-span-5">
                  <FormField
                    control={translationForm.control}
                    name="sourceLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>মূল ভাষা</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslationPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bn">বাংলা</SelectItem>
                            <SelectItem value="en">ইংরেজি</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="sm:col-span-1 flex justify-center">
                  <Button type="button" variant="ghost" size="icon" onClick={handleSwapLanguages} disabled={isTranslationPending} aria-label="Swap languages">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                  </Button>
                </div>

                <div className="sm:col-span-5">
                  <FormField
                    control={translationForm.control}
                    name="targetLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>লক্ষ্য ভাষা</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslationPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bn">বাংলা</SelectItem>
                            <SelectItem value="en">ইংরেজি</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {translationForm.formState.errors.root && ( 
                <p className="text-sm text-destructive font-body flex items-center mt-2">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {translationForm.formState.errors.root.message}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClearInputs}
                  className="w-full sm:w-auto"
                  disabled={isTranslationPending}
              >
                  <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  ইনপুট ও ফলাফল মুছুন
              </Button>
              <SubmitButton className="w-full sm:w-auto" isPending={isTranslationPending} />
            </CardFooter>
          </Card>
        </form>
      </Form>

      { (translatedText || translateFormState.error || processedSourceText) && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Sparkles className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
              অনুবাদের ফলাফল
            </CardTitle>
            {processedSourceText && (
              <CardDescription className="font-body text-sm text-muted-foreground">
                {processedSourceText}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {translateFormState.error && ( 
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{translateFormState.error}</p>
                </div>
              </div>
            )}
            {translatedText && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label htmlFor="translatedOutputText" className="font-body text-lg">অনূদিত লেখা</Label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(translatedText, "অনূদিত লেখা")}
                      className="text-accent-foreground hover:bg-accent/80 w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      কপি করুন
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadText(translatedText, "অনূদিত_লেখা")}
                        className="w-full sm:w-auto"
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" strokeWidth={1.5} />
                        ডাউনলোড
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="translatedOutputText"
                  value={translatedText}
                  readOnly
                  className="min-h-[150px] font-body text-base bg-muted/30 border-input"
                  rows={10}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
