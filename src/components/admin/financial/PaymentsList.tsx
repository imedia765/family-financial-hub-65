import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileDown, Check, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import type { Payment } from "./types";

interface PaymentsListProps {
  paymentsData: Payment[];
  loadingPayments: boolean;
  handleExport: (type: 'excel' | 'csv' | 'all') => void;
  handleApprove: (paymentId: string) => void;
  handleDelete: (paymentId: string) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDelete: () => void;
}

export function PaymentsList({
  paymentsData,
  loadingPayments,
  handleExport,
  handleApprove,
  handleDelete,
  showDeleteDialog,
  setShowDeleteDialog,
  confirmDelete
}: PaymentsListProps) {
  const [openCollectors, setOpenCollectors] = useState<string[]>([]);

  console.log('Initial paymentsData:', paymentsData);

  const toggleCollector = (collectorId: string) => {
    setOpenCollectors(prev => 
      prev.includes(collectorId) 
        ? prev.filter(id => id !== collectorId)
        : [...prev, collectorId]
    );
  };

  // Group payments by collector
  const paymentsByCollector = paymentsData.reduce((acc: Record<string, any>, payment: Payment) => {
    if (!payment.members_collectors?.id || !payment.members_collectors?.name) {
      console.log('Skipping payment due to missing collector info:', payment);
      return acc;
    }

    const collectorId = payment.members_collectors.id;
    const collectorName = payment.members_collectors.name;

    if (!acc[collectorId]) {
      acc[collectorId] = {
        id: collectorId,
        name: collectorName,
        payments: [],
        totalAmount: 0,
        approvedCount: 0,
        pendingCount: 0
      };
    }

    acc[collectorId].payments.push(payment);
    acc[collectorId].totalAmount += payment.amount || 0;
    acc[collectorId].approvedCount += payment.status === 'approved' ? 1 : 0;
    acc[collectorId].pendingCount += payment.status === 'pending' ? 1 : 0;

    return acc;
  }, {});

  const sortedCollectors = Object.values(paymentsByCollector)
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  console.log('Grouped Payments:', paymentsByCollector);
  console.log('Sorted Collectors:', sortedCollectors);

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gradient">Payment Records by Collector</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => handleExport('excel')}
            className="bg-emerald-600/20 hover:bg-emerald-600/30"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExport('csv')}
            className="bg-blue-600/20 hover:bg-blue-600/30"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {loadingPayments ? (
        <p>Loading payments...</p>
      ) : paymentsData.length === 0 ? (
        <p className="text-center text-muted-foreground">No payments found</p>
      ) : sortedCollectors.length === 0 ? (
        <p className="text-center text-muted-foreground">No collectors with payments found</p>
      ) : (
        <div className="space-y-4">
          {sortedCollectors.map((collector: any) => (
            <Collapsible
              key={collector.id}
              open={openCollectors.includes(collector.id)}
              onOpenChange={() => toggleCollector(collector.id)}
              className="border rounded-lg p-4"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  {openCollectors.includes(collector.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{collector.name}</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total: £{collector.totalAmount.toFixed(2)}</span>
                  <span>Approved: {collector.approvedCount}</span>
                  <span>Pending: {collector.pendingCount}</span>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collector.payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.payment_number}</TableCell>
                        <TableCell>{payment.members?.full_name}</TableCell>
                        <TableCell>£{payment.amount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded ${
                            payment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {payment.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(payment.id)}
                                className="h-8 w-8 bg-green-500/20 hover:bg-green-500/30"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(payment.id)}
                              className="h-8 w-8 bg-red-500/20 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}