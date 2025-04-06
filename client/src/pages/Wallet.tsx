import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { z } from "zod";
import { motion } from "framer-motion";
import { fadeInUp, pageTransition } from "@/lib/animations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside component scope
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type WalletTransaction = {
  id: number;
  userId: number;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  createdAt: string;
};

// Add/Withdraw funds form schema
const fundsFormSchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().min(1, "Amount must be at least ₹1")
  ),
});

// Withdrawal account details schema
const withdrawalSchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().min(100, "Minimum withdrawal amount is ₹100")
  ),
  accountName: z.string().min(3, "Account name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
});

// CheckoutForm component for Stripe Elements
const CheckoutForm = ({ amount, onSuccess }: { amount: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/wallet',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `₹${amount.toFixed(2)} has been added to your wallet.`,
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          <span>Pay ₹{amount.toFixed(2)}</span>
        )}
      </Button>
    </form>
  );
};

// AddFunds component with Stripe integration
const AddFunds = ({ onSuccess }: { onSuccess: () => void }) => {
  const [amount, setAmount] = useState<number | undefined>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeReady, setIsStripeReady] = useState(false);
  const { toast } = useToast();

  const validateAmount = (value: string) => {
    try {
      const result = fundsFormSchema.parse({ amount: value });
      return result.amount;
    } catch (error) {
      return undefined;
    }
  };

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest('POST', '/api/wallet/create-payment-intent', { amount })
        .then(res => res.json());
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setIsStripeReady(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = validateAmount(e.target.value);
    setAmount(value);
  };

  const handleInitiatePayment = () => {
    if (amount) {
      createPaymentIntentMutation.mutate(amount);
    } else {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add to your wallet.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setAmount(undefined);
    setClientSecret(null);
    setIsStripeReady(false);
    onSuccess();
  };

  return (
    <div className="space-y-6">
      {!isStripeReady ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={handleAmountChange}
              placeholder="Enter amount to add"
              min="1"
              step="1"
            />
            <p className="text-sm text-muted-foreground">Minimum amount: ₹1</p>
          </div>
          <Button 
            onClick={handleInitiatePayment} 
            disabled={!amount || createPaymentIntentMutation.isPending}
            className="w-full"
          >
            {createPaymentIntentMutation.isPending ? (
              <span className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Proceed to Payment
              </span>
            )}
          </Button>
        </>
      ) : clientSecret && amount ? (
        <div className="mt-4">
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: { theme: 'stripe' }
            }}
          >
            <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      ) : null}

      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="faq">
          <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">How does wallet payment work?</h4>
                <p>When you add money to your wallet, you can use it to purchase items on the marketplace without entering payment details each time.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is there a transaction fee?</h4>
                <p>No, we don't charge any transaction fees for adding money to your wallet.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is my payment information secure?</h4>
                <p>Yes, all payments are processed through Stripe, a secure payment gateway that encrypts your information.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Withdraw funds component
const WithdrawFunds = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    amount: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const { toast } = useToast();

  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      accountDetails: {
        name: string;
        number: string;
        ifsc: string;
      };
    }) => {
      return apiRequest('POST', '/api/wallet/withdraw', data)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal request of ₹${parseFloat(formData.amount).toFixed(2)} has been initiated.`,
      });
      setFormData({
        amount: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process your withdrawal request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validData = withdrawalSchema.parse(formData);
      
      withdrawMutation.mutate({
        amount: validData.amount!,
        accountDetails: {
          name: validData.accountName,
          number: validData.accountNumber,
          ifsc: validData.ifscCode
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.message}`).join(", ");
        toast({
          title: "Validation Error",
          description: errors,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter withdrawal amount"
          min="100"
        />
        <p className="text-sm text-muted-foreground">Minimum withdrawal: ₹100</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accountName">Account Holder Name</Label>
        <Input
          id="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="Enter account holder name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          placeholder="Enter account number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input
          id="ifscCode"
          value={formData.ifscCode}
          onChange={handleChange}
          placeholder="Enter IFSC code"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={withdrawMutation.isPending}
      >
        {withdrawMutation.isPending ? (
          <span className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Withdraw Funds
          </span>
        )}
      </Button>

      <div className="mt-4 rounded-md bg-muted p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Withdrawal requests are typically processed within 2-3 business days.</p>
          </div>
        </div>
      </div>
    </form>
  );
};

