import { SimplePageShell } from "@/components/marketing/simple-page-shell";
import { Mail, MessageCircle } from "lucide-react";

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
            <p className="font-semibold text-gray-900">Email</p>
            <p className="text-sm text-gray-500">founder@zeeklabs.ai</p>
          </div>
        </a>
        <a
          href="https://wa.me/919673713791"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-green-400 hover:shadow-md transition-all"
        >
          <div className="p-2.5 rounded-lg bg-green-100">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">WhatsApp</p>
            <p className="text-sm text-gray-500">+91 96737 13791</p>
          </div>
        </a>
      </div>
    </SimplePageShell>
  );
}
