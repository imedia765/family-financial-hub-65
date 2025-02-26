
import { Card } from "@/components/ui/card";
import { MemberWithRelations } from "@/types/member";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PaymentHistoryCardProps {
  memberData: MemberWithRelations | null;
  isLoading?: boolean;
}

export function PaymentHistoryCard({ memberData, isLoading }: PaymentHistoryCardProps) {
  const { toast } = useToast();
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const payments = memberData?.payment_requests || [];

  const downloadReceipt = async (paymentId: string) => {
    try {
      setDownloadingReceipt(paymentId);
      // TODO: Implement actual receipt download logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      toast({
        title: "Receipt downloaded",
        description: "Your payment receipt has been downloaded successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download receipt. Please try again."
      });
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const getStatusStyle = (status: string | null) => {
    if (!status) return 'bg-gray-500/20 text-gray-500';
    
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Payment History</h2>
      </div>
      {payments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No payment history available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Payment #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.created_at ? format(new Date(payment.created_at), 'dd MMM yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>{payment.payment_number || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{payment.payment_type}</TableCell>
                  <TableCell>£{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(payment.status)}`}>
                      {payment.status || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReceipt(payment.id)}
                        disabled={downloadingReceipt === payment.id}
                        className="h-8 w-8"
                      >
                        {downloadingReceipt === payment.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
