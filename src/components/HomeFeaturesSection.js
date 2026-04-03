import { Activity, FileText, HeartPulse, ShieldCheck, Stethoscope, Utensils } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Unified Health Records',
    description:
      'Keep your medical history, conditions and important notes together so you and your doctor always see the full picture without searching through old papers and messages.',
  },
  {
    icon: <HeartPulse className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Health Risk & Diabetes Assessment',
    description:
      'Answer a few simple questions and see an easy‑to‑read view of your health and diabetes risk, so you know what to watch and what small changes can help.',
  },
  {
    icon: <Utensils className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Nutri‑AI Diet Plans',
    description:
      'Get meal plans that match your health needs, food choices and daily routine, with practical meal ideas and timing that fit your real life.',
  },
  {
    icon: <Stethoscope className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Doctor‑Driven Care',
    description:
      'Connect with approved doctors who can review your information, guide your next steps and keep their notes and follow‑ups in one place.',
  },
  {
    icon: <Activity className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Smart Prescriptions & Alarms',
    description:
      'Turn your doctor’s advice into simple daily reminders for medicines, meals and water, so you stay on schedule without stress.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#5B97B0]" />,
    title: 'Secure & Ready for Scale',
    description:
      'Your personal and health details are handled with care and kept private, with access only for you and the people you choose.',
  },
];

export default function HomeFeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Everything You Need to Manage Your Health With MANO
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            MANO brings your health story, daily habits and doctor guidance together. Instead of
            using many different apps, you get one friendly place that helps you understand your
            health, follow a simple food plan and stay on track with your medicines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#E1F4F3] rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

