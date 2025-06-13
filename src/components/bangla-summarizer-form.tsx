
"use client";

import { useState, useEffect, useRef, useActionState, useTransition } from "react";
// useFormStatus is removed as SubmitButton will take isPending prop
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { 
  SummarizeTextFormState, 
  handleSummarizeText,
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
import { useToast } from "@/hooks/use-toast";
import { Copy, AlertCircle, CheckCircle, Sparkles, FileText, DownloadCloud, Trash2, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  text: z.string().optional(), 
  file: z.custom<FileList>((val) => val instanceof FileList, "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।").optional(),
}).refine(data => !!data.text || (data.file && data.file.length > 0), {
  message: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
  path: ["text"], 
});


function SubmitButton({ className, isPending }: { className?: string; isPending: boolean }) {
  // const { pending } = useFormStatus(); // Replaced with isPending prop
  return (
    <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground", className)}>
      {isPending ? "লোড হচ্ছে..." : "সারাংশ করুন"}
      {!isPending && <Sparkles className="ml-2 h-4 w-4" strokeWidth={1.5} />}
    </Button>
  );
}

export function BanglaSummarizerForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const initialFormState: SummarizeTextFormState = { 
    message: "", error: undefined, result: undefined, originalText: undefined 
  };
  const [summarizeFormState, summarizeFormAction, isSubmittingSummarization] = useActionState<SummarizeTextFormState, FormData>(
    handleSummarizeText,
    initialFormState
  );
  const [, startSummarizationTransition] = useTransition(); // For wrapping the action call

  const summarizationForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [processedSourceText, setProcessedSourceText] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (summarizeFormState.message && summarizeFormState.result) { 
      toast({
        title: "সফল",
        description: summarizeFormState.message,
        action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
      });
    }
    if (summarizeFormState.result) {
      setSummary(summarizeFormState.result.summary);
      if(summarizeFormState.originalText) {
        setProcessedSourceText(summarizeFormState.originalText);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFileName(null);
      summarizationForm.reset({ text: "" }); 
    } else { 
        setSummary(undefined);
        if (!summarizeFormState.error) { 
            setProcessedSourceText(undefined);
        }
    }

    if (summarizeFormState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: summarizeFormState.error,
      });
      setSummary(undefined);
      setProcessedSourceText(undefined); 
    }
  }, [summarizeFormState, toast, summarizationForm]);


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
  
  const handleFormSubmit = summarizationForm.handleSubmit(async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    if (data.text) {
      formData.append("text", data.text);
    }
    
    if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
      formData.append("file", fileInputRef.current.files[0]);
    } else if (!data.text) {
      summarizationForm.setError("root", { message: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।"});
      toast({
        variant: "destructive",
        title: "ইনপুট প্রয়োজন",
        description: "অনুগ্রহ করে টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।",
      });
      return; 
    }
    
    setSummary(undefined);
    setProcessedSourceText(undefined);
    startSummarizationTransition(() => {
      summarizeFormAction(formData);
    });
  });


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFileName(event.target.files[0].name);
      summarizationForm.setValue("text", ""); 
      summarizationForm.clearErrors("text"); 
      summarizationForm.clearErrors("root");
    } else {
      setSelectedFileName(null);
    }
  };

  const handleClearInputs = () => {
    summarizationForm.reset({ text: "", file: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setSelectedFileName(null);
    summarizationForm.clearErrors(); 
    setSummary(undefined);
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
            <ScrollText className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
            আপনার দীর্ঘ লেখা দিন
          </CardTitle>
          <CardDescription className="font-body">
            এখানে আপনার দীর্ঘ বাংলা লেখা টাইপ করুন বা একটি DOCX, PDF, অথবা TXT ফাইল আপলোড করে তার সারাংশ পান।
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleFormSubmit} className="space-y-6">
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summarize-text" className="font-body">আপনার লেখা (যদি ফাইল আপলোড না করেন)</Label>
              <Textarea
                id="summarize-text"
                {...summarizationForm.register("text")}
                placeholder="এখানে আপনার বাংলা লেখা লিখুন যার সারাংশ করতে চান..."
                className="min-h-[200px] font-body text-base border-input focus:ring-primary"
                rows={15}
                disabled={!!selectedFileName || isSubmittingSummarization} 
              />
              {summarizationForm.formState.errors.text && !selectedFileName && ( 
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {summarizationForm.formState.errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-center font-body text-sm text-muted-foreground my-2">অথবা</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summarize-file-upload" className="font-body">ফাইল আপলোড করুন (.docx, .pdf, .txt)</Label>
              <div className="flex items-center space-x-2">
                <Controller
                    name="file"
                    control={summarizationForm.control}
                    render={({ field: { onChange, onBlur, name, ref } }) => ( 
                        <Input
                            id="summarize-file-upload"
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
                            disabled={isSubmittingSummarization}
                        />
                    )}
                />
              </div>
              {selectedFileName && (
                <p className="text-sm text-muted-foreground font-body flex items-center mt-1">
                  <FileText className="mr-2 h-4 w-4 text-primary" strokeWidth={1.5} /> নির্বাচিত ফাইল: {selectedFileName}
                </p>
              )}
               {summarizationForm.formState.errors.file && (
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {summarizationForm.formState.errors.file.message}
                </p>
              )}
               {summarizationForm.formState.errors.root && ( 
                <p className="text-sm text-destructive font-body flex items-center mt-2">
                  <AlertCircle className="mr-1 h-4 w-4" strokeWidth={1.5} /> {summarizationForm.formState.errors.root.message}
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
                disabled={isSubmittingSummarization}
            >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                ইনপুট ও ফলাফল মুছুন
            </Button>
            <SubmitButton className="w-full sm:w-auto" isPending={isSubmittingSummarization} />
          </CardFooter>
        </form>
      </Card>

      { (summary || summarizeFormState.error || processedSourceText) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Sparkles className="mr-3 h-7 w-7 text-primary" strokeWidth={1.5} />
              সারাংশের ফলাফল
            </CardTitle>
            {processedSourceText && (
              <CardDescription className="font-body text-sm text-muted-foreground">
                {processedSourceText}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {summarizeFormState.error && ( 
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{summarizeFormState.error}</p>
                </div>
              </div>
            )}
            {summary && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label htmlFor="summaryText" className="font-body text-lg">সারাংশ</Label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(summary, "সারাংশ")}
                      className="text-accent-foreground hover:bg-accent/80 w-full sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      কপি করুন
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadText(summary, "সারাংশ_লেখা")}
                        className="w-full sm:w-auto"
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" strokeWidth={1.5} />
                        ডাউনলোড
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="summaryText"
                  value={summary}
                  readOnly
                  className="min-h-[200px] font-body text-base bg-muted/30 border-input"
                  rows={15}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

