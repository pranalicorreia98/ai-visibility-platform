import { SimplePageShell } from "@/components/marketing/simple-page-shell";

export const metadata = {
  title: "Privacy Policy | ZeekLabs",
  description: "Privacy Policy for ZeekLabs AI Visibility Analytics Platform",
};

export default function PrivacyPage() {
  return (
    <SimplePageShell
      title="Privacy Policy"
      subtitle="Last updated: July 7, 2026"
    >
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
          <p>
            ZeekLabs (&quot;zeeklabs.ai&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an AI visibility analytics platform operated by <strong>CLIKBOUND PRIVATE LIMITED</strong>, a company registered in India.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li><strong>CIN:</strong> U62013MH2026PTC477590</li>
            <li><strong>GSTIN:</strong> 27AALCC9498R1ZR</li>
            <li><strong>Registered Office:</strong> Office No. 2, 2nd Floor, Karan CHS LTD, Azad Road, Vile Parle East, Mumbai, Maharashtra 400057</li>
          </ul>
          <p className="mt-3">
            This Privacy Policy explains how we collect, use, share, and protect your personal information when you use the ZeekLabs platform and related services (collectively, the &quot;Service&quot;).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">2.1 Information You Provide</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Account Information:</strong> Name, email address (from Google sign-in or email/password registration)</li>
            <li><strong>Brand Data:</strong> Brand names, domains, competitors, and industry information you add for analysis</li>
            <li><strong>Payment Information:</strong> Billing details processed securely through our payment provider (Dodo Payments)</li>
            <li><strong>Communications:</strong> Messages you send to our support team</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">2.2 Information We Collect Automatically</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Usage Data:</strong> Analyses you run, features you use, and interaction patterns</li>
            <li><strong>Analytics:</strong> Page views, session duration, and navigation paths</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and IP address</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li>Provide, maintain, and improve the Service</li>
            <li>Run AI visibility analyses on your brands and competitors</li>
            <li>Display your visibility scores, trends, and recommendations</li>
            <li>Process payments and manage your subscription</li>
            <li>Send account-related communications (approval notifications, billing alerts)</li>
            <li>Respond to your support requests</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3 font-medium">We do not sell your personal data.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
          <p>To provide the Service, we share data with the following categories of third parties:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li><strong>AI Providers:</strong> OpenAI, Google (Gemini), Perplexity, and other LLM providers to generate visibility analyses</li>
            <li><strong>Authentication:</strong> Google OAuth for sign-in</li>
            <li><strong>Payment Processing:</strong> Dodo Payments for subscription billing</li>
            <li><strong>Email Delivery:</strong> Resend for transactional emails</li>
            <li><strong>Hosting:</strong> AWS for infrastructure and data storage</li>
          </ul>
          <p className="mt-3">
            Each third-party provider processes data under their own privacy terms and applicable data protection agreements.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
            <li>Row-level database security for data isolation between accounts</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls limiting employee access to personal data</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
          <p>We retain your data as follows:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion request</li>
            <li><strong>Analysis Results:</strong> Raw AI responses deleted after 90 days; summarized metrics retained for trend analysis</li>
            <li><strong>Cached Data:</strong> Automatically purged when expired</li>
            <li><strong>Billing Records:</strong> Retained as required by applicable tax and accounting laws</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{" "}
            <a href="mailto:founder@zeeklabs.ai" className="text-indigo-600 hover:underline">founder@zeeklabs.ai</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
          <p>
            We use essential cookies to maintain your session and preferences. We may use analytics cookies to understand how visitors use the Service. You can control cookie settings through your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, please contact us immediately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="mt-3 space-y-1 text-gray-700">
            <li><strong>Email:</strong> <a href="mailto:founder@zeeklabs.ai" className="text-indigo-600 hover:underline">founder@zeeklabs.ai</a></li>
            <li><strong>Address:</strong> CLIKBOUND PRIVATE LIMITED, Office No. 2, 2nd Floor, Karan CHS LTD, Azad Road, Vile Parle East, Mumbai, Maharashtra 400057, India</li>
          </ul>
        </div>
      </section>
    </SimplePageShell>
  );
}