// Transaction History component
const TransactionHistory = ({ transactions }: { transactions: WalletTransaction[] }) => {
  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="mr-4">
                    {transaction.type === 'deposit' ? (
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <Plus className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                    ) : transaction.type === 'withdrawal' ? (
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <ArrowUpRight className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                    ) : transaction.type === 'payment' ? (
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                        <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                      </div>
                    ) : (
                      <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                        <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {transaction.reference}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={`font-bold ${transaction.type === 'deposit' || transaction.type === 'refund' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </span>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'success' : 
                            transaction.status === 'pending' ? 'outline' : 'destructive'
                          }
                          className="mt-1"
                        >
                          {transaction.status === 'completed' ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          ) : transaction.status === 'pending' ? (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </span>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Wallet Page Component
export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("balance");
  const { toast } = useToast();

  // Query for wallet balance
  const balanceQuery = useQuery({
    queryKey: ['/api/wallet/balance'],
    queryFn: () => apiRequest('GET', '/api/wallet/balance').then(res => res.json()),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Query for transaction history
  const transactionsQuery = useQuery({
    queryKey: ['/api/wallet/transactions'],
    queryFn: () => apiRequest('GET', '/api/wallet/transactions').then(res => res.json()),
    enabled: !!user,
  });

  const handleSuccess = () => {
    // Refetch wallet data
    balanceQuery.refetch();
    transactionsQuery.refetch();
  };

  // Handle URL params for Stripe redirects
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentStatus = query.get('payment_status');
    
    if (paymentStatus === 'succeeded') {
      toast({
        title: "Payment Successful",
        description: "Your wallet has been topped up successfully.",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refetch wallet data
      handleSuccess();
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment was unsuccessful. Please try again.",
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container max-w-4xl py-12"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold" 
          variants={fadeInUp}
        >
          <Wallet className="inline-block mr-2 h-8 w-8" /> My Wallet
        </motion.h1>
        <motion.p 
          className="text-muted-foreground mt-2"
          variants={fadeInUp}
        >
          Manage your funds and view transaction history
        </motion.p>
      </div>

      <motion.div 
        className="grid gap-6"
        variants={fadeInUp}
      >
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>
              Your current available balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balanceQuery.isLoading ? (
              <div className="animate-pulse h-12 bg-muted rounded-md"></div>
            ) : balanceQuery.isError ? (
              <div className="text-red-500">Error loading balance</div>
            ) : (
              <div className="text-4xl font-bold">₹{parseFloat(balanceQuery.data?.balance || '0').toFixed(2)}</div>
            )}

            <div className="mt-6 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                    <DialogDescription>
                      Top up your wallet balance using a secure payment method.
                    </DialogDescription>
                  </DialogHeader>
                  <AddFunds onSuccess={handleSuccess} />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Withdraw money from your wallet to your bank account.
                    </DialogDescription>
                  </DialogHeader>
                  <WithdrawFunds onSuccess={handleSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View your recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="balance">All Transactions</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              
              {transactionsQuery.isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-24 bg-muted rounded-md"></div>
                  ))}
                </div>
              ) : transactionsQuery.isError ? (
                <div className="text-center py-10 text-red-500">
                  Error loading transactions
                </div>
              ) : (
                <>
                  <TabsContent value="balance">
                    <TransactionHistory 
                      transactions={transactionsQuery.data || []}
                    />
                  </TabsContent>
                  <TabsContent value="deposits">
                    <TransactionHistory 
                      transactions={(transactionsQuery.data || []).filter((t: WalletTransaction) => 
                        t.type === 'deposit' || t.type === 'refund'
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="withdrawals">
                    <TransactionHistory 
                      transactions={(transactionsQuery.data || []).filter((t: WalletTransaction) => 
                        t.type === 'withdrawal'
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="payments">
                    <TransactionHistory 
                      transactions={(transactionsQuery.data || []).filter((t: WalletTransaction) => 
                        t.type === 'payment'
                      )}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}