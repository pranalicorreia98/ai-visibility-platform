import { SimplePageShell } from "@/components/marketing/simple-page-shell";

export default function TermsPage() {
  return (
    <SimplePageShell
      title="Terms of Service"
      subtitle={`Last updated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of zeeklabs.ai
        (the &quot;Service&quot;). By creating an account or using the Service, you agree to
        these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        zeeklabs.ai helps brands monitor and improve how they are represented in responses
        from third-party AI systems (such as ChatGPT, Gemini, and Perplexity). The Service
        works by sending queries to these third-party AI providers and analyzing their
        responses; we do not control what those systems say and cannot guarantee any
        particular outcome, ranking, or improvement in AI-generated responses.
      </p>

      <h2>2. Accounts</h2>
      <p>
        Access to the Service requires an account and is subject to admin approval. You are
        responsible for the accuracy of the information you provide and for activity that
        occurs under your account.
      </p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>Don&apos;t use the Service to violate any law or third party&apos;s rights.</li>
        <li>Don&apos;t attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service or its infrastructure.</li>
        <li>Don&apos;t use the Service to generate or distribute misleading claims about a brand&apos;s AI visibility to third parties.</li>
      </ul>

      <h2>4. Third-party AI providers</h2>
      <p>
        The Service relies on third-party AI providers to generate analysis. Their outputs
        may be inaccurate, biased, or change without notice, and are outside our control.
        Analysis results are provided for informational purposes and should not be treated
        as guaranteed fact.
      </p>

      <h2>5. Data</h2>
      <p>
        Our use of your data is described in the{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. Disclaimers and limitation of liability</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. To the
        maximum extent permitted by law, zeeklabs.ai is not liable for indirect, incidental,
        or consequential damages arising from your use of the Service.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after a
        change constitutes acceptance of the updated Terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:founder@zeeklabs.ai">founder@zeeklabs.ai</a>.
      </p>
    </SimplePageShell>
  );
}
