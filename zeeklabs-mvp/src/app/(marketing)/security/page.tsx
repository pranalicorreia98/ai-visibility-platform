import { SimplePageShell } from "@/components/marketing/simple-page-shell";

export default function SecurityPage() {
  return (
    <SimplePageShell
      title="Security"
      subtitle="How zeeklabs.ai is hosted and how we handle your data."
    >
      <h2>Infrastructure</h2>
      <p>
        zeeklabs.ai runs on Amazon Web Services (AWS). Your data is stored in a managed
        PostgreSQL database (Amazon RDS) that sits in a private network with no public
        internet access — it is reachable only from our application server.
      </p>

      <h2>Encryption</h2>
      <p>
        All traffic to zeeklabs.ai is encrypted in transit via HTTPS/TLS. API keys and other
        application secrets are stored encrypted in AWS Systems Manager Parameter Store, not
        in plaintext configuration files.
      </p>

      <h2>Access control</h2>
      <ul>
        <li>Server access uses AWS Systems Manager Session Manager — there is no open SSH port on our infrastructure.</li>
        <li>New accounts require admin approval before gaining access to the platform.</li>
        <li>Sign-in is available via Google OAuth or email, both gated behind the same approval step.</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        We periodically purge stale cached data (expired analysis caches, old raw AI response
        text, and outdated usage logs) to keep only what&apos;s needed to show your brand&apos;s
        visibility trends over time.
      </p>

      <h2>Questions</h2>
      <p>
        If you have a specific security question or want to report a concern, email{" "}
        <a href="mailto:founder@zeeklabs.ai">founder@zeeklabs.ai</a>.
      </p>
    </SimplePageShell>
  );
}
