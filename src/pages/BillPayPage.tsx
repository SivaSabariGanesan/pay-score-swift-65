
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { processPayment } from "@/utils/razorpayUtils";
import { PaymentRequest } from "@/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

interface Bill {
  name: string;
  amount: number;
  provider?: string;
  dueDate?: string;
}

// Schema for search
const searchFormSchema = z.object({
  searchTerm: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

// Schema for custom bill
const billFormSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  provider: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least 1"),
});

type BillFormValues = z.infer<typeof billFormSchema>;

const BillPayPage = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([
    { name: "Electricity", amount: 1200, provider: "BESCOM", dueDate: "2025-04-15" },
    { name: "Water", amount: 500, provider: "Metro Water", dueDate: "2025-04-20" },
    { name: "Internet", amount: 999, provider: "Airtel", dueDate: "2025-04-10" },
    { name: "Mobile", amount: 349, provider: "Jio", dueDate: "2025-04-25" },
  ]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>(bills);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const billForm = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      provider: "",
      amount: 0,
    },
  });

  const handlePayBill = async (bill: Bill) => {
    const paymentRequest: PaymentRequest = {
      amount: bill.amount,
      to: bill.name,
      description: `Payment for ${bill.name}${bill.provider ? ` (${bill.provider})` : ''}`,
    };

    try {
      const result = await processPayment(paymentRequest);
      if (result) {
        toast.success(`Bill payment successful`, {
          description: `${bill.name} bill of ₹${bill.amount} paid successfully.`
        });
        navigate("/");
      }
    } catch (error) {
      toast.error("Payment failed", {
        description: "Please try again later"
      });
    }
  };

  const handleSearch = (values: SearchFormValues) => {
    const searchTerm = values.searchTerm?.toLowerCase() || "";
    if (!searchTerm) {
      setFilteredBills(bills);
      return;
    }
    
    const filtered = bills.filter(bill => 
      bill.name.toLowerCase().includes(searchTerm) || 
      (bill.provider && bill.provider.toLowerCase().includes(searchTerm))
    );
    setFilteredBills(filtered);
  };

  const handleAddBill = (values: BillFormValues) => {
    const newBill = {
      name: values.name,
      provider: values.provider,
      amount: values.amount,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default due date is 15 days from now
    };
    
    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    setFilteredBills(updatedBills);
    setIsAddBillOpen(false);
    billForm.reset();
    
    toast.success("Bill added", {
      description: `${newBill.name} bill has been added to your list.`
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Pay Bills</h1>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Find Bills to Pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...searchForm}>
            <form onChange={searchForm.handleSubmit(handleSearch)} className="space-y-4">
              <FormField
                control={searchForm.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search bills by name or provider"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="grid grid-cols-1 gap-3">
            {filteredBills.length > 0 ? (
              filteredBills.map((bill, index) => (
                <Button 
                  key={`${bill.name}-${index}`}
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-start justify-center gap-2 text-left"
                  onClick={() => handlePayBill(bill)}
                >
                  <div className="flex w-full justify-between">
                    <span className="font-semibold">{bill.name}</span>
                    <span className="text-muted-foreground">₹{bill.amount}</span>
                  </div>
                  {bill.provider && (
                    <span className="text-xs text-muted-foreground">Provider: {bill.provider}</span>
                  )}
                  {bill.dueDate && (
                    <span className="text-xs text-muted-foreground">Due: {bill.dueDate}</span>
                  )}
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-2">No bills found</p>
            )}
          </div>
          
          <Button 
            variant="secondary"
            className="w-full flex items-center gap-2"
            onClick={() => setIsAddBillOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New Bill
          </Button>
          
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </CardContent>
      </Card>
      
      {/* Add Bill Dialog */}
      <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          <Form {...billForm}>
            <form onSubmit={billForm.handleSubmit(handleAddBill)} className="space-y-4">
              <FormField
                control={billForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Bill Name (e.g., Electricity)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={billForm.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Provider (optional)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={billForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Amount (₹)" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsAddBillOpen(false);
                    billForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Add Bill</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPayPage;
