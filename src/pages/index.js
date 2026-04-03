import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

const HomeStatsSection = dynamic(() => import('../components/HomeStatsSection'));
const HomeFeaturesSection = dynamic(() => import('../components/HomeFeaturesSection'));
const HomeAboutSection = dynamic(() => import('../components/HomeAboutSection'));

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sectionIds = ['home', 'features', 'about'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el) => el !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        threshold: 0.4,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      <Head>
        <title>MANO – Medical AI Nutrition &amp; Online Consultation</title>
        <meta
          name="description"
          content="MANO helps you eat better, manage diabetes and follow your doctor’s advice in one simple place – with clear meal plans, health insights and easy‑to‑follow guidance."
        />
      </Head>

      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-gradient-to-br from-[#0F2944] via-[#0F2944] to-[#5B97B0] text-white overflow-hidden"
      >
        {/* Navbar over hero */}
        <Navbar activeSection={activeSection} />

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5B97B0] opacity-30 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#7DC3B5] opacity-40 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#62BABB] bg-opacity-95 text-[#0F2944] text-xs font-semibold px-3 py-1 rounded-full mb-6 shadow">
              MANO · Medical AI Nutrition &amp; Online Consultation
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="block">AI‑Driven Diets.</span>
              <span className="block text-[#62BABB]">Doctor‑Driven Care.</span>
            </h1>
            <p className="text-lg text-[#E3F5F4] mb-8 max-w-2xl leading-relaxed">
              MANO helps you eat better, manage diabetes and follow your doctor’s advice in
              one simple place. You get clear meal plans, easy‑to‑read health insights and
              friendly guidance, so you always know what to do next for your health.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#62BABB] text-[#0F2944] font-semibold px-6 py-3 rounded-full hover:bg-[#7DC3B5] transition-colors shadow-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 bg-[#62BABB] text-[#0F2944] font-semibold px-6 py-3 rounded-full hover:bg-[#7DC3B5] transition-colors shadow-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-white/5 text-white font-semibold px-6 py-3 rounded-full border border-white/40 hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <HomeStatsSection />

      {/* Features Section */}
      <HomeFeaturesSection />

      {/* About Section */}
      <HomeAboutSection />

      {/* CTA Section */}
      <section className="bg-[#F4FBFA] border-t border-slate-100 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-[#0F2944] mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-slate-600 mb-8">
            Join thousands of users who are taking control of their health with MANO‑powered
            nutrition, diabetes and EHR tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="bg-[#62BABB] text-[#0F2944] font-semibold px-8 py-3 rounded-full hover:bg-[#7DC3B5] transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="border border-[#0F2944] text-[#0F2944] font-semibold px-8 py-3 rounded-full hover:bg-[#0F2944] hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

