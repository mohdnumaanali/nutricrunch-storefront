import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle2, AlertCircle, Instagram, ArrowUpRight } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      setErrorMessage('Please provide your name, phone number, and inquiry message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit inquiry.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Thank you! Your message has been received by our Hanamkonda care team. We will call or WhatsApp you shortly.');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      setErrorMessage('Network error submitting inquiry. Please try messaging us on WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
          Direct Customer Care
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D24]">
          Get in Touch with NutriCrunch
        </h1>
        <p className="text-xs sm:text-sm text-[#5D675A]">
          We are located in Hanamkonda, Warangal. Reach us for questions about your order, ingredients, bulk festival gifting, or local delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#123D24] uppercase tracking-wider border-b border-[#123D24]/10 pb-3">
              Store & Kitchen Details
            </h3>

            <div className="space-y-4 text-xs text-[#20251F]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#56783B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123D24] font-semibold">Store Address:</strong>
                  <span className="text-[#5D675A] leading-relaxed">
                    Shop #4, Sri Rama Towers, Main Road, Hanamkonda, Warangal, Telangana - 506001
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#56783B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123D24] font-semibold">Phone Inquiries:</strong>
                  <a
                    href="tel:+919154797936"
                    className="font-mono text-[#123D24] font-medium hover:text-[#56783B]"
                  >
                    +91 9154797936
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#56783B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123D24] font-semibold">Email:</strong>
                  <a
                    href="mailto:care@nutricrunch.in"
                    className="text-[#123D24] font-medium hover:text-[#56783B]"
                  >
                    care@nutricrunch.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#56783B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123D24] font-semibold">Working Hours:</strong>
                  <span className="text-[#5D675A]">
                    Monday – Saturday: 9:00 AM – 8:00 PM IST
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action Box */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <h4 className="font-bold text-sm text-[#123D24]">Need Immediate Assistance?</h4>
            <p className="text-xs text-[#5D675A]">
              Connect with our team directly on WhatsApp for quick answers and custom orders.
            </p>
            <a
              href="https://wa.me/919154797936?text=Hello%20NutriCrunch,%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-2.5 px-4 bg-[#25D366] text-white font-bold text-xs rounded-xl hover:bg-[#1EBE5D] transition-colors"
            >
              Open WhatsApp Chat
            </a>
          </div>

          {/* Instagram Social Media Card */}
          <div className="bg-gradient-to-br from-[#FFF9E9] to-[#F5ECCE] border border-[#123D24]/10 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 bg-[#123D24] text-[#D8B84B] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#123D24]">Follow Us on Instagram</h4>
            <p className="text-xs text-[#5D675A]">
              Behind the scenes, fresh batch updates, and healthy recipe ideas.
            </p>
            <a
              href="https://instagram.com/nutricrunch_wgl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#123D24] text-[#FFF9E9] font-bold text-xs rounded-xl hover:bg-[#0E2E1B] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#D8B84B]" />
              <span>@nutricrunch_wgl</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#123D24] border-b border-[#123D24]/10 pb-3">
            Send an Inquiry or Feedback
          </h2>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  Your Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  Mobile Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs font-mono bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  Email Address <span className="text-xs font-normal text-[#5D675A]">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  Subject / Reason
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Bulk Order, Product Inquiry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Your Message <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we assist you?"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
