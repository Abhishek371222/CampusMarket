import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { z } from "zod";
import { motion } from "framer-motion";
import { fadeInUp, pageTransition } from "@/lib/animations";
import { formatCurrency } from "@/lib/utils";
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
          description: `${formatCurrency(amount)} has been added to your wallet.`,
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
          <span>Pay {formatCurrency(amount)}</span>
        )}
      </Button>
    </form>
  );
};

// AddFunds component with Indian payment options
const AddFunds = ({ onSuccess }: { onSuccess: () => void }) => {
  const [amount, setAmount] = useState<number | undefined>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | null>(null);
  const [upiId, setUpiId] = useState('');
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
    mutationFn: async (data: { amount: number, paymentMethod: string, upiId?: string }) => {
      return apiRequest('POST', '/api/wallet/create-payment-intent', data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setIsPaymentReady(true);
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

  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
  };

  const handleInitiatePayment = () => {
    if (amount && paymentMethod) {
      // For UPI, we need a valid UPI ID
      if (paymentMethod === 'upi' && !upiId.includes('@')) {
        toast({
          title: "Invalid UPI ID",
          description: "Please enter a valid UPI ID (e.g., name@upi).",
          variant: "destructive",
        });
        return;
      }
      
      createPaymentIntentMutation.mutate({
        amount,
        paymentMethod,
        ...(paymentMethod === 'upi' && { upiId })
      });
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please enter a valid amount and select a payment method.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setAmount(undefined);
    setClientSecret(null);
    setIsPaymentReady(false);
    setPaymentMethod(null);
    setUpiId('');
    onSuccess();
  };

  // Simulated payment for demo 
  const processSimulatedPayment = () => {
    setTimeout(() => {
      if (amount) {
        toast({
          title: "Payment Successful",
          description: `${formatCurrency(amount)} has been added to your wallet.`,
        });
      }
      handlePaymentSuccess();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {!isPaymentReady ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
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
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-muted-foreground">Minimum amount: ₹1</p>
          </div>
          
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="button" 
                  variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                  className={`w-full p-3 h-auto flex items-center justify-center gap-2 ${
                    paymentMethod === 'upi' ? 'bg-blue-600 hover:bg-blue-500' : ''
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <svg viewBox="0 0 100 100" className="h-6 w-6">
                    <rect width="100" height="100" rx="10" fill="#FFFFFF" />
                    <path d="M35.752,26.601c-0.578,0-1.055,0.477-1.055,1.055v20.238c0,0.578,0.477,1.055,1.055,1.055h4.781 c0.578,0,1.055-0.477,1.055-1.055V27.657c0-0.578-0.477-1.055-1.055-1.055H35.752z" fill="#097939"/>
                    <path d="M61.948,27.656c0-0.578-0.477-1.055-1.055-1.055h-4.781c-0.578,0-1.055,0.477-1.055,1.055v20.238 c0,0.578,0.477,1.055,1.055,1.055h4.781c0.578,0,1.055-0.477,1.055-1.055V37.778l7.329,10.858 c0.19,0.281,0.505,0.45,0.843,0.45h5.204c0.883,0,1.359-1.048,0.78-1.715L66.6,36.753l8.315-9.097 c0.578-0.667,0.103-1.715-0.78-1.715h-5.204c-0.338,0-0.653,0.169-0.843,0.45L61.948,36.35V27.656z" fill="#097939"/>
                    <path d="M80.219,41.342l-3.167-3.166l-3.166,3.166l3.166,3.165L80.219,41.342z" fill="#097939"/>
                    <path d="M62.642,73.419c-0.578,0-1.055-0.477-1.055-1.055V52.126c0-0.578,0.477-1.055,1.055-1.055h4.781 c0.578,0,1.055,0.477,1.055,1.055v20.238c0,0.578-0.477,1.055-1.055,1.055H62.642z" fill="#F1B31A"/>
                    <path d="M46.055,52.126c0-0.578-0.477-1.055-1.055-1.055h-4.781c-0.578,0-1.055,0.477-1.055,1.055v20.238 c0,0.578,0.477,1.055,1.055,1.055h4.781c0.578,0,1.055-0.477,1.055-1.055V62.248l7.329,10.858 c0.19,0.281,0.505,0.45,0.843,0.45h5.204c0.883,0,1.359-1.048,0.78-1.715l-8.503-10.617l8.315-9.097 c0.578-0.667,0.103-1.715-0.78-1.715h-5.204c-0.338,0-0.653,0.169-0.843,0.45l-7.139,9.958V52.126z" fill="#F1B31A"/>
                    <path d="M28.7,51.071h-5.204c-0.338,0-0.653,0.169-0.843,0.45l-7.139,9.958v-9.354c0-0.578-0.477-1.055-1.055-1.055 h-4.781c-0.578,0-1.055,0.477-1.055,1.055v20.238c0,0.578,0.477,1.055,1.055,1.055h4.781c0.578,0,1.055-0.477,1.055-1.055 V62.248l7.329,10.858c0.19,0.281,0.505,0.45,0.843,0.45H28.7c0.883,0,1.359-1.048,0.78-1.715l-8.503-10.617l8.315-9.097 C30.06,52.118,29.583,51.071,28.7,51.071z" fill="#B61A4F"/>
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">UPI</div>
                    <div className="text-xs opacity-70">PhonePe, Google Pay, Paytm</div>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="button" 
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className={`w-full p-3 h-auto flex items-center justify-center gap-2 ${
                    paymentMethod === 'card' ? 'bg-blue-600 hover:bg-blue-500' : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Card</div>
                    <div className="text-xs opacity-70">Credit/Debit Card</div>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full p-3 h-auto flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                  disabled
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <rect width="24" height="24" rx="4" fill="#072654"/>
                    <path d="M12.867 17.5283C16.3909 17.5283 19.2456 14.7035 19.2456 11.1796C19.2456 7.65562 16.3909 4.82983 12.867 4.82983C9.34301 4.82983 6.48828 7.65562 6.48828 11.1796C6.48828 14.7035 9.34301 17.5283 12.867 17.5283Z" fill="#06BCF1"/>
                    <path d="M9.87321 9.00913C9.87321 9.00913 11.6341 10.1308 13.8907 9.57351C16.1472 9.01618 17.6241 6.8778 17.6241 6.8778C17.6241 6.8778 16.7451 12.7599 9.87321 14.0935C9.87321 14.0935 7.53996 8.63122 9.87321 9.00913Z" fill="white"/>
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">NetBanking</div>
                    <div className="text-xs opacity-70">Coming Soon</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
          
          {paymentMethod === 'upi' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="upiId">UPI ID</Label>
              <div className="relative">
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={handleUpiIdChange}
                  placeholder="yourname@upi"
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1024px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-6 w-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png" alt="Google Pay" className="h-6 w-6" />
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setUpiId('username@paytm')}>Paytm</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setUpiId('username@okaxis')}>BHIM</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setUpiId('username@ybl')}>PhonePe</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setUpiId('username@okicici')}>Google Pay</Badge>
              </div>
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-2"
          >
            <Button 
              onClick={handleInitiatePayment} 
              disabled={!amount || !paymentMethod || createPaymentIntentMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 transition-all duration-300"
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
          </motion.div>
        </motion.div>
      ) : clientSecret && amount ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {paymentMethod === 'card' ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: { theme: 'stripe' }
              }}
            >
              <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} />
            </Elements>
          ) : (
            <div className="border rounded-lg p-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold">UPI Payment</h3>
                <p className="text-muted-foreground">Complete payment using your UPI app</p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm">Amount</span>
                  <span className="font-bold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm">UPI ID</span>
                  <span className="font-mono">{upiId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transaction Reference</span>
                  <span className="font-mono text-xs">UPI{Math.floor(Math.random() * 1000000)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1024px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-12 w-12 mb-2" />
                  <span className="text-xs">PhonePe</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Google_Pay_%28GPay%29_Logo_%282018-2020%29.svg/1200px-Google_Pay_%28GPay%29_Logo_%282018-2020%29.svg.png" alt="Google Pay" className="h-12 w-12 mb-2" />
                  <span className="text-xs">Google Pay</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-12 w-12 mb-2" />
                  <span className="text-xs">Paytm</span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={processSimulatedPayment} 
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  Simulate Successful Payment
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsPaymentReady(false);
                    setPaymentMethod(null);
                  }} 
                  className="w-full"
                >
                  Cancel
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
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
                <h4 className="font-semibold">Which payment methods are supported?</h4>
                <p>We support UPI payments (PhonePe, Google Pay, Paytm) and credit/debit cards. NetBanking will be available soon.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is there a transaction fee?</h4>
                <p>No, we don't charge any transaction fees for adding money to your wallet.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is my payment information secure?</h4>
                <p>Yes, all payments are processed through secure payment gateways that encrypt your information.</p>
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
        description: `Your withdrawal request of ${formatCurrency(parseFloat(formData.amount))} has been initiated.`,
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
                          {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
              <div className="text-4xl font-bold">{formatCurrency(parseFloat(balanceQuery.data?.balance || '0'))}</div>
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