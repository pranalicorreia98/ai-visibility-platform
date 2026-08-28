import { SimplePageShell } from "@/components/marketing/simple-page-shell";

export default function PrivacyPage() {
  return (
    <SimplePageShell
      title="Privacy Policy"
      subtitle={`Last updated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <h2>What we collect</h2>
      <ul>
        <li>Account information: your name and email address, from Google sign-in or the email you provide.</li>
        <li>Brand data you provide: brand name, domain, and competitors you add for analysis.</li>
        <li>Usage data: the analyses you run and their results, so we can show your visibility trends over time.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your data to operate the Service: running AI visibility analyses on your
        behalf, showing you results and trends, and sending account-related emails (such as
        approval notifications). We do not sell your data.
      </p>

      <h2>Third parties</h2>
      <p>
        To generate analysis, we send prompts to third-party AI providers (including OpenAI,
        Google, and Perplexity). We use Google for sign-in when you choose that option. We use
        Resend to deliver transactional emails. Each of these providers processes data under
        their own privacy terms.
      </p>

      <h2>Data retention</h2>
      <p>
        We periodically delete expired cached data and remove raw AI response text older than
        90 days, keeping only the summarized metrics needed to show your visibility trends.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your account data at any time
        by emailing <a href="mailto:founder@zeeklabs.ai">founder@zeeklabs.ai</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href="mailto:founder@zeeklabs.ai">founder@zeeklabs.ai</a>.
      </p>
    </SimplePageShell>
  );
}
