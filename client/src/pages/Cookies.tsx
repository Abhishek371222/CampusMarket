import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Cookies() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-heading" data-testid="text-page-title">Cookie Policy</CardTitle>
          <p className="text-sm text-muted-foreground" data-testid="text-last-updated">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section data-testid="section-what-are-cookies">
            <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, keeping you logged in, and understanding how you use our platform.
            </p>
          </section>

          <section data-testid="section-cookies-we-use">
            <h2 className="text-xl font-semibold mb-3">2. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core features like user authentication, session management, and security. You cannot opt out of these cookies.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies remember your preferences and choices to provide a more personalized experience. This includes your language preferences, theme settings (dark/light mode), and display options.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use analytics cookies to understand how visitors interact with our website. This helps us improve our platform by identifying popular features and areas that need improvement.
                </p>
              </div>
            </div>
          </section>

          <section data-testid="section-how-we-use">
            <h2 className="text-xl font-semibold mb-3">3. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Keeping you signed in to your account</li>
              <li>Remembering your preferences and settings</li>
              <li>Understanding how you navigate our platform</li>
              <li>Improving the performance and speed of our website</li>
              <li>Providing personalized content and recommendations</li>
              <li>Ensuring security and preventing fraud</li>
            </ul>
          </section>

          <section data-testid="section-third-party">
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some cookies on our platform are placed by third-party services that appear on our pages. These third parties may use cookies to collect information about your activities on our website and other sites to provide you with targeted content. We do not control these third-party cookies.
            </p>
          </section>

          <section data-testid="section-managing-cookies">
            <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Browser settings: Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites.</li>
              <li>Private browsing: Use your browser's private or incognito mode to prevent cookies from being stored.</li>
              <li>Cookie preferences: Use our cookie consent tool (when available) to manage your cookie preferences.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Please note that disabling certain cookies may affect the functionality of our website and your user experience.
            </p>
          </section>

          <section data-testid="section-cookie-retention">
            <h2 className="text-xl font-semibold mb-3">6. Cookie Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              The length of time cookies remain on your device depends on whether they are "session" or "persistent" cookies. Session cookies are deleted when you close your browser, while persistent cookies remain until they expire or you delete them. Our authentication cookies typically last for 30 days.
            </p>
          </section>

          <section data-testid="section-updates">
            <h2 className="text-xl font-semibold mb-3">7. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information.
            </p>
          </section>

          <section data-testid="section-contact">
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us through our Support page or email us at privacy@campusmarketplace.edu.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
