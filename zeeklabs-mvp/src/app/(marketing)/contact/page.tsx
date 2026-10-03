import { SimplePageShell } from "@/components/marketing/simple-page-shell";
import { Mail, MessageCircle, Building2, MapPin } from "lucide-react";

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

      {/* Company Details */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          Company Information
        </h2>
        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <div>
            <p className="text-sm text-gray-500">Legal Name</p>
            <p className="font-medium text-gray-900">CLIKBOUND PRIVATE LIMITED</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">CIN</p>
              <p className="font-medium text-gray-900 font-mono text-sm">U62013MH2026PTC477590</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GSTIN</p>
              <p className="font-medium text-gray-900 font-mono text-sm">27AANCC9371J1Z0</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Registered Address
            </p>
            <p className="font-medium text-gray-900 text-sm">
              HNO 318, Nivant House, Morwadi Padai, Satpala,<br />
              Virar (West), Vasai-Virar, Palghar,<br />
              Maharashtra, India — 401301
            </p>
          </div>
        </div>
      </div>
    </SimplePageShell>
  );
}
