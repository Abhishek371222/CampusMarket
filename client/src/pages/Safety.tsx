import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Users, AlertTriangle, Phone, Eye, CheckCircle } from "lucide-react";

export default function Safety() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Safety Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your safety is our top priority. Follow these guidelines to ensure safe transactions on Campus Marketplace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card data-testid="card-meeting-safely">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Meeting Safely
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Always choose safe, public locations for exchanges:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>University Library main entrance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Student Union building lobby</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Campus police station parking lot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Dining hall during busy hours</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-verify-identity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Verify Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Protect yourself by verifying who you're dealing with:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Ask to see student ID for high-value items</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Use your university email for communications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Check user ratings and reviews before meeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Tell a friend where you're going and when</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-payment-safety">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Payment Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Keep your money safe with these practices:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Use traceable payment methods (Venmo, PayPal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Inspect items before completing payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Never wire money or use gift cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Keep receipts and transaction records</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-red-flags">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Red Flags to Watch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Be cautious if you encounter these warning signs:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>Pressure to complete transaction quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>Requests to meet in private locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>Prices that seem too good to be true</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>Requests for unusual payment methods</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20" data-testid="card-emergency">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Badge variant="secondary" className="mb-2">Campus Police</Badge>
                <p className="font-semibold" data-testid="text-campus-police">555-SAFE (7233)</p>
                <p className="text-xs text-muted-foreground">Available 24/7</p>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="mb-2">Local Emergency</Badge>
                <p className="font-semibold" data-testid="text-emergency">911</p>
                <p className="text-xs text-muted-foreground">For immediate danger</p>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="mb-2">Report to Us</Badge>
                <p className="font-semibold" data-testid="text-report">safety@campusmarketplace.edu</p>
                <p className="text-xs text-muted-foreground">For platform concerns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-reporting">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Reporting Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              If you encounter suspicious activity or have a negative experience, please report it immediately. 
              Your reports help us maintain a safe community for all campus members.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">You can report:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Suspicious listings or scam attempts</li>
                <li>Harassment or inappropriate behavior</li>
                <li>Prohibited items being sold</li>
                <li>Users who don't show up to meetings</li>
                <li>Any other safety concerns</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              All reports are reviewed within 24 hours. Serious violations may result in immediate account suspension and reporting to campus authorities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
