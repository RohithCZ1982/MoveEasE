'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import {
  Home, Building2, Package, Car, Warehouse, Globe, Shield,
  MapPin, Star, ChevronRight, Phone, Mail, Menu, X,
  ArrowRight, Check, Truck, Users, Award, Clock, Quote,
  Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, setStarted }
}

const services = [
  {
    icon: Home,
    title: 'Home Shifting',
    desc: 'Seamless residential moves with professional packing and careful handling of all your belongings.',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
  },
  {
    icon: Building2,
    title: 'Office Relocation',
    desc: 'Minimize business downtime with our efficient office and corporate relocation services.',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: Package,
    title: 'Packing Services',
    desc: 'Premium packing materials and expert techniques to ensure zero damage in transit.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Car,
    title: 'Vehicle Transport',
    desc: 'Safe and insured transportation of cars and two-wheelers across India.',
    color: 'from-green-500 to-green-700',
    bg: 'bg-green-50',
  },
  {
    icon: Warehouse,
    title: 'Storage Solutions',
    desc: 'Secure, climate-controlled warehousing for short or long-term storage needs.',
    color: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50',
  },
  {
    icon: Globe,
    title: 'International Moving',
    desc: 'Complete documentation and logistics support for overseas relocations.',
    color: 'from-indigo-500 to-indigo-700',
    bg: 'bg-indigo-50',
  },
]

const steps = [
  { step: '01', title: 'Request a Quote', desc: 'Fill out our simple online form or call us. Get an instant estimate within minutes.', icon: Phone },
  { step: '02', title: 'We Survey & Plan', desc: 'Our experts visit your location to create a customized moving plan that fits your needs.', icon: MapPin },
  { step: '03', title: 'Pack & Move', desc: 'Professional packers handle everything with care while you relax and watch the magic happen.', icon: Package },
  { step: '04', title: 'Safe Delivery', desc: 'Your belongings arrive safely, fully assembled and placed exactly where you want them.', icon: Check },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Bangalore → Mumbai',
    text: 'Move EasE made our interstate move completely stress-free. The team was professional, punctual, and handled everything with great care. Highly recommend!',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Rajesh Patel',
    location: 'Delhi → Pune',
    text: 'Outstanding service! They moved our entire office in just one weekend with zero disruption to our business. The digital quotation system is brilliant.',
    rating: 5,
    avatar: 'RP',
  },
  {
    name: 'Anitha Krishnan',
    location: 'Chennai → Hyderabad',
    text: 'From packing to unpacking, everything was perfect. The online tracking and instant invoicing made the whole process very transparent and professional.',
    rating: 5,
    avatar: 'AK',
  },
]

