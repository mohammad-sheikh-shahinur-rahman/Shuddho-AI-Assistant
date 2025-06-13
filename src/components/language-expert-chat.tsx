
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessageToLanguageExpert, type LanguageExpertChatState, type ChatMessage } from "@/app/actions";
import { Bot, User, CornerDownLeft, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="icon">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5}/> : <CornerDownLeft className="h-4 w-4" strokeWidth={1.5} />}
      <span className="sr-only">বার্তা পাঠান</span>
    </Button>
  );
}

export function LanguageExpertChat() {
  const initialState: LanguageExpertChatState = {
    messages: [
      { id: "initial-greeting", role: "system", content: "আমি ভাষাবিদ, আপনার বাংলা ভাষা বিশেষজ্ঞ। আপনার যেকোনো প্রশ্ন জিজ্ঞাসা করতে পারেন।" }
    ],
  };
  const [state, formAction, isPending] = useActionState(sendMessageToLanguageExpert, initialState);
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() && !isPending) return;
    
    const formData = new FormData(event.currentTarget);
    formAction(formData);
    setInput(""); // Clear input after sending
  };
  
  const displayedMessages = state.messages.filter(msg => msg.role !== 'system' || msg.id === 'initial-greeting');


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-2xl flex items-center text-primary">
          <Bot className="mr-3 h-7 w-7" strokeWidth={1.5} />
          ভাষাবিদ চ্যাট
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border p-4 space-y-4 bg-muted/20">
          {displayedMessages.map((message, index) => (
            <div
              key={message.id || index}
              className={cn(
                "flex items-end gap-2 p-2 rounded-lg max-w-[85%] clear-both",
                message.role === "user" ? "ml-auto bg-primary/80 text-primary-foreground" : "mr-auto bg-background text-foreground border",
                message.role === "system" && "mx-auto bg-accent/50 text-accent-foreground text-sm italic text-center max-w-full"
              )}
            >
              {message.role === "model" && <Bot className="h-6 w-6 text-primary self-start flex-shrink-0" strokeWidth={1.5} />}
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.role === "user" && <User className="h-6 w-6 self-start flex-shrink-0" strokeWidth={1.5} />}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        {state.error && (
          <div className="text-destructive font-body p-3 border border-destructive bg-destructive/10 rounded-md flex items-center text-sm">
            <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
            {state.error}
          </div>
        )}
         <form ref={formRef} onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-2">
            <Input
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ভাষাবিদকে কিছু জিজ্ঞাসা করুন..."
                className="flex-grow font-body text-base focus:ring-primary"
                disabled={isPending}
                autoComplete="off"
            />
            <SubmitButton />
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground font-body text-center w-full">
          ভাষাবিদ একটি AI সহযোগী এবং এর উত্তর সবসময় পুরোপুরি সঠিক নাও হতে পারে। গুরুত্বপূর্ণ তথ্যের জন্য যাচাই করে নিন।
        </p>
      </CardFooter>
    </Card>
  );
}
