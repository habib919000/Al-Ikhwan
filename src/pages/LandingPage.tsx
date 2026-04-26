import React from 'react';
import { 
  Users, 
  Heart, 
  Shield, 
  ArrowRight, 
  Star, 
  Globe, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Users className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Al-Ikhwan</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a>
            <a href="#values" className="hover:text-indigo-600 transition-colors">Core Values</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>

          <button 
            onClick={onLoginClick}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group"
          >
            Member Login
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold mb-6 border border-indigo-100">
              <Star size={14} fill="currentColor" />
              Empowering Community Through Unity
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
              A Platform for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">
                Better Management
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-12 leading-relaxed">
              Simplify organization, financial tracking, and communication for your community. 
              Join Al-Ikhwan and experience a seamless way to manage members and events.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onLoginClick}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Get Started
                <ChevronRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Active Members', value: '500+' },
            { label: 'Events Hosted', value: '120+' },
            { label: 'Cities Present', value: '12+' },
            { label: 'Impact Score', value: '98%' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl font-black text-indigo-600 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features/Values */}
      <section id="values" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4">Why Choose Al-Ikhwan?</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
              We provide the tools you need to build a stronger, more organized community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure & Private',
                desc: 'Your community data is protected with industry-standard encryption and security protocols.',
                icon: <Shield className="text-indigo-600" size={32} />,
                color: 'bg-indigo-50'
              },
              {
                title: 'Financial Transparency',
                desc: 'Track dues, expenses, and collections with full visibility for all authorized members.',
                icon: <Globe className="text-blue-600" size={32} />,
                color: 'bg-blue-50'
              },
              {
                title: 'Easy Communication',
                desc: 'Send announcements and schedule events instantly with our integrated notification system.',
                icon: <Heart className="text-rose-600" size={32} />,
                color: 'bg-rose-50'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-2xl hover:shadow-indigo-50 bg-white group"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold">Al-Ikhwan</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                Building stronger communities through better management and transparent cooperation.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-slate-200">Company</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-slate-200">Connect</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Al-Ikhwan Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
