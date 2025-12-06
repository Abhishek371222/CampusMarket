import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-heading" data-testid="text-page-title">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground" data-testid="text-last-updated">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section data-testid="section-introduction">
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Campus Marketplace. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section data-testid="section-information-collected">
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (campus location, profile picture, bio)</li>
              <li>Listing information (product descriptions, images, prices)</li>
              <li>Messages and communications between users</li>
              <li>Transaction history and preferences</li>
            </ul>
          </section>

          <section data-testid="section-information-use">
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Detect, prevent, and address fraud and abuse</li>
              <li>Personalize your experience on the platform</li>
            </ul>
          </section>

          <section data-testid="section-information-sharing">
            <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>With other users when you create listings or send messages</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
          </section>

          <section data-testid="section-data-security">
            <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section data-testid="section-your-rights">
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section data-testid="section-cookies">
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. For more details, please see our Cookie Policy.
            </p>
          </section>

          <section data-testid="section-contact">
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us through our Support page or email us at privacy@campusmarketplace.edu.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
