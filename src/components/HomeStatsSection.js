export default function HomeStatsSection() {
  const stats = [
    {
      value: '3',
      label: 'Key areas we support: nutrition, diabetes, overall health history',
    },
    {
      value: '5+',
      label: 'Helpful tools to guide your daily health routine',
    },
    {
      value: '100%',
      label: 'Your account protected with secure sign‑in and careful access',
    },
    {
      value: '24/7',
      label: 'Always available whenever you want to check on your health',
    },
  ];

  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-[#0F2944]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

