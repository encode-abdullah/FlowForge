import { useState } from "react";

const imgLogo = "/assets/figma/Logo.png";
const imgLaptop = "/assets/figma/Laptop.png";
const imgMan = "/assets/figma/Man.png";
const imgGoDaddy = "/assets/figma/godaddy-new-2020-seeklogo 1.png";
const imgPana = "/assets/figma/image 1.png";
const imgXOR = "/assets/figma/image 2.png";
const imgHomeAdvisor = "/assets/figma/pngfind.com-homeadvisor-logo-png-6662676 1.png";

const ChevronDown = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 ml-1 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUp = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const CheckIcon = () => (
  <span className="flex-shrink-0 w-6 h-6 bg-[#20c997] rounded-full flex items-center justify-center">
    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

const faqItems = [
  {
    q: "What Makes FlowForge Different from other SaaS Platforms?",
    a: "FlowForge replaces scattered tools with one adaptable platform that automates work, keeps teams aligned in real time and scales effortlessly with your business.",
  },
  {
    q: "How does platform integrate with tools my team already uses?",
    a: "FlowForge offers seamless integrations with popular tools like Slack, Google Workspace, Microsoft 365, and hundreds more through our open API.",
  },
  {
    q: "Is there a limit to number of user, projects or data we can manage",
    a: "No. All plans include unlimited users, projects, and data storage. Scale as your team grows without worrying about hitting limits.",
  },
  {
    q: "How secure is FlowForge and what compliance standard does it support?",
    a: "FlowForge is SOC 2 Type II certified, GDPR compliant, and uses enterprise-grade encryption at rest and in transit.",
  },
  {
    q: "Can we customize features or workflows to match our work needs?",
    a: "Yes. FlowForge offers fully customizable workflows, dashboards, and automation rules to fit your unique business processes.",
  },
  {
    q: "Does FlowForge Offer onboarding, training or customer support for teams?",
    a: "We offer dedicated onboarding, live training sessions, comprehensive documentation, and 24/7 customer support for all plans.",
  },
  {
    q: "I can try platform before applying for subscription?",
    a: "Absolutely. Start with a free trial to explore all features before committing to any plan.",
  },
];

const pricingPlans = [
  {
    name: "Development",
    price: "$50",
    features: ["2 Printing and typesetting", "1 Standard dummy tester"],
    featured: false,
  },
  {
    name: "IT & Software",
    price: "$100",
    features: ["2 Printing and typesetting", "2 Standard dummy tester", "2 leap into electronics", "2 containing them"],
    featured: true,
  },
  {
    name: "Business",
    price: "$115",
    features: ["3 Printing and typesetting", "3 Standard dummy tester"],
    featured: false,
  },
];

const testimonials = [
  {
    text: "FlowForge transformed how our entire organization collaborates, plan is intuitive and their team behind it all work.",
    name: "Mariana Molly",
    role: "Senior Engineer, Medium Team",
  },
  {
    text: "Saving hours every week with FlowForge's powerful workflows. Workflows are easy to manage and control.",
    name: "Victoria Wings",
    role: "Content Strategist",
  },
  {
    text: "Our team has been using FlowForge for over a year and we've seen a 40% increase in productivity across the board.",
    name: "James Roy",
    role: "Head of Operations",
  },
  {
    text: "FlowForge replaced 5 different tools we were using. The consolidation alone saved us thousands per year.",
    name: "Sarah Kim",
    role: "CTO, Startup Inc",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#f3ede2] text-[#070127] font-sans overflow-x-hidden">

      {/* Header */}
      <header className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={imgLogo} alt="FlowForge" className="h-10 w-auto" />
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#1a1a2e]">
          <button className="flex items-center gap-0.5 hover:opacity-70 transition">Features <ChevronDown /></button>
          <button className="flex items-center gap-0.5 hover:opacity-70 transition">Solution <ChevronDown /></button>
          <button className="flex items-center gap-0.5 hover:opacity-70 transition">Enterprise <ChevronDown /></button>
          <button className="flex items-center gap-0.5 hover:opacity-70 transition">Resources <ChevronDown /></button>
          <a href="#" className="hover:opacity-70 transition">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden md:block bg-[#d8d1c7] text-[#1a1a2e] px-5 py-2.5 rounded-[10px] font-medium text-sm border border-[#c4bcaa] hover:bg-[#cdc5b8] transition">
            Request a Demo
          </button>
          <button className="bg-[#3f3f3f] text-white px-5 py-2.5 rounded-[10px] font-medium text-sm hover:bg-[#2a2a2a] transition">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-xl">
          <h1
            className="text-[3.2rem] leading-[1.1] font-bold text-[#070127] mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Make FlowForge your Team's Collective Brain
          </h1>
          <p className="text-lg text-[#2E2F38] mb-8">
            Move Faster, Work Smarter with apps and AI at your side
          </p>
          <div className="flex items-center gap-4 mb-10">
            <button className="bg-[#6f5ae6] text-white px-7 py-3 rounded-[10px] font-semibold text-[15px] hover:bg-[#5d4bd4] transition">
              Get Started
            </button>
            <button className="border-2 border-[#070127] text-[#070127] px-7 py-3 rounded-[10px] font-semibold text-[15px] hover:bg-[#070127] hover:text-white transition">
              Find your Subscription
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[560px]">
            <img src={imgLaptop} alt="FlowForge Dashboard" className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-8">
        <p className="text-center text-sm font-medium text-[#3f3f3f] mb-6">
          Trusted by World's most Favourite Brands
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          <span className="text-2xl font-bold text-[#4285F4]" style={{ fontFamily: "sans-serif" }}>Google</span>
          <span className="text-xl font-bold text-[#7B68EE]">ClickUp</span>
          <img src={imgGoDaddy} alt="GoDaddy" className="h-7 object-contain" />
          <span className="text-xl font-bold text-[#15C39A]">grammarly</span>
          <span className="text-xl font-bold text-[#00A4EF]">Microsoft</span>
        </div>
      </section>

      {/* Dashboard Mockup Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 w-64 text-center">flowforge.com/dashboard</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Left sidebar */}
            <div className="bg-[#f7f8fb] p-4 border-r border-gray-200 md:col-span-1 hidden md:block">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#6f5ae6] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span className="font-semibold text-sm">FD</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  Dashboard
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  Analytics
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  Settings
                </div>
              </div>
            </div>
            {/* Main content */}
            <div className="p-6 md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Operational Performance</h4>
              <p className="text-xs text-gray-400 mb-4">WorkFlow Usage</p>
              <div className="flex items-end gap-1 mb-6 h-32">
                {[40, 65, 45, 80, 55, 70, 50, 90, 60, 75, 55, 85, 45, 70, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#6f5ae6] rounded-t" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <span>Daily Operations Overview</span>
                <span>Zoom</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#6f5ae6]">5,461</div>
                  <div className="text-xs text-gray-400">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#FF7049]">8,085</div>
                  <div className="text-xs text-gray-400">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#20c997]">140</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#FFBB00]">120</div>
                  <div className="text-xs text-gray-400">Contacts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionize Your Experience */}
      <section className="bg-white py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#f3ede2] to-[#e8e0d4] rounded-full blur-3xl opacity-60"></div>
              <img src={imgMan} alt="Team member" className="relative w-[320px] h-[320px] object-cover rounded-full shadow-xl" />
            </div>
          </div>
          <div className="max-w-lg">
            <h2
              className="text-[2rem] font-bold text-[#070127] mb-5"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Revolutionize Your Experience
            </h2>
            <p className="text-[15px] text-[#4a4a5a] leading-relaxed mb-8">
              Designed with cutting-edge technology and user friendly interfaces, this product is perfect for individuals and businesses looking to streamline their operations and increase productivity.
            </p>
            <p className="text-[15px] text-[#4a4a5a] leading-relaxed mb-8">
              With a range of features and customizable options, our digital products can be tailored to meet the unique needs of each user.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-[#5a5881]">
                <CheckIcon /> Operational performance at a glance
              </li>
              <li className="flex items-center gap-3 text-[#5a5881]">
                <CheckIcon /> Sessions by device and trends
              </li>
              <li className="flex items-center gap-3 text-[#5a5881]">
                <CheckIcon /> Exportable reports and insights
              </li>
            </ul>
            <a href="#" className="text-[#6f5ae6] font-semibold text-[15px] hover:underline">
              Learn More About FlowForge
            </a>
          </div>
        </div>
      </section>

      {/* Manage your Finances */}
      <section className="bg-[#f3ede2] py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-lg">
            <h2
              className="text-[2rem] font-bold text-[#070127] mb-5 leading-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Manage your Finances,<br />Organize you Schedule
            </h2>
            <p className="text-[15px] text-[#4a4a5a] leading-relaxed mb-6">
              Introducing our latest digital Products designed to revolutionize the way you work, plan and collaborate. This cutting-edge technology offers seamless integration and enhanced performance, providing unparalleled performance and speed.
            </p>
            <p className="text-[15px] text-[#4a4a5a] leading-relaxed mb-8">
              Our digital product is the perfect solution for anyone looking to boost their productivity, creativity, and overall efficiency. Try it out today and experience it yourself
            </p>
            <a href="#" className="text-[#6f5ae6] font-semibold text-[15px] hover:underline">
              Learn More About Organize
            </a>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[520px]">
              <img src={imgLaptop} alt="FlowForge Dashboard" className="w-full h-auto drop-shadow-xl rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#f3ede2] py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <h2
            className="text-[2.2rem] font-bold text-[#070127] text-center mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Your Package, Your Benefits
          </h2>
          <p className="text-center text-[15px] text-[#4a4a5a] mb-16 max-w-xl mx-auto">
            Features and customizable options, digital products can be tailored to meet the unique needs of each user.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 w-full max-w-[320px] transition-transform ${
                  plan.featured
                    ? "bg-[#1a1a2e] text-white scale-105 shadow-2xl z-10"
                    : "bg-[#d8d1c7] text-[#070127] shadow-lg"
                } ${i === 0 ? "md:rotate-[-4deg]" : i === 2 ? "md:rotate-[4deg]" : ""}`}
              >
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="mt-1">
                        <CheckIcon />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                    plan.featured
                      ? "bg-white text-[#1a1a2e] hover:bg-gray-100"
                      : "bg-[#070127] text-white hover:bg-[#1a1a3e]"
                  }`}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f3ede2] py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <h2
            className="text-[2.2rem] font-bold text-[#070127] text-center mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            What our Customers Say
          </h2>
          <p className="text-center text-[15px] text-[#4a4a5a] mb-14 max-w-xl mx-auto">
            Our Customers trust FlowForge to streamline operations boost efficiency and turn real-time data into smart decisions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`bg-[#f7f3ec] rounded-2xl p-6 shadow-md border border-[#e8e0d4] ${
                  i % 2 === 0 ? "md:-rotate-2" : "md:rotate-2"
                }`}
              >
                <p className="text-sm text-[#4a4a5a] mb-4 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d8d1c7] flex items-center justify-center text-sm font-bold text-[#070127]">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#070127]">{t.name}</div>
                    <div className="text-xs text-[#888]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#151515] text-white py-20">
        <div className="max-w-[800px] mx-auto px-6 md:px-10">
          <h2
            className="text-[2.2rem] font-bold text-center mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Most Asked Questions
          </h2>
          <p className="text-center text-[15px] text-[#9a9aab] mb-14">
            Find quick answers about how FlowForge works and how it actually helps your team
          </p>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="border-b border-[#333] pb-4"
              >
                <button
                  className="w-full flex items-center justify-between text-left py-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[15px] font-medium pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronUp /> : <ChevronDown />}
                </button>
                {openFaq === i && (
                  <p className="text-[14px] text-[#9a9aab] leading-relaxed pb-2">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#151515] text-white py-16 border-t border-[#333]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Get Started today
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#d8d1c7] text-[#1a1a2e] px-6 py-3 rounded-[10px] font-medium text-[15px] hover:bg-[#cdc5b8] transition border border-[#c4bcaa]">
              Start your free Trial
            </button>
            <button className="bg-[#3f3f3f] text-white px-6 py-3 rounded-[10px] font-medium text-[15px] hover:bg-[#2a2a2a] transition">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Full Footer */}
      <footer className="bg-[#151515] text-white py-16 border-t border-[#333]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <img src={imgLogo} alt="FlowForge" className="h-8 w-auto mb-6 brightness-0 invert" />
              <p className="text-[15px] text-[#9a9aab]">Empowering Distributors Worldwide</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="bg-[#1e1e1e] border border-[#444] rounded-lg px-4 py-2.5 text-sm text-white flex-1 md:w-64 placeholder-[#666] focus:outline-none focus:border-[#6f5ae6]"
                />
                <button className="bg-[#3f3f3f] text-white p-2.5 rounded-lg hover:bg-[#2a2a2a] transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <img src={imgGoDaddy} alt="GoDaddy" className="h-5 object-contain opacity-50" />
                <img src={imgPana} alt="Pana" className="h-4 object-contain opacity-50" />
                <img src={imgXOR} alt="XOR" className="h-4 object-contain opacity-50" />
                <img src={imgHomeAdvisor} alt="HomeAdvisor" className="h-4 object-contain opacity-50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#333] pt-12">
            <div>
              <h4 className="font-semibold text-sm mb-4">Solutions</h4>
              <ul className="space-y-2.5 text-sm text-[#9a9aab]">
                <li><a href="#" className="hover:text-white transition">Prospect</a></li>
                <li><a href="#" className="hover:text-white transition">Monitor</a></li>
                <li><a href="#" className="hover:text-white transition">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-[#9a9aab]">
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Customer</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
                <li><a href="#" className="hover:text-white transition">Video tutorial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-[#9a9aab]">
                <li><a href="#" className="hover:text-white transition">About us</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Services</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#333] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#666]">
            <p>&copy; 2025 FlowForge LLC. A Solutione company</p>
            <p className="mt-2 md:mt-0">Automate smarter. Work faster. Accelerate growth.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
