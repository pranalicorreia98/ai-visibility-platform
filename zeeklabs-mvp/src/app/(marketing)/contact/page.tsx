import { SimplePageShell } from "@/components/marketing/simple-page-shell";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <SimplePageShell
      title="Get in touch"
      subtitle="Questions, feedback, or need help getting started? We read every message."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <a
          href="mailto:founder@zeeklabs.ai"
          className="flex items-center gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="p-2.5 rounded-lg bg-indigo-100">
            <Mail className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Founder</p>
            <p className="text-sm text-gray-500">founder@zeeklabs.ai</p>
          </div>
        </a>
        <a
          href="mailto:support@zeeklabs.ai"
          className="flex items-center gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="p-2.5 rounded-lg bg-indigo-100">
            <Mail className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Support</p>
            <p className="text-sm text-gray-500">support@zeeklabs.ai</p>
          </div>
        </a>
      </div>
    </SimplePageShell>
  );
}
