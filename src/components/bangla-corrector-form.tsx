
"use client";

import { useState, useEffect, useRef, useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  CorrectTextFormState, 
  handleCorrectText,
  AdjustToneFormState,
  handleAdjustTone
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Copy, Briefcase, Smile, Feather, AlertCircle, CheckCircle, Info, Sparkles, Palette, FileText, DownloadCloud, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  text: z.string().optional(), // Text is now optional if a file is provided
  tone: z.enum(["Formal", "Friendly", "Poetic"], {
    required_error: "অনুগ্রহ করে একটি টোন নির্বাচন করুন।",
  }),
  file: z.custom<FileList>((val) => val instanceof FileList, "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।").optional(),
});


const adjustToneFormSchema = z.object({
  newTone: z.enum(["Formal", "Friendly", "Poetic"], {
    required_error: "অনুগ্রহ করে একটি নতুন টোন নির্বাচন করুন।",
  }),
});


type ToneOption = {
  value: "Formal" | "Friendly" | "Poetic";
  label: string;
  icon: React.ElementType;
};

const toneOptions: ToneOption[] = [
  { value: "Formal", label: "আনুষ্ঠানিক", icon: Briefcase },
  { value: "Friendly", label: "বন্ধুত্বপূর্ণ", icon: Smile },
  { value: "Poetic", label: "কাব্যিক", icon: Feather },
];

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={cn("w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground", className)}>
      {pending ? "লোড হচ্ছে..." : "শুদ্ধ করুন"}
      {!pending && <Sparkles className="ml-2 h-4 w-4" />}
    </Button>
  );
}

function AdjustToneSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? "লোড হচ্ছে..." : "টোন পরিবর্তন করুন"}
      {!pending && <Palette className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export function BanglaCorrectorForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const [correctionFormState, correctionFormAction] = useActionState<CorrectTextFormState, FormData>(
    handleCorrectText,
    { message: "", error: undefined, result: undefined, originalText: undefined }
  );

  const [adjustToneFormState, adjustToneFormAction] = useActionState<AdjustToneFormState, FormData>(
    handleAdjustTone,
    { message: "", error: undefined, result: undefined }
  );

  const [isSubmittingCorrection, startCorrectionTransition] = useTransition();
  const [isAdjustingTone, startToneAdjustmentTransition] = useTransition();


  const correctionForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      tone: "Friendly",
    },
  });

  const toneAdjustForm = useForm<z.infer<typeof adjustToneFormSchema>>({
    resolver: zodResolver(adjustToneFormSchema),
    defaultValues: {
      newTone: "Friendly",
    },
  });

  const [correctedText, setCorrectedText] = useState<string | undefined>(undefined);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined);
  const [toneAdjustedText, setToneAdjustedText] = useState<string | undefined>(undefined);
  const [processedSourceText, setProcessedSourceText] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (correctionFormState.message) {
      toast({
        title: "সফল",
        description: correctionFormState.message,
        action: <CheckCircle className="text-green-500" />,
      });
    }
    if (correctionFormState.result) {
      setCorrectedText(correctionFormState.result.correctedText);
      setExplanation(correctionFormState.result.explanation);
      setQualityScore(correctionFormState.result.qualityScore);
      setToneAdjustedText(undefined); 
      if(correctionFormState.originalText) {
        setProcessedSourceText(correctionFormState.originalText);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFileName(null);
      correctionForm.reset({ text: "", tone: correctionForm.getValues("tone") }); 
    }
    if (correctionFormState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: correctionFormState.error,
      });
      setCorrectedText(undefined);
      setExplanation(undefined);
      setQualityScore(undefined);
      setToneAdjustedText(undefined);
      setProcessedSourceText(undefined);
    }
  }, [correctionFormState, toast, correctionForm]);

  useEffect(() => {
    if (adjustToneFormState.result) {
      setToneAdjustedText(adjustToneFormState.result.adjustedText);
       toast({
        title: "টোন পরিবর্তিত হয়েছে",
        description: "আপনার লেখার টোন সফলভাবে পরিবর্তিত হয়েছে।",
        action: <CheckCircle className="text-green-500" />,
      });
    }
    if (adjustToneFormState.error) {
      toast({
        variant: "destructive",
        title: "টোন পরিবর্তনে ত্রুটি",
        description: adjustToneFormState.error,
      });
      setToneAdjustedText(undefined);
    }
  }, [adjustToneFormState, toast]);

  const handleCopyToClipboard = (text: string | undefined, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "কপি হয়েছে",
        description: `${type} ক্লিপবোর্ডে কপি করা হয়েছে।`,
        action: <CheckCircle className="text-green-500" />,
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
      action: <CheckCircle className="text-green-500" />,
    });
  };
  
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    if (data.text) {
      formData.append("text", data.text);
    }
    formData.append("tone", data.tone);
    
    if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      formData.append("file", fileInputRef.current.files[0]);
    } else if (!data.text) {
      toast({
        variant: "destructive",
        title: "ইনপুট প্রয়োজন",
        description: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
      });
      return; 
    }
    
    setCorrectedText(undefined);
    setExplanation(undefined);
    setQualityScore(undefined);
    setToneAdjustedText(undefined);
    setProcessedSourceText(undefined);

    startCorrectionTransition(() => {
      correctionFormAction(formData);
    });
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFileName(event.target.files[0].name);
      correctionForm.setValue("text", ""); 
      correctionForm.clearErrors("text"); 
    } else {
      setSelectedFileName(null);
    }
  };

  const handleClearInputs = () => {
    correctionForm.reset({ text: "", tone: correctionForm.getValues("tone"), file: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setSelectedFileName(null);
    correctionForm.clearErrors(); 
    toast({ 
        title: "ইনপুট মুছে ফেলা হয়েছে", 
        description: "টেক্সটবক্স এবং ফাইল ইনপুট পরিষ্কার করা হয়েছে।" 
    });
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">আপনার লেখা ইনপুট করুন</CardTitle>
          <CardDescription className="font-body">
            আপনার বাংলা লেখা, বইয়ের পাণ্ডুলিপি এখানে টাইপ করুন অথবা একটি DOCX, PDF, বা TXT ফাইল আপলোড করুন। দীর্ঘ লেখার জন্য TXT ফাইল ব্যবহার করা সুবিধাজনক। তারপর একটি টোন নির্বাচন করুন।
          </CardDescription>
        </CardHeader>
        <form onSubmit={correctionForm.handleSubmit(handleFormSubmit)} className="space-y-6">
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text" className="font-body">আপনার লেখা (যদি ফাইল আপলোড না করেন)</Label>
              <Textarea
                id="text"
                {...correctionForm.register("text")}
                placeholder="এখানে আপনার বাংলা লেখা লিখুন..."
                className="min-h-[150px] font-body text-base border-input focus:ring-primary"
                rows={10}
                disabled={!!selectedFileName} 
              />
              {correctionForm.formState.errors.text && !selectedFileName && ( 
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> {correctionForm.formState.errors.text.message}
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
                        />
                    )}
                />
              </div>
              {selectedFileName && (
                <p className="text-sm text-muted-foreground font-body flex items-center mt-1">
                  <FileText className="mr-2 h-4 w-4 text-primary" /> নির্বাচিত ফাইল: {selectedFileName}
                </p>
              )}
               {correctionForm.formState.errors.file && (
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> {correctionForm.formState.errors.file.message}
                </p>
              )}
            </div>


            <div className="space-y-2">
              <Label htmlFor="tone" className="font-body">লেখার ধরণ</Label>
              <Controller
                name="tone"
                control={correctionForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                    <SelectTrigger id="tone" className="w-full sm:w-[200px] font-body border-input focus:ring-primary">
                      <SelectValue placeholder="টোন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value} className="font-body">
                            <div className="flex items-center">
                              <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {correctionForm.formState.errors.tone && (
                <p className="text-sm text-destructive font-body flex items-center">
                   <AlertCircle className="mr-1 h-4 w-4" /> {correctionForm.formState.errors.tone.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearInputs}
                className="w-full sm:w-auto"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                ইনপুট মুছুন
            </Button>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      { (correctionFormState.result || correctionFormState.error || processedSourceText) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">ফলাফল</CardTitle>
            {processedSourceText && (
              <CardDescription className="font-body text-sm text-muted-foreground">
                {processedSourceText}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {correctionFormState.error && !correctionFormState.result && (
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{correctionFormState.error}</p>
                </div>
              </div>
            )}
            {correctedText && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="correctedText" className="font-body text-lg">সংশোধিত লেখা</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(correctedText, "সংশোধিত লেখা")}
                      className="text-accent-foreground hover:bg-accent/80"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      কপি করুন
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadText(correctedText, "সংশোধিত_লেখা")}
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        ডাউনলোড
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="correctedText"
                  value={correctedText}
                  readOnly
                  className="min-h-[150px] font-body text-base bg-muted/30 border-input"
                  rows={10}
                />
              </div>
            )}
            {explanation && (
              <div className="space-y-2">
                <Label className="font-body text-lg flex items-center"><Info className="mr-2 h-5 w-5 text-accent-foreground" /> ব্যাখ্যা</Label>
                <div className="p-4 rounded-md bg-muted/30 border border-input font-body text-sm whitespace-pre-line">
                  {explanation.split('\\n').map((line, index) => ( 
                    <p key={index} className={cn(line.match(/^\\d+\\./) ? "mt-1" : "")}>{line.replace(/^"|"$/g, '')}</p>
                  ))}
                </div>
              </div>
            )}
            {qualityScore !== undefined && (
              <div className="space-y-2">
                <Label className="font-body text-lg">মান স্কোর: <span className="font-bold text-primary">{qualityScore}/100</span></Label>
                <Progress value={qualityScore} className="w-full h-3 [&>div]:bg-primary" />
                 <p className="text-xs text-muted-foreground font-body">
                  এই স্কোরটি লেখার বর্তমান মান নির্দেশ করে।
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {correctedText && !toneAdjustedText && (
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Palette className="mr-2 h-6 w-6 text-accent-foreground" />
              সংশোধিত লেখার টোন পরিবর্তন করুন
            </CardTitle>
            <CardDescription className="font-body">
              আপনি যদি সংশোধিত লেখাটির টোন পরিবর্তন করতে চান, তবে নিচে থেকে নতুন টোন নির্বাচন করুন।
            </CardDescription>
          </CardHeader>
          <form 
            onSubmit={toneAdjustForm.handleSubmit((data) => {
                const formData = new FormData();
                formData.append("textToAdjust", correctedText); 
                formData.append("newTone", data.newTone);
                startToneAdjustmentTransition(() => {
                  adjustToneFormAction(formData);
                });
            })}
            className="space-y-6"
          >
            <CardContent className="space-y-4">
              <input type="hidden" name="textToAdjust" value={correctedText} />
              <div className="space-y-2">
                <Label htmlFor="newTone" className="font-body">নতুন টোন</Label>
                <Controller
                  name="newTone"
                  control={toneAdjustForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <SelectTrigger id="newTone" className="w-full sm:w-[200px] font-body border-input focus:ring-accent">
                        <SelectValue placeholder="নতুন টোন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value} className="font-body">
                              <div className="flex items-center">
                                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {toneAdjustForm.formState.errors.newTone && (
                  <p className="text-sm text-destructive font-body flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" /> {toneAdjustForm.formState.errors.newTone.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <AdjustToneSubmitButton />
            </CardFooter>
          </form>
        </Card>
      )}

      {toneAdjustedText && (
         <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl">টোন পরিবর্তিত লেখা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="toneAdjustedTextOutput" className="font-body text-lg"> চূড়ান্ত লেখা (টোন পরিবর্তিত)</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(toneAdjustedText, "টোন পরিবর্তিত লেখা")}
                      className="text-accent-foreground hover:bg-accent/80"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      কপি করুন
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadText(toneAdjustedText, "টোন_পরিবর্তিত_লেখা")}
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        ডাউনলোড
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="toneAdjustedTextOutput"
                  value={toneAdjustedText}
                  readOnly
                  className="min-h-[150px] font-body text-base bg-muted/30 border-input"
                  rows={10}
                />
              </div>
              <Button variant="outline" onClick={() => {
                setToneAdjustedText(undefined); 
                toneAdjustForm.reset(); 
              }}>
                অন্য টোন চেষ্টা করুন
              </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
