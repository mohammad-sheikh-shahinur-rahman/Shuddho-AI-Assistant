
"use client";

import { useState, useEffect, useRef, useActionState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  AnalyzeTextFormState, 
  handleAnalyzeText,
  type AnalyzeTextOutput
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Sparkles, FileText, Trash2, ScanText, MessageSquare, Type, Rows, Smile, Frown, Meh, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  text: z.string().optional(), 
  file: z.custom<FileList>((val) => val instanceof FileList, "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।").optional(),
}).refine(data => !!data.text || (data.file && data.file.length > 0), {
  message: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
  path: ["text"], 
});


function SubmitButton({ className, isPending }: { className?: string; isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground", className)}>
      {isPending ? "বিশ্লেষণ হচ্ছে..." : "বিশ্লেষণ করুন"}
      {!isPending && <Sparkles className="ml-2 h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}

const sentimentToIcon = (sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
        case 'positive': return <Smile className="h-5 w-5 text-green-500" strokeWidth={1.5} />;
        case 'negative': return <Frown className="h-5 w-5 text-red-500" strokeWidth={1.5} />;
        case 'neutral': return <Meh className="h-5 w-5 text-yellow-500" strokeWidth={1.5} />;
        case 'mixed': return <Info className="h-5 w-5 text-blue-500" strokeWidth={1.5} />;
        default: return null;
    }
};

const sentimentToBengali = (sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
        case 'positive': return 'ইতিবাচক';
        case 'negative': return 'নেতিবাচক';
        case 'neutral': return 'নিরপেক্ষ';
        case 'mixed': return 'মিশ্র';
        default: return 'অজানা';
    }
}


export function BanglaAnalyzerForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileReadingProgress, setFileReadingProgress] = useState<number | null>(null);
  
  const initialFormState: AnalyzeTextFormState = { 
    message: "", error: undefined, result: undefined, originalTextSource: undefined 
  };
  const [analysisFormState, analysisFormAction, isAnalysisPending] = useActionState<AnalyzeTextFormState, FormData>(
    handleAnalyzeText,
    initialFormState
  );
  const [, startTransition] = useTransition();

  const analysisForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const [analysisResult, setAnalysisResult] = useState<AnalyzeTextOutput | undefined>(undefined);
  const [processedSourceText, setProcessedSourceText] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (analysisFormState.message && analysisFormState.result) { 
      toast({
        title: "সফল",
        description: analysisFormState.message,
        action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
      });
    }
    if (analysisFormState.result) {
      setAnalysisResult(analysisFormState.result);
      if(analysisFormState.originalTextSource) {
        setProcessedSourceText(analysisFormState.originalTextSource);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFileName(null);
      setFileReadingProgress(null);
      analysisForm.reset({ text: "" }); 
    } else { 
        setAnalysisResult(undefined);
        if (!analysisFormState.error) { 
            setProcessedSourceText(undefined);
        }
    }

    if (analysisFormState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: analysisFormState.error,
      });
      setAnalysisResult(undefined);
      setProcessedSourceText(undefined); 
    }
  }, [analysisFormState, toast, analysisForm]);
  
  const onRHFSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    if (data.text) {
      formData.append("text", data.text);
    }
    
    if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      formData.append("file", fileInputRef.current.files[0]);
    } else if (!data.text) {
      analysisForm.setError("root", { message: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।"});
      toast({
        variant: "destructive",
        title: "ইনপুট প্রয়োজন",
        description: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
      });
      return; 
    }
    
    setAnalysisResult(undefined);
    setProcessedSourceText(undefined);
    setFileReadingProgress(null);
    
    startTransition(() => {
      analysisFormAction(formData);
    });
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFileName(file.name);
      setFileReadingProgress(1); 

      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFileReadingProgress(progress);
        }
      };
      reader.onload = () => {
        setFileReadingProgress(100);
        setTimeout(() => setFileReadingProgress(null), 1500); 
      };
      reader.onerror = () => {
        setFileReadingProgress(null);
        toast({
          variant: "destructive",
          title: "ফাইল পড়তে সমস্যা",
          description: "ফাইলটি পড়া সম্ভব হচ্ছে না। অন্য ফাইল চেষ্টা করুন।",
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
        setSelectedFileName(null);
      };
      reader.readAsArrayBuffer(file);
      
      analysisForm.setValue("text", ""); 
      analysisForm.clearErrors("text"); 
      analysisForm.clearErrors("root");
    } else {
      setSelectedFileName(null);
      setFileReadingProgress(null);
    }
  };

  const handleClearInputs = () => {
    analysisForm.reset({ text: "", file: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setSelectedFileName(null);
    setFileReadingProgress(null);
    analysisForm.clearErrors(); 
    setAnalysisResult(undefined);
    setProcessedSourceText(undefined);
    
    toast({ 
        title: "ইনপুট মুছে ফেলা হয়েছে", 
        description: "টেক্সটবক্স এবং ফাইল ইনপুট পরিষ্কার করা হয়েছে। ফলাফলও মুছে ফেলা হয়েছে।" 
    });
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <ScanText className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
            বিশ্লেষণের জন্য টেক্সট দিন
          </CardTitle>
          <CardDescription className="font-body">
            এখানে আপনার বাংলা লেখা টাইপ করুন বা একটি DOCX, PDF, অথবা TXT ফাইল আপলোড করে তার বিশ্লেষণ পান।
          </CardDescription>
        </CardHeader>
        <form onSubmit={analysisForm.handleSubmit(onRHFSubmit)} className="space-y-6">
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analyze-text-input" className="font-body">আপনার লেখা (যদি ফাইল আপলোড না করেন)</Label>
              <Textarea
                id="analyze-text-input"
                {...analysisForm.register("text")}
                placeholder="এখানে আপনার বাংলা লেখা লিখুন যার বিশ্লেষণ করতে চান..."
                className="min-h-[150px] font-body text-base border-input focus:ring-primary"
                rows={10}
                disabled={!!selectedFileName || isAnalysisPending} 
              />
              {analysisForm.formState.errors.text && !selectedFileName && ( 
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {analysisForm.formState.errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-center font-body text-sm text-muted-foreground my-2">অথবা</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="analyze-file-upload" className="font-body">ফাইল আপলোড করুন (.docx, .pdf, .txt)</Label>
              <div className="flex items-center space-x-2">
                <Controller
                    name="file"
                    control={analysisForm.control}
                    render={({ field: { onChange, onBlur, name, ref } }) => ( 
                        <Input
                            id="analyze-file-upload"
                            type="file"
                            accept=".docx,.pdf,.txt"
                            className="font-body border-input focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            ref={fileInputRef} 
                            name={name}
                            onBlur={onBlur}
                            onChange={(e) => {
                                onChange(e.target.files); 
                                handleFileChange(e); 
                            }}
                            disabled={isAnalysisPending}
                        />
                    )}
                />
              </div>
              {selectedFileName && fileReadingProgress !== null && (
                <div className="mt-2 space-y-1">
                  <Label htmlFor="file-read-progress-analyzer" className="text-sm font-body text-muted-foreground">ফাইল লোড হচ্ছে: {selectedFileName}</Label>
                  <Progress id="file-read-progress-analyzer" value={fileReadingProgress} className="w-full h-3 [&>div]:bg-primary" />
                </div>
              )}
              {selectedFileName && fileReadingProgress === null && !isAnalysisPending && (
                 <p className="text-sm text-muted-foreground font-body flex items-center mt-1">
                    <FileText className="mr-2 h-4 w-4 text-primary" strokeWidth={1.5} /> ফাইল প্রস্তুত: {selectedFileName}
                 </p>
              )}
               {analysisForm.formState.errors.file && (
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {analysisForm.formState.errors.file.message}
                </p>
              )}
               {analysisForm.formState.errors.root && ( 
                <p className="text-sm text-destructive font-body flex items-center mt-2">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {analysisForm.formState.errors.root.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearInputs}
                className="w-full sm:w-auto"
                disabled={isAnalysisPending}
            >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                ইনপুট ও ফলাফল মুছুন
            </Button>
            <SubmitButton className="w-full sm:w-auto" isPending={isAnalysisPending} />
          </CardFooter>
        </form>
      </Card>

      { (analysisResult || analysisFormState.error || processedSourceText) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Sparkles className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
              বিশ্লেষণের ফলাফল
            </CardTitle>
            {processedSourceText && (
              <CardDescription className="font-body text-sm text-muted-foreground">
                {processedSourceText}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {analysisFormState.error && ( 
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{analysisFormState.error}</p>
                </div>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-4 font-body">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-input">
                  <div className="flex items-center">
                    <MessageSquare className="mr-3 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-foreground">শব্দ সংখ্যা:</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{analysisResult.wordCount.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-input">
                  <div className="flex items-center">
                    <Type className="mr-3 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-foreground">অক্ষর সংখ্যা (স্পেস সহ):</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{analysisResult.characterCount.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-input">
                  <div className="flex items-center">
                    <Rows className="mr-3 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-foreground">বাক্য সংখ্যা:</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{analysisResult.sentenceCount.toLocaleString('bn-BD')}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-md border border-input space-y-1">
                  <div className="flex items-center">
                    {sentimentToIcon(analysisResult.sentiment)}
                    <span className="text-sm text-foreground ml-2">সামগ্রিক অনুভূতি:</span>
                    <span className="text-sm font-semibold text-primary ml-1">{sentimentToBengali(analysisResult.sentiment)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">{analysisResult.sentimentExplanation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
