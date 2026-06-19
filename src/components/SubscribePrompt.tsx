import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface SubscribePromptProps {
  title?: string;
  description?: string;
}

export default function SubscribePrompt({
  title = "Publishing is a Premium Feature",
  description = "Subscribe to a plan to unlock eBook creation, AI-assisted writing, and distribution to the Virtus Store.",
}: SubscribePromptProps) {
  const navigate = useNavigate();

  const features = [
    "AI-powered eBook creation & outlining",
    "Full text editor with AI assistant",
    "Professional cover design tools",
    "Distribution to the Virtus Store",
    "80% author royalty on every sale",
    "Multi-format export (EPUB, PDF, MOBI)",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(200,165,92,0.12)] flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-[#C8A55C]" />
        </div>

        <h2 className="text-[24px] font-semibold mb-2">{title}</h2>
        <p className="text-[14px] text-[#9B9589] leading-relaxed mb-6">
          {description}
        </p>

        <div className="glass-surface p-5 text-left mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#9B9589] mb-3">
            What you get with any plan:
          </p>
          <div className="space-y-2.5">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#C5BFB3]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/pricing")}
          className="btn-gold text-[14px] w-full flex items-center justify-center gap-2 py-3"
        >
          <Sparkles className="w-4 h-4" />
          View Plans & Subscribe
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-[#9B9589] mt-3">
          Plans start at $29/month. Cancel anytime.
        </p>
      </div>
    </motion.div>
  );
}
