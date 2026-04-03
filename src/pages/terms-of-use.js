import Head from 'next/head';
import Layout from '../components/Layout';

export default function TermsOfUse() {
  return (
    <Layout>
      <Head>
        <title>Terms of Use – MANO</title>
      </Head>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-[#0F2944] mb-4">Terms of Use</h1>
        <p className="text-sm text-slate-500 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            These Terms of Use explain how you may use MANO (Medical AI Nutrition &amp; Online
            Consultation). By creating an account or using MANO, you agree to follow these terms.
          </p>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">1. Who can use MANO</h2>
            <p>You may use MANO only if:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You are old enough to use online services in your country.</li>
              <li>You provide correct information when you create an account.</li>
              <li>You keep your login details safe and do not share your account with others.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">2. What MANO offers</h2>
            <p>MANO gives you tools to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Receive diet plans and lifestyle guidance based on the information you share.</li>
              <li>Track health‑related information and reminders.</li>
              <li>Connect with doctors and other health professionals when available.</li>
            </ul>
            <p className="mt-2">
              MANO does <strong>not</strong> replace your personal doctor or emergency services. Always
              follow the advice of your own doctor and contact local emergency services in urgent
              situations.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">3. Your responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use MANO only for lawful and respectful purposes.</li>
              <li>Do not try to break, damage or misuse the service.</li>
              <li>Do not share harmful, offensive or illegal content.</li>
              <li>Do not attempt to access other people&apos;s accounts or data.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">
              4. Health information and no guarantee
            </h2>
            <p>
              MANO is a support tool, not a medical clinic. We work hard to provide helpful and
              accurate information, but we cannot promise that every plan or suggestion will be
              perfect for every person.
            </p>
            <p className="mt-2">
              You should always talk to your doctor before making big changes to your diet,
              medicines or lifestyle, and you should follow your doctor&apos;s advice over any
              information you see in MANO.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">5. Ending or suspending your account</h2>
            <p>
              You can stop using MANO at any time and request to close your account. We may
              suspend or end your access if you break these Terms of Use, if we are required to do
              so by law or if we believe your actions put others at risk.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">6. Changes to the service</h2>
            <p>
              We may change, add or remove features over time to improve MANO. We will try to give
              fair notice when we make big changes that affect how you use the service.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">7. Changes to these terms</h2>
            <p>
              We may update these Terms of Use from time to time. When we make important changes,
              we will update the date at the top and, when needed, tell you inside the app or by
              email. If you keep using MANO after the changes, it means you accept the new terms.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">8. Contact us</h2>
            <p>
              If you have questions about these Terms of Use, you can contact us at:
              <br />
              <strong>Email:</strong> your-support-email@example.com
              <br />
              <strong>Address:</strong> Your company address
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

