import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail, HelpCircle, BookOpen, Zap, Users } from "lucide-react";

const faqs = [
  {
    question: "How do I create a listing?",
    answer: "Click the 'Sell' button in the navigation bar, fill out the product details including title, description, price, and upload photos. Choose a category and condition, then submit your listing. It will be visible to other students immediately."
  },
  {
    question: "How do I contact a seller?",
    answer: "On any product listing page, click the 'Message Seller' button to start a conversation. You can discuss details, negotiate prices, and arrange a meeting through our built-in messaging system."
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes! We only share your campus name and public profile with other users. Your email, phone number, and exact location are never shared without your consent. All communications happen through our secure platform."
  },
  {
    question: "How do I report a suspicious user or listing?",
    answer: "Click the 'Report' button on any listing or user profile. Provide details about your concern, and our team will review it within 24 hours. For urgent safety issues, contact campus police directly."
  },
  {
    question: "What items are prohibited?",
    answer: "Prohibited items include weapons, drugs, alcohol, counterfeit goods, stolen property, academic dishonesty services (essays, exam answers), and adult content. Violating these rules may result in account suspension."
  },
  {
    question: "How do I edit or delete my listing?",
    answer: "Go to your Profile page and find the listing under 'My Listings'. Click on it to view options for editing or deleting. Sold items should be marked as 'Sold' rather than deleted to maintain transaction history."
  },
  {
    question: "What payment methods are recommended?",
    answer: "We recommend using traceable payment methods like Venmo, PayPal, or Zelle. Cash is acceptable for in-person transactions. Never use wire transfers, gift cards, or cryptocurrency as these are common in scams."
  },
  {
    question: "How do I change my campus location?",
    answer: "Go to Profile > Edit Profile and update your campus location. This helps connect you with students at your institution and shows relevant local listings."
  }
];

export default function Support() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Help & Support</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team for assistance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="text-center hover-elevate" data-testid="card-contact-email">
            <CardContent className="pt-6 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">Get help via email</p>
              <p className="text-sm font-medium" data-testid="text-email">support@campusmarketplace.edu</p>
              <p className="text-xs text-muted-foreground">Response within 24-48 hours</p>
            </CardContent>
          </Card>

          <Card className="text-center hover-elevate" data-testid="card-contact-chat">
            <CardContent className="pt-6 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our AI assistant</p>
              <p className="text-sm font-medium">Available in the app</p>
              <p className="text-xs text-muted-foreground">Instant responses 24/7</p>
            </CardContent>
          </Card>

          <Card className="text-center hover-elevate" data-testid="card-contact-community">
            <CardContent className="pt-6 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">Connect with other students</p>
              <Button variant="link" className="p-0 h-auto" data-testid="link-community">
                Visit Community Wall
              </Button>
              <p className="text-xs text-muted-foreground">Get tips from experienced users</p>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-faq">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-getting-started">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium text-sm">Create your account</p>
                    <p className="text-xs text-muted-foreground">Sign up with your campus email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium text-sm">Complete your profile</p>
                    <p className="text-xs text-muted-foreground">Add your campus and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium text-sm">Start browsing or selling</p>
                    <p className="text-xs text-muted-foreground">Explore listings or create your own</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-resources">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Helpful Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-safety-tips">
                    Safety Tips for Transactions
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-listing-guide">
                    Guide to Creating Great Listings
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-pricing-tips">
                    Pricing Your Items Competitively
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-photo-tips">
                    Taking Better Product Photos
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20" data-testid="card-still-need-help">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="font-semibold text-lg">Still need help?</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Our support team is here to assist you. Send us an email and we'll get back to you as soon as possible.
            </p>
            <Button data-testid="button-contact-support">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
