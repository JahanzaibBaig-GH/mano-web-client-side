import { Bot, Lock, Stethoscope } from 'lucide-react';

export default function HomeAboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
              How MANO Brings AI &amp; Doctors Together
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              MANO is built to support you in your everyday health journey. It brings together smart
              nutrition tools, diabetes support and real doctor guidance, so your food, medicines and
              check‑ups all work in the same direction.
            </p>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              From the moment you share your health details, MANO turns them into clear next steps:
              what to eat, when to take your medicines and when you may need to talk to a doctor.
              Everything is explained in simple language, so you always know what to do and why it
              matters.
            </p>
            <ul className="space-y-3">
              {[
                'All your health details, finally organised in one place so nothing important is lost.',
                'Simple guidance you can follow every day instead of confusing medical language.',
                'Support for diabetes and long‑term care with habits that fit into your real life.',
                'Built to grow with you as your health needs and goals change over time.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 text-teal-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#E1F4F3] to-[#CBE8E5] rounded-3xl p-8 flex flex-col gap-4">
            {[
              {
                icon: <Stethoscope className="w-5 h-5 text-[#0F2944]" />,
                title: 'Doctor‑Approved',
                desc: 'Designed with medical professionals so the guidance reflects real‑world care.',
              },
              {
                icon: <Lock className="w-5 h-5 text-[#0F2944]" />,
                title: 'Privacy You Can Trust',
                desc: 'Your health information is kept private and never sold.',
              },
              {
                icon: <Bot className="w-5 h-5 text-[#0F2944]" />,
                title: 'Works Around Your Life',
                desc: 'Fits into your daily routine, whether you are just starting or already under care.',
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#E1F4F3] flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

