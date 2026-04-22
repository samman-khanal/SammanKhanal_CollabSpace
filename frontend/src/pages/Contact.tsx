import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../layout/Navbar";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Footer } from "../layout/Footer";
import { api } from "../api/axios";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, HeadphonesIcon, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
//* Function for use reveal
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  //* Function for this task
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let observer: IntersectionObserver;
    //* Function for raf
    const raf = requestAnimationFrame(() => {
      //* Function for observer
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      }, {
        threshold
      });
      observer.observe(el);
    });
    //* Function for this task
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [threshold]);
  return {
    ref,
    visible
  };
}
//* Function for reveal
function Reveal({
  children,
  className = "",
  delay = 0,
  from = "bottom"
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const {
    ref,
    visible
  } = useReveal();
  const hidden = from === "left" ? "-translate-x-8" : from === "right" ? "translate-x-8" : "translate-y-8";
  return <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${hidden}`} ${className}`} style={{
    transitionDelay: `${delay}ms`
  }}>
      
      {children}
    </div>;
}
const SUBJECT_OPTIONS = ["General Inquiry", "Technical Support", "Billing", "Enterprise Sales", "Partnership", "Other"];
//* Function for contact
export default function Contact() {
  useDocumentTitle("Contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    subject: string;
  } | null>(null);
  //* Function for validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.subject.trim()) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message must be 1000 characters or less";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //* Function for handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/contact", formData);
      setSubmittedData({
        name: formData.name,
        subject: formData.subject
      });
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
      });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  //* Function for handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    //* Function for handle change
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) //* Function for handle change
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
  };
  //* Function for this task
  return <div className="min-h-screen bg-white">
      <Navbar />

      {}
      <section className="relative flex items-center bg-linear-to-br from-slate-50 via-white to-indigo-50/50 
      overflow-hidden py-6 sm:py-10">

        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-175 h-175 bg-linear-to-bl from-indigo-100/70 via-violet-50/50 
          to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />

          
          <div className="absolute bottom-0 left-0 w-125 h-125 bg-linear-to-tr from-blue-50/60 to-transparent 
          rounded-full translate-y-1/3 -translate-x-1/4" />

          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.025)_1px,transparent_1px),
          linear-gradient(90deg,rgba(99,102,241,0.025)_1px,transparent_1px)] bg-size-[56px_56px]" />

          
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 text-xs 
            font-semibold px-4 py-2 rounded-full mb-8 shadow-sm shadow-indigo-100/60">

              
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Get in Touch
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-slate-900">We'd love to </span>
              <span className="bg-linear-to-r from-indigo-600 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                hear
              </span>
              <span className="text-slate-900"> from</span>
              <br />
              <span className="text-slate-900">you</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Have a question, feedback, or need help? Our team is here and will
              respond within 24 hours on business days.
            </p>
          </Reveal>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[{
            icon: <Mail className="w-7 h-7 text-blue-600" />,
            bg: "bg-blue-100",
            title: "Email Us",
            value: "support@collabspace.com"
          }, {
            icon: <Phone className="w-7 h-7 text-green-600" />,
            bg: "bg-green-100",
            title: "Call Us",
            value: "+977 981-426-5591"
          }, {
            icon: <MapPin className="w-7 h-7 text-indigo-600" />,
            bg: "bg-indigo-100",
            title: "Visit Us",
            value: "Kathmandu, Nepal"
          }, {
            icon: <Clock className="w-7 h-7 text-orange-600" />,
            bg: "bg-orange-100",
            title: "Working Hours",
            value: "Mon–Fri, 9 AM–6 PM NPT"
          }].map((card, i) => <Reveal key={card.title} delay={i * 80}>
                <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl p-5 sm:p-7 text-center border
                 border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">

                
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${card.bg} rounded-2xl flex items-center justify-center 
                    mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  
                    {card.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {card.value}
                  </p>
                </div>
              </Reveal>)}
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {}
            <Reveal from="left">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-10 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                  Send Us a{" "}
                  <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Message
                  </span>
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mb-7">
                  Fill out the form and our team will get back to you within 24
                  hours.
                </p>

                {isSubmitted && submittedData ? <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Thank you, {submittedData.name}!
                    </h3>
                    <p className="text-slate-600 mb-2">
                      Your message about{" "}
                      <span className="font-semibold text-slate-800">
                        "{submittedData.subject}"
                      </span>{" "}
                      has been received.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                      We'll respond within 24 hours on business days.
                    </p>
                    <button onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedData(null);
                }} className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-200">
                    
                      Send Another Message
                    </button>
                  </div> : <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField label="Full Name" error={errors.name}>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" className={inputClass(!!errors.name)} />
                      
                      </FormField>
                      <FormField label="Email Address" error={errors.email}>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" className={inputClass(!!errors.email)} />
                      
                      </FormField>
                    </div>

                    <FormField label="Subject" error={errors.subject}>
                      <select name="subject" value={formData.subject} onChange={handleChange} className={inputClass(!!errors.subject)}>
                      
                        {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>
                            {opt}
                          </option>)}
                      </select>
                    </FormField>

                    <FormField label="Message" error={errors.message}>
                      <div className="relative">
                        <textarea name="message" value={formData.message} onChange={handleChange} rows={6} maxLength={1000} placeholder="Tell us more about your inquiry…" className={`${inputClass(!!errors.message)} resize-none`} />
                      
                        <span className={`absolute bottom-2 right-3 text-xs ${formData.message.length > 900 ? "text-red-500" : "text-slate-400"}`}>
                        
                          {formData.message.length}/1000
                        </span>
                      </div>
                    </FormField>

                    <button type="submit" disabled={isSubmitting} className={`w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md ${isSubmitting ? "bg-indigo-400 text-white cursor-not-allowed" : "bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200 active:scale-95"}`}>
                    
                      {isSubmitting ? <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </> : <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>}
                    </button>
                  </form>}
              </div>
            </Reveal>

            {}
            <Reveal from="right">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 sm:mb-3">
                  Other Ways to{" "}
                  <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Reach Us
                  </span>
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-8">
                  Choose the option that works best for you.
                </p>

                <div className="space-y-4">
                  <ReachCard icon={<HeadphonesIcon className="w-6 h-6 text-blue-600" />} iconBg="bg-blue-100" title="Support Center" description="Browse our help docs, tutorials, and FAQs for quick answers." action="Visit Help Center" href="#faq" />
                  
                  <ReachCard icon={<MessageSquare className="w-6 h-6 text-violet-600" />} iconBg="bg-violet-100" title="Live Chat" description="Instant help from our team. Mon–Fri, 9 AM–6 PM NPT." action="Start Live Chat" onClick={() => toast.info("Live chat coming soon! For now, please use the form or email us.")} />
                  
                  <ReachCard icon={<Mail className="w-6 h-6 text-indigo-600" />} iconBg="bg-indigo-100" title="Enterprise Sales" description="Custom solutions for your organization. Let's talk." action="Contact Sales" href="mailto:sales@collabspace.com" />
                  
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {}
      <section id="faq" className="relative py-12 sm:py-24 bg-linear-to-br from-indigo-700 via-violet-700 to-purple-800 overflow-hidden">
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[56px_56px]" />
        <div className="absolute top-0 left-1/2 w-175 h-175 bg-violet-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-indigo-200 max-w-2xl mx-auto text-sm sm:text-base">
                Quick answers to questions you may have about CollabSpace
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-4">
            {[{
            question: "What is your response time?",
            answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line directly."
          }, {
            question: "Do you offer custom enterprise solutions?",
            answer: "Yes! We work with enterprise clients to create custom solutions tailored to their specific needs. Contact our sales team to learn more."
          }, {
            question: "Can I schedule a demo?",
            answer: "Absolutely! You can request a personalized demo by filling out the contact form above or by calling our sales team directly."
          }, {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards and Khalti for local payments. All transactions are processed securely with bank-level encryption."
          }].map((item, i) => <Reveal key={i} delay={i * 80}>
                <FAQItem question={item.question} answer={item.answer} />
              </Reveal>)}
          </div>
        </div>
      </section>

      <Footer />
    </div>;
}
//* Function for reach card
function ReachCard({
  icon,
  iconBg,
  title,
  description,
  action,
  href,
  onClick
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  action: string;
  href?: string;
  onClick?: () => void;
}) {
  const actionEl = href ? <a href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
    
      {action}
      <ArrowRight className="w-4 h-4" />
    </a> : <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
    
      {action}
      <ArrowRight className="w-4 h-4" />
    </button>;
  return <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3">
            {description}
          </p>
          {actionEl}
        </div>
      </div>
    </div>;
}
//* Function for input class
const inputClass = (hasError: boolean) => `w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl outline-none transition-all
   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
   ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-400"}`;
//* Function for form field
function FormField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>;
}
//* Function for faqitem
function FAQItem({
  question,
  answer
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  //* Function for this task
  return <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-3">
        
        <span className="text-sm sm:text-base font-semibold text-white">
          {question}
        </span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-indigo-200 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
        
        <div className="px-5 sm:px-6 pb-4 sm:pb-5 border-t border-white/10">
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed pt-4">
            {answer}
          </p>
        </div>
      </div>
    </div>;
}