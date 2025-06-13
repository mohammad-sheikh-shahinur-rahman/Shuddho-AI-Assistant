
"use client";

import { useState, useEffect, useRef, useActionState, useTransition } from "react";
// Removed useFormStatus as useActionState handles pending state
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  CorrectTextFormState, 
  handleCorrectText,
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
import { Copy, AlertCircle, CheckCircle, Info, Sparkles, FileText, DownloadCloud, Trash2, MessageSquareQuote, FileSignature, Gauge } from "lucide-react";
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
      {isPending ? "লোড হচ্ছে..." : "শুদ্ধ করুন"}
      {!isPending && <Sparkles className="ml-2 h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}

export function BanglaCorrectorForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileReadingProgress, setFileReadingProgress] = useState<number | null>(null);
  
  const initialFormState: CorrectTextFormState = { 
    message: "", error: undefined, result: undefined, originalText: undefined 
  };
  const [correctionFormState, correctionFormAction, isCorrectionPending] = useActionState<CorrectTextFormState, FormData>(
    handleCorrectText,
    initialFormState
  );
  const [, startTransition] = useTransition();

  const correctionForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const [correctedText, setCorrectedText] = useState<string | undefined>(undefined);
  const [explanationOfCorrections, setExplanationOfCorrections] = useState<string | undefined>(undefined);
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined);
  const [explanationOfScore, setExplanationOfScore] = useState<string | undefined>(undefined);
  const [processedSourceText, setProcessedSourceText] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (correctionFormState.message && correctionFormState.result) { 
      toast({
        title: "সফল",
        description: correctionFormState.message,
        action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
      });
    }
    if (correctionFormState.result) {
      setCorrectedText(correctionFormState.result.correctedText);
      setExplanationOfCorrections(correctionFormState.result.explanationOfCorrections);
      setQualityScore(correctionFormState.result.qualityScore);
      setExplanationOfScore(correctionFormState.result.explanationOfScore);

      if(correctionFormState.originalText) {
        setProcessedSourceText(correctionFormState.originalText);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFileName(null);
      setFileReadingProgress(null);
      correctionForm.reset({ text: "" }); 
    } else { 
        setCorrectedText(undefined);
        setExplanationOfCorrections(undefined);
        setQualityScore(undefined);
        setExplanationOfScore(undefined);
        if (!correctionFormState.error) { 
            setProcessedSourceText(undefined);
        }
    }

    if (correctionFormState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: correctionFormState.error,
      });
      setCorrectedText(undefined);
      setExplanationOfCorrections(undefined);
      setQualityScore(undefined);
      setExplanationOfScore(undefined);
      setProcessedSourceText(undefined); 
    }
  }, [correctionFormState, toast, correctionForm]);


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
    if (data.text) {
      formData.append("text", data.text);
    }
    
    if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      formData.append("file", fileInputRef.current.files[0]);
    } else if (!data.text) {
      correctionForm.setError("root", { message: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।"});
      toast({
        variant: "destructive",
        title: "ইনপুট প্রয়োজন",
        description: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
      });
      return; 
    }
    
    setCorrectedText(undefined);
    setExplanationOfCorrections(undefined);
    setQualityScore(undefined);
    setExplanationOfScore(undefined);
    setProcessedSourceText(undefined);
    setFileReadingProgress(null);

    startTransition(() => {
      correctionFormAction(formData);
    });
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFileName(file.name);
      setFileReadingProgress(1); // Initialize progress to 1 for immediate visibility

      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFileReadingProgress(progress);
        }
      };
      reader.onload = () => {
        setFileReadingProgress(100);
        setTimeout(() => setFileReadingProgress(null), 1500); // Hide after 1.5s
      };
      reader.onerror = () => {
        setFileReadingProgress(null);
        toast({
          variant: "destructive",
          title: "ফাইল পড়তে সমস্যা",
          description: "ফাইলটি পড়া সম্ভব হচ্ছে না। অন্য ফাইল চেষ্টা করুন।",
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input on error
        }
        setSelectedFileName(null);
      };
      reader.readAsArrayBuffer(file);

      correctionForm.setValue("text", ""); 
      correctionForm.clearErrors("text"); 
      correctionForm.clearErrors("root");
    } else {
      setSelectedFileName(null);
      setFileReadingProgress(null);
    }
  };

  const handleClearInputs = () => {
    correctionForm.reset({ text: "", file: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setSelectedFileName(null);
    setFileReadingProgress(null);
    correctionForm.clearErrors(); 
    setCorrectedText(undefined);
    setExplanationOfCorrections(undefined);
    setQualityScore(undefined);
    setExplanationOfScore(undefined);
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
            <FileSignature className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
            আপনার লেখা ইনপুট করুন
          </CardTitle>
          <CardDescription className="font-body">
            আপনার বাংলা লেখা, বইয়ের পাণ্ডুলিপি এখানে টাইপ করুন অথবা একটি DOCX, PDF, বা TXT ফাইল আপলোড করুন। দীর্ঘ লেখার জন্য TXT ফাইল ব্যবহার করা সুবিধাজনক।
          </CardDescription>
        </CardHeader>
        <form onSubmit={correctionForm.handleSubmit(onRHFSubmit)} className="space-y-6">
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text" className="font-body">আপনার লেখা (যদি ফাইল আপলোড না করেন)</Label>
              <Textarea
                id="text"
                {...correctionForm.register("text")}
                placeholder="এখানে আপনার বাংলা লেখা লিখুন..."
                className="min-h-[200px] font-body text-base border-input focus:ring-primary"
                rows={15}
                disabled={!!selectedFileName || isCorrectionPending} 
              />
              {correctionForm.formState.errors.text && !selectedFileName && ( 
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {correctionForm.formState.errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-center font-body text-sm text-muted-foreground my-2">অথবা</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="font-body">ফাইল আপলোড করুন (.docx, .pdf, .txt)</Label>
              <div className="flex items-center space-x-2">
                <Controller
                    name="file"
                    control={correctionForm.control}
                    render={({ field: { onChange, onBlur, name, ref } }) => ( 
                        <Input
                            id="file-upload"
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
                            disabled={isCorrectionPending}
                        />
                    )}
                />
              </div>
              {selectedFileName && fileReadingProgress !== null && (
                <div className="mt-2 space-y-1">
                  <Label htmlFor="file-read-progress-corrector" className="text-sm font-body text-muted-foreground">ফাইল লোড হচ্ছে: {selectedFileName}</Label>
                  <Progress id="file-read-progress-corrector" value={fileReadingProgress} className="w-full h-3 [&>div]:bg-primary" />
                </div>
              )}
              {selectedFileName && fileReadingProgress === null && !isCorrectionPending && (
                 <p className="text-sm text-muted-foreground font-body flex items-center mt-1">
                    <FileText className="mr-2 h-4 w-4 text-primary" strokeWidth={1.5} /> ফাইল প্রস্তুত: {selectedFileName}
                 </p>
              )}
               {correctionForm.formState.errors.file && (
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {correctionForm.formState.errors.file.message}
                </p>
              )}
               {correctionForm.formState.errors.root && ( 
                <p className="text-sm text-destructive font-body flex items-center mt-2">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {correctionForm.formState.errors.root.message}
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
                disabled={isCorrectionPending}
            >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                ইনপুট ও ফলাফল মুছুন
            </Button>
            <SubmitButton className="w-full sm:w-auto" isPending={isCorrectionPending} />
          </CardFooter>
        </form>
      </Card>

      { (correctedText || explanationOfCorrections || qualityScore !== undefined || explanationOfScore || correctionFormState.error || processedSourceText) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Sparkles className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
              ফলাফল
            </CardTitle>
            {processedSourceText && (
              <CardDescription className="font-body text-sm text-muted-foreground">
                {processedSourceText}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {correctionFormState.error && ( 
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{correctionFormState.error}</p>
                </div>
              </div>
            )}
            {correctedText && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label htmlFor="correctedText" className="font-body text-lg">সংশোধিত লেখা</Label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(correctedText, "সংশোধিত লেখা")}
                      className="text-accent-foreground hover:bg-accent/80 w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      কপি করুন
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadText(correctedText, "সংশোধিত_লেখা")}
                        className="w-full sm:w-auto"
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" strokeWidth={1.5} />
                        ডাউনলোড
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="correctedText"
                  value={correctedText}
                  readOnly
                  className="min-h-[200px] font-body text-base bg-muted/30 border-input"
                  rows={15}
                />
              </div>
            )}
            {explanationOfCorrections && (
              <div className="space-y-2">
                <Label className="font-body text-lg flex items-center">
                  <Info className="mr-2 h-5 w-5 text-accent-foreground" strokeWidth={1.5} /> 
                  সংশোধনের ব্যাখ্যা
                </Label>
                <div className="p-4 rounded-md bg-muted/30 border border-input font-body text-sm whitespace-pre-line">
                  {explanationOfCorrections.split('\n').map((line, index) => ( 
                    <p key={index} className={cn(line.match(/^(\d+\.|-|\*)\s/) ? "mt-1" : "")}>{line.replace(/^"|"$/g, '')}</p>
                  ))}
                </div>
              </div>
            )}
            {qualityScore !== undefined && (
              <div className="space-y-2">
                <Label className="font-body text-lg flex items-center">
                  <Gauge className="mr-2 h-5 w-5 text-primary" strokeWidth={1.5} />
                  মান স্কোর: <span className="font-bold text-primary">{qualityScore}/100</span>
                </Label>
                <Progress value={qualityScore} className="w-full h-3 [&>div]:bg-primary" />
                 <p className="text-xs text-muted-foreground font-body">
                  এই স্কোরটি লেখার বর্তমান গুণমান নির্দেশ করে।
                </p>
              </div>
            )}
             {explanationOfScore && (
              <div className="space-y-2">
                <Label className="font-body text-lg flex items-center">
                  <MessageSquareQuote className="mr-2 h-5 w-5 text-accent-foreground" strokeWidth={1.5} /> 
                  স্কোরের ব্যাখ্যা
                </Label>
                <div className="p-4 rounded-md bg-muted/30 border border-input font-body text-sm whitespace-pre-line">
                  {explanationOfScore.split('\n').map((line, index) => ( 
                    <p key={index} className={cn(line.match(/^(\d+\.|-|\*)\s/) ? "mt-1" : "")}>{line.replace(/^"|"$/g, '')}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

