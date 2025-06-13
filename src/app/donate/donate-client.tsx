
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle } from "lucide-react";

interface DonatePageClientProps {
  paymentNumber: string;
}

export function DonatePageClient({ paymentNumber }: DonatePageClientProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(paymentNumber);
    toast({
      title: "নম্বর কপি হয়েছে",
      description: `বিকাশ নম্বর (${paymentNumber}) ক্লিপবোর্ডে কপি করা হয়েছে।`,
      action: <CheckCircle className="text-green-500" strokeWidth={1.5}/>,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopyToClipboard}
      className="mt-2 sm:mt-0 sm:ml-4"
    >
      <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} />
      নম্বর কপি করুন
    </Button>
  );
}
