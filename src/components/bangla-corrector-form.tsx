
"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { CorrectTextFormState, handleCorrectText } from "@/app/actions";
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
import { Copy, Briefcase, Smile, Feather, AlertCircle, CheckCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  text: z.string().min(1, { message: "অনুগ্রহ করে কিছু টেক্সট লিখুন।" }),
  tone: z.enum(["Formal", "Friendly", "Poetic"], {
    required_error: "অনুগ্রহ করে একটি টোন নির্বাচন করুন।",
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? "লোড হচ্ছে..." : "শুদ্ধ করুন"}
      {!pending && <Sparkles className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export function BanglaCorrectorForm() {
  const { toast } = useToast();
  const [formState, formAction] = useFormState<CorrectTextFormState, FormData>(
    handleCorrectText,
    { message: "", error: undefined, result: undefined }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      tone: "Friendly",
    },
  });

  const [correctedText, setCorrectedText] = useState<string | undefined>(undefined);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (formState.result) {
      setCorrectedText(formState.result.correctedText);
      setExplanation(formState.result.explanation);
      setQualityScore(formState.result.qualityScore);
      form.reset({ text: formState.result.correctedText, tone: form.getValues("tone")}); // Optionally clear or update input text
    }
    if (formState.error) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: formState.error,
      });
      setCorrectedText(undefined);
      setExplanation(undefined);
      setQualityScore(undefined);
    }
  }, [formState, form, toast]);

  const handleCopyToClipboard = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "কপি হয়েছে",
        description: "সংশোধিত লেখা ক্লিপবোর্ডে কপি করা হয়েছে।",
        action: <CheckCircle className="text-green-500" />,
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">আপনার লেখা ইনপুট করুন</CardTitle>
          <CardDescription className="font-body">
            নিচের বাক্সে আপনার বাংলা লেখা লিখুন এবং একটি টোন নির্বাচন করুন।
          </CardDescription>
        </CardHeader>
        <form action={formAction} onSubmit={form.handleSubmit(() => {})} className="space-y-6">
           <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text" className="font-body">আপনার লেখা</Label>
              <Textarea
                id="text"
                {...form.register("text")}
                placeholder="এখানে আপনার বাংলা লেখা লিখুন..."
                className="min-h-[150px] font-body text-base border-input focus:ring-primary"
                rows={6}
              />
              {form.formState.errors.text && (
                <p className="text-sm text-destructive font-body flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> {form.formState.errors.text.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone" className="font-body">লেখার ধরণ</Label>
              <Controller
                name="tone"
                control={form.control}
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
              {form.formState.errors.tone && (
                <p className="text-sm text-destructive font-body flex items-center">
                   <AlertCircle className="mr-1 h-4 w-4" /> {form.formState.errors.tone.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      { (formState.result || formState.error) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">ফলাফল</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formState.error && !formState.result && (
              <div className="text-destructive font-body p-4 border border-destructive bg-destructive/10 rounded-md flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">একটি সমস্যা হয়েছে</h3>
                  <p>{formState.error}</p>
                </div>
              </div>
            )}
            {correctedText && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="correctedText" className="font-body text-lg">সংশোধিত লেখা</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(correctedText)}
                    className="text-accent-foreground hover:bg-accent/80"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    কপি করুন
                  </Button>
                </div>
                <Textarea
                  id="correctedText"
                  value={correctedText}
                  readOnly
                  className="min-h-[150px] font-body text-base bg-muted/30 border-input"
                  rows={6}
                />
              </div>
            )}
            {explanation && (
              <div className="space-y-2">
                <Label className="font-body text-lg flex items-center"><Info className="mr-2 h-5 w-5 text-accent-foreground" /> ব্যাখ্যা</Label>
                <div className="p-4 rounded-md bg-muted/30 border border-input font-body text-sm">
                  {explanation.split('\n').map((line, index) => (
                    <p key={index} className={cn(line.match(/^\d+\./) ? "mt-1" : "")}>{line}</p>
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
    </div>
  );
}
