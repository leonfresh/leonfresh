"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import GlassCard from "./GlassCard";

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("submitting");
    setSubmittedEmail("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Request failed");

      setSubmittedEmail(formData.email);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <GlassCard className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-teal-500/30 bg-teal-900/10">
        <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-6 animate-[blob_1s_ease-out]">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-2 font-[Outfit]">
          Message Transmitted
        </h3>
        <p className="text-gray-400 mb-6">
          Thank you. I&apos;ve received your message and will respond to{" "}
          <span className="text-white">{submittedEmail || "your email"}</span>{" "}
          shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-teal-400 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-teal-400 pb-1"
        >
          Send New Message
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 md:p-10 border-white/5 bg-transparent">
      <h3 className="text-2xl font-bold mb-6 font-[Outfit]">
        Initialize Contact
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">
            Identity
          </label>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-white/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">
            Coordinates (Email)
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-white/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">
            Transmission
          </label>
          <textarea
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-white/20 h-32 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Transmitting...
            </>
          ) : (
            <>
              Send Message{" "}
              <Send
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>

        {status === "error" ? (
          <p className="text-[10px] text-red-300/80 text-center uppercase tracking-wider">
            Send failed — please email leonfreshdesign@gmail.com
          </p>
        ) : (
          <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">
            Secure Connection • Response within 24h
          </p>
        )}
      </form>
    </GlassCard>
  );
};

export default ContactForm;