const cities = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi',
  'Chandigarh', 'Lucknow', 'Bhopal', 'Surat', 'Indore',
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const stat1 = useCounter(5000)
  const stat2 = useCounter(98)
  const stat3 = useCounter(50)
  const stat4 = useCounter(12)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          stat1.setStarted(true)
          stat2.setStarted(true)
          stat3.setStarted(true)
          stat4.setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [stat1, stat2, stat3, stat4])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-[#1e3a5f]/90 backdrop-blur-sm'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" className={scrolled ? 'text-[#1e3a5f]' : 'text-white'} />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Services', 'How It Works', 'Cities', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    scrolled ? 'text-gray-700 hover:text-blue-900' : 'text-white/90 hover:text-white'
                  )}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'text-sm',
                    !scrolled && 'border-white text-white hover:bg-white hover:text-blue-900 bg-transparent'
                  )}
                >
                  Login
                </Button>
              </Link>
              <Link href="/quotations/new">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Get Free Quote
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={scrolled ? 'text-gray-800' : 'text-white'} />
              ) : (
                <Menu className={scrolled ? 'text-gray-800' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {['Services', 'How It Works', 'Cities', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                  className="block text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/quotations/new" className="flex-1">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Get Quote</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e3d] via-[#1e3a5f] to-[#0d2040]" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 animate-pulse"
              style={{
                width: `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                background: i % 2 === 0 ? '#f97316' : '#3b82f6',
                top: `${10 + i * 15}%`,
                left: `${5 + i * 16}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${3 + i}s`,
              }}
            />
          ))}

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* 3D-style Box Illustration */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            {/* Large 3D Box */}
            <path d="M100 150L200 100L300 150V250L200 300L100 250V150Z" fill="#1e40af" stroke="#3b82f6" strokeWidth="2"/>
            <path d="M100 150L200 200L300 150" stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
            <path d="M200 200V300" stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
            <path d="M100 150L200 200L200 300L100 250V150Z" fill="#1e3a8a" opacity="0.8"/>
            <path d="M300 150L200 200L200 300L300 250V150Z" fill="#1e40af" opacity="0.6"/>
            {/* Speed lines */}
            <line x1="320" y1="130" x2="370" y2="130" stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
            <line x1="330" y1="148" x2="370" y2="148" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
            <line x1="340" y1="166" x2="370" y2="166" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            <line x1="350" y1="184" x2="370" y2="184" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-sm font-medium">India's Most Trusted Packers & Movers</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Moving Made
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600"> Effortless</span>
          </h1>

          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Premium packing, safe relocation, and a stress-free experience — delivered with precision and care across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-white/5 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm"
              >
                How It Works
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            {[
              { icon: Shield, text: 'Fully Insured' },
              { icon: Award, text: 'ISO Certified' },
              { icon: Clock, text: '24/7 Support' },
              { icon: Star, text: '4.9★ Rated' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-orange-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-[#1e3a5f] to-[#0f2040]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: stat1.count, suffix: '+', label: 'Happy Customers', icon: Users },
            { value: stat2.count, suffix: '%', label: 'Satisfaction Rate', icon: Star },
            { value: stat3.count, suffix: '+', label: 'Cities Covered', icon: MapPin },
            { value: stat4.count, suffix: '+', label: 'Years Experience', icon: Award },
          ].map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-4xl font-bold text-white">
                {value.toLocaleString()}{suffix}
              </p>
              <p className="text-blue-300 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Comprehensive moving solutions tailored to your every need — from local shifts to international relocations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform', service.bg)}>
                    <Icon className="h-7 w-7 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{service.desc}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">How It Works</h2>
            <p className="text-gray-500">Four simple steps to a stress-free move</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="relative text-center group">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-300 to-blue-200 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-orange-500 text-3xl font-black mb-2 block">{step.step}</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-24 bg-gradient-to-br from-[#1e3a5f] to-[#0f2040]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">Why Move EasE</span>
              <h2 className="text-4xl font-bold text-white mt-2 mb-6">
                Moving Forward with <span className="text-orange-400">Trust & Technology</span>
              </h2>
              <p className="text-blue-200 mb-8 leading-relaxed">
                We combine the reliability of experienced movers with cutting-edge technology to give you complete control and transparency throughout your move.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Digital Quotations', desc: 'Get instant, transparent quotes with itemized breakdowns' },
                  { title: 'Real-time Tracking', desc: 'Track your belongings every step of the way' },
                  { title: 'Insurance Coverage', desc: 'Comprehensive transit insurance for complete peace of mind' },
                  { title: 'Trained Professionals', desc: 'Background-verified, expert packing and moving teams' },
                  { title: 'Zero Hidden Charges', desc: 'Complete pricing transparency, no surprise fees ever' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-blue-300 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Truck, label: 'Modern Fleet', value: '5+ Vehicles' },
                { icon: Users, label: 'Expert Team', value: '20+ Staff' },
                { icon: Shield, label: 'Fully Insured', value: '100% Coverage' },
                { icon: Award, label: 'Reliable', value: '*****' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <Icon className="h-8 w-8 text-orange-400 mb-3" />
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-blue-300 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Customer Stories</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-blue-900 opacity-20 mb-3" />
                <p className="text-gray-600 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-orange-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Our Coverage</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Cities We Serve</h2>
            <p className="text-gray-500">Serving 50+ cities across India with the same quality and care</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-default"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                {city}
              </div>
            ))}
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="font-bold">+35 more cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${150 + i * 100}px`,
                height: `${150 + i * 100}px`,
                top: `${-20 + i * 30}%`,
                right: `${-5 + i * 25}%`,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Make Your Move?
          </h2>
          <p className="text-orange-100 text-xl mb-10">
            Join 5000+ satisfied customers who trusted Move EasE for their perfect move.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-bold rounded-xl shadow-xl">
                Get Free Quote Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+919876543210">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Phone className="mr-2 h-5 w-5" />
                +91 98765 43210
              </Button>
            </a>
          </div>
          <p className="text-orange-100 text-sm mt-6">
            ✓ Free survey &nbsp; ✓ Instant quote &nbsp; ✓ No obligation
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0f1e3d] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <Logo size="md" className="mb-4 text-white" />
              <p className="text-blue-300 leading-relaxed max-w-sm">
                India's most trusted packers and movers — combining cutting-edge technology with professional moving expertise for a seamless relocation experience.
              </p>
              <div className="flex gap-4 mt-6">
                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                {['Services', 'How It Works', 'Cities', 'About Us', 'Contact', 'Blog', 'Careers'].map((link) => (
                  <a key={link} href="#" className="block text-blue-300 hover:text-orange-400 text-sm transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Contact Us</h4>
              <div className="space-y-3">
                <a href="tel:+919876543210" className="flex items-center gap-3 text-blue-300 hover:text-white text-sm">
                  <Phone className="h-4 w-4 text-orange-400" />
                  +91 98765 43210
                </a>
                <a href="mailto:info@moveease.in" className="flex items-center gap-3 text-blue-300 hover:text-white text-sm">
                  <Mail className="h-4 w-4 text-orange-400" />
                  info@moveease.in
                </a>
                <div className="flex items-start gap-3 text-blue-300 text-sm">
                  <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  123, Business Park, Whitefield, Bangalore — 560066
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-white mb-3 text-sm">Admin Portal</h4>
                <Link href="/login">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                    Login to Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-400 text-sm">
              © 2025 Move EasE. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-blue-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link href="/login">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-2xl rounded-full px-6 py-3 font-semibold">
            <Phone className="mr-2 h-4 w-4" />
            Get Quote
          </Button>
        </Link>
      </div>
    </div>
  )
}
