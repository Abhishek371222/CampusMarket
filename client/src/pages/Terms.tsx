import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-heading" data-testid="text-page-title">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground" data-testid="text-last-updated">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section data-testid="section-acceptance">
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Campus Marketplace, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </p>
          </section>

          <section data-testid="section-eligibility">
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Campus Marketplace is intended for use by currently enrolled college and university students, faculty, and staff. By using our platform, you represent that you are affiliated with an accredited educational institution and are at least 18 years of age.
            </p>
          </section>

          <section data-testid="section-account-responsibilities">
            <h2 className="text-xl font-semibold mb-3">3. Account Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">When you create an account, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section data-testid="section-prohibited-items">
            <h2 className="text-xl font-semibold mb-3">4. Prohibited Items and Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">The following items and activities are strictly prohibited:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Illegal substances, drugs, or drug paraphernalia</li>
              <li>Weapons, explosives, or hazardous materials</li>
              <li>Counterfeit or stolen goods</li>
              <li>Academic dishonesty services (essay writing, exam answers)</li>
              <li>Adult content or services</li>
              <li>Fraudulent listings or scams</li>
              <li>Harassment, threats, or discrimination</li>
              <li>Spam or unsolicited advertising</li>
            </ul>
          </section>

          <section data-testid="section-transactions">
            <h2 className="text-xl font-semibold mb-3">5. Transactions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Campus Marketplace is a platform that connects buyers and sellers. We are not responsible for the quality, safety, or legality of items listed, the accuracy of listings, or the ability of buyers to pay or sellers to deliver. All transactions are conducted at your own risk.
            </p>
          </section>

          <section data-testid="section-intellectual-property">
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform and its original content, features, and functionality are owned by Campus Marketplace and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section data-testid="section-limitation-liability">
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Campus Marketplace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, including but not limited to loss of data, profits, or other intangible losses.
            </p>
          </section>

          <section data-testid="section-termination">
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the platform will cease immediately.
            </p>
          </section>

          <section data-testid="section-changes">
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date.
            </p>
          </section>

          <section data-testid="section-contact">
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us through our Support page or email us at legal@campusmarketplace.edu.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
