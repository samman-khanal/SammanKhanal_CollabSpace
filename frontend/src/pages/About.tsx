import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";
import { Users, Target, Lightbulb, Heart, Rocket, Shield, Globe, Zap, Code2, Server, Palette, Database, ArrowRight, Sparkles } from "lucide-react";
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
//* Function for about
export default function About() {
  useDocumentTitle("About");
  //* Function for this task
  return <div className="min-h-screen bg-white">
      <Navbar />

      {}
      <section className="relative flex items-center bg-linear-to-br from-slate-50 via-white to-indigo-50/50 
      overflow-hidden py-8 sm:py-12">

        
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
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 
            text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm shadow-indigo-100/60">

              
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Our Story
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-slate-900">Built for Teams Who </span>
              <span className="bg-linear-to-r from-indigo-600 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Dream Big
              </span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
              We're on a mission to transform how teams collaborate. CollabSpace
              brings together the power of real-time communication and intuitive
              project management to help your team achieve extraordinary
              results.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-linear-to-r from-indigo-600 to-violet-600 
                text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all 
                shadow-lg shadow-indigo-300/50 active:scale-95">


                
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-sm font-semibold rounded-xl
                 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95">

                
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[{
            number: "50K+",
            label: "Active Teams"
          }, {
            number: "2M+",
            label: "Tasks Completed"
          }, {
            number: "150+",
            label: "Countries"
          }, {
            number: "99.9%",
            label: "Uptime"
          }].map((stat, i) => <Reveal key={stat.label} delay={i * 80}>
                <div className="bg-linear-to-br from-indigo-50 to-violet-50/50 rounded-2xl p-6 sm:p-8 text-center border border-indigo-100/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-2xl sm:text-4xl font-extrabold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-600">
                    {stat.label}
                  </div>
                </div>
              </Reveal>)}
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal from="left">
              <div>
                <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 text-xs 
                font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">

                  
                  <Target className="w-3.5 h-3.5" />
                  Our Mission
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
                  Empowering Teams to{" "}
                  <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Work Smarter
                  </span>
                </h2>
                <p className="text-slate-600 mb-4 text-justify leading-relaxed">
                  At CollabSpace, we believe that great things happen when teams
                  work together without barriers. Our mission is to break down
                  silos and create a unified workspace where communication flows
                  naturally and productivity thrives.
                </p>
                <p className="text-slate-600 text-justify leading-relaxed">
                  We're committed to building tools that are intuitive,
                  powerful, and accessible to teams of all sizes—from startups
                  to enterprise organizations.
                </p>
              </div>
            </Reveal>

            <Reveal from="right">
              <div className="relative">
                <div className="absolute inset-4 bg-linear-to-br from-indigo-400/20 to-violet-400/20 rounded-3xl blur-2xl" />
                <div className="relative bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl p-1 shadow-2xl shadow-indigo-300/40">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    {[{
                    icon: <Rocket className="w-5 h-5 text-blue-600" />,
                    bg: "bg-blue-100"
                  }, {
                    icon: <Users className="w-5 h-5 text-green-600" />,
                    bg: "bg-green-100"
                  }, {
                    icon: <Lightbulb className="w-5 h-5 text-violet-600" />,
                    bg: "bg-violet-100"
                  }].map((item, i) => <div key={i} className="flex items-center gap-3">
                        <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="h-2.5 bg-slate-200 rounded-full w-3/4 mb-2" />
                          <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                        </div>
                      </div>)}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-violet-400 rounded-full opacity-20 blur-2xl" />
                <div className="absolute -top-4 -left-4 w-36 h-36 bg-blue-400 rounded-full opacity-20 blur-2xl" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5" />
                Values
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Our Core Values
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
                The principles that guide everything we do
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[{
            icon: <Users className="w-7 h-7 text-blue-600" />,
            bg: "bg-blue-100",
            title: "Collaboration First",
            desc: "We believe in the power of teamwork and building features that bring people together."
          }, {
            icon: <Lightbulb className="w-7 h-7 text-violet-600" />,
            bg: "bg-violet-100",
            title: "Innovation",
            desc: "We constantly push boundaries to deliver cutting-edge solutions for modern teams."
          }, {
            icon: <Heart className="w-7 h-7 text-green-600" />,
            bg: "bg-green-100",
            title: "Customer Focus",
            desc: "Your success is our success. We listen, learn, and adapt to serve you better."
          }, {
            icon: <Shield className="w-7 h-7 text-orange-600" />,
            bg: "bg-orange-100",
            title: "Trust & Security",
            desc: "We protect your data with enterprise-grade security and transparent practices."
          }].map((v, i) => <Reveal key={v.title} delay={i * 90}>
                <div className="bg-white rounded-2xl p-5 sm:p-7 text-center border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                  <div className={`w-14 h-14 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  
                    {v.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </Reveal>)}
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal from="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-2 bg-linear-to-br from-blue-400/15 to-indigo-400/15 rounded-3xl blur-2xl" />
                <div className="relative bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-1 shadow-2xl shadow-blue-300/30">
                  <div className="bg-white rounded-xl p-6 sm:p-8 space-y-5">
                    {[{
                    date: "Q3 2024",
                    title: "The Beginning"
                  }, {
                    date: "Q4 2024",
                    title: "Core Features"
                  }, {
                    date: "Q1 2025",
                    title: "Kanban Boards"
                  }, {
                    date: "Q2 2025",
                    title: "FYP Complete"
                  }].map((item, i) => <div key={i} className="flex items-start gap-4">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-0.5">
                            {item.date}
                          </div>
                          <div className="text-sm font-semibold text-slate-900 mb-1.5">
                            {item.title}
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full w-full mb-1" />
                          <div className="h-2 bg-slate-100 rounded-full w-3/4" />
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal from="right" className="order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-white border border-purple-100 text-purple-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
                  <Globe className="w-3.5 h-3.5" />
                  Our Journey
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
                  From Frustration to{" "}
                  <span className="bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Innovation
                  </span>
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-justify text-sm sm:text-base">
                  <p>
                    CollabSpace was born from a simple frustration: switching
                    between too many tools to get work done. Our founders
                    experienced firsthand the inefficiency of juggling multiple
                    platforms for chat, tasks, and project management.
                  </p>
                  <p>
                    In 2023, we set out to create a solution that would unify
                    team collaboration under one roof—combining the best of
                    communication tools like Slack with the organizational power
                    of project management platforms like Trello.
                  </p>
                  <p>
                    Today, thousands of teams worldwide trust CollabSpace to
                    keep their work organized, their conversations flowing, and
                    their projects on track. We're just getting started.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-4 shadow-sm">
                <Users className="w-3.5 h-3.5" />
                The Builders
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Meet the Team
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
                The passionate engineers and designers who built CollabSpace
                from the ground up.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[{
            name: "Samman Khanal",
            role: "Full-Stack Lead",
            icon: <Code2 className="w-7 h-7 text-indigo-600" />,
            bg: "bg-indigo-50 border-indigo-100",
            skills: ["React", "Node.js", "Socket.io"]
          }, {
            name: "Samman Khanal",
            role: "Backend Engineer",
            icon: <Server className="w-7 h-7 text-emerald-600" />,
            bg: "bg-emerald-50 border-emerald-100",
            skills: ["MongoDB", "REST APIs", "Auth"]
          }, {
            name: "Samman Khanal",
            role: "Frontend Engineer",
            icon: <Palette className="w-7 h-7 text-pink-600" />,
            bg: "bg-pink-50 border-pink-100",
            skills: ["TypeScript", "Tailwind", "UX"]
          }, {
            name: "Samman Khanal",
            role: "DevOps & DB",
            icon: <Database className="w-7 h-7 text-amber-600" />,
            bg: "bg-amber-50 border-amber-100",
            skills: ["Docker", "CI/CD", "Schema"]
          }].map((member, i) => <Reveal key={i} delay={i * 90}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className={`w-16 h-16 ${member.bg} rounded-2xl border flex items-center justify-center mx-auto mb-4`}>
                  
                    {member.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 mb-3">
                    {member.role}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {member.skills.map(s => <span key={s} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    
                        {s}
                      </span>)}
                  </div>
                </div>
              </Reveal>)}
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-white border border-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-4 shadow-sm">
                <Rocket className="w-3.5 h-3.5" />
                Milestones
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Our Journey
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
                Key milestones in building CollabSpace.
              </p>
            </div>
          </Reveal>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-linear-to-b from-indigo-400 via-violet-300 to-indigo-200" />
            <div className="space-y-8">
              {[{
              date: "Q3 2024",
              title: "Project Kickoff",
              desc: "Team formed and project scope defined. Tech stack selected: React, Node.js, MongoDB, Socket.io."
            }, {
              date: "Q4 2024",
              title: "Core Features",
              desc: "Workspace creation, channels, real-time messaging, and authentication all shipped."
            }, {
              date: "Q1 2025",
              title: "Kanban Boards",
              desc: "Drag-and-drop task management with multiple board methodologies and real-time collaboration."
            }, {
              date: "Q2 2025",
              title: "Subscriptions & Payments",
              desc: "Khalti payment integration, subscription plans, and premium feature gating launched."
            }, {
              date: "Q2 2025",
              title: "FYP Submission",
              desc: "Project completed and submitted as Final Year Project for Bachelor's in Computer Science."
            }].map((m, i) => <Reveal key={i} delay={i * 70} from="left">
                  <div className="flex gap-6 pl-12 relative">
                    <div className="absolute left-3 top-2 w-4 h-4 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 border-2 border-white shadow-md shrink-0 -translate-x-1/2" />
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex-1 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        {m.date}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5 mb-1">
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>)}
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="relative py-12 sm:py-24 bg-linear-to-br from-indigo-700 via-violet-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[56px_56px]" />
        <div className="absolute top-0 left-1/2 w-175 h-175 bg-violet-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Why Teams Choose CollabSpace
              </h2>
              <p className="text-indigo-200 max-w-2xl mx-auto text-sm sm:text-base">
                We're more than just a tool—we're your partner in productivity
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[{
            icon: <Zap className="w-6 h-6 text-yellow-200" />,
            title: "Lightning Fast",
            desc: "Built for speed with real-time updates that keep your team in sync."
          }, {
            icon: <Shield className="w-6 h-6 text-green-200" />,
            title: "Enterprise Security",
            desc: "Bank-level encryption and compliance with global security standards."
          }, {
            icon: <Heart className="w-6 h-6 text-red-200" />,
            title: "24/7 Support",
            desc: "Our dedicated team is always here to help you succeed."
          }, {
            icon: <Globe className="w-6 h-6 text-blue-200" />,
            title: "Global Reach",
            desc: "Teams in 150+ countries collaborate seamlessly on CollabSpace."
          }, {
            icon: <Rocket className="w-6 h-6 text-purple-200" />,
            title: "Always Improving",
            desc: "Regular updates with new features based on your feedback."
          }, {
            icon: <Users className="w-6 h-6 text-indigo-200" />,
            title: "Scales With You",
            desc: "From 5 to 5,000 team members, CollabSpace grows with your business."
          }].map((item, i) => <Reveal key={item.title} delay={i * 70}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>)}
          </div>
        </div>
      </section>

      {}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Get Started Today
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Ready to{" "}
              <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Get Started?
              </span>
            </h2>
            <p className="text-slate-500 mb-8 text-sm sm:text-base leading-relaxed">
              See our plans or reach out — we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#pricing" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-300/50 active:scale-95">
                
                View Pricing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95">
                
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>;
}