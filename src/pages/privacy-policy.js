import Head from 'next/head';
import Layout from '../components/Layout';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy – MANO</title>
      </Head>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-[#0F2944] mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            MANO (Medical AI Nutrition &amp; Online Consultation) is a health and nutrition support
            service. We help people follow better diet plans, understand their health and stay
            connected with doctors. This Privacy Policy explains, in simple language, how we collect,
            use and protect your information.
          </p>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">1. What information we collect</h2>
            <p>We collect only the information we need to run MANO and improve your experience, such as:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Account details</strong> – for example, your name, email address and password.
              </li>
              <li>
                <strong>Health and lifestyle information</strong> – details you choose to share so we can
                provide diet plans, reminders and health insights.
              </li>
              <li>
                <strong>Usage information</strong> – how you use MANO, such as which pages you visit and
                which buttons you click.
              </li>
              <li>
                <strong>Messages and feedback</strong> – anything you send us when you contact support or
                share your thoughts about the product.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and manage your account.</li>
              <li>To provide diet plans, reminders and other health tools inside MANO.</li>
              <li>To help doctors understand your health story when you choose to share it with them.</li>
              <li>To keep the service safe, reliable and easy to use.</li>
              <li>To understand which features people use so we can make MANO better.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">3. How we share information</h2>
            <p>We only share your information in a few situations:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>With doctors or health professionals you choose to connect with inside MANO.</li>
              <li>
                With trusted service providers who help us run MANO (for example, email or storage
                services). They must keep your information safe and cannot use it for their own
                purposes.
              </li>
              <li>
                When the law requires us to share information, such as with authorities or to
                protect someone&apos;s safety.
              </li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> sell your personal or health information.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">4. How we protect your information</h2>
            <p>
              We use strong protections to keep your information safe. We limit who inside our team
              can see your data, and we regularly review how we store and handle your information.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">5. How long we keep your information</h2>
            <p>
              We keep your information while you have an account and for a reasonable time after,
              as required by law or to solve any open issues. If you close your account, we remove
              or hide your information when we no longer need it.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">6. Your choices and rights</h2>
            <p>
              Depending on your country, you may have the right to see the information we have
              about you, correct it, ask us to delete it or limit how we use it. You may also be
              able to take your information with you in a simple format.
            </p>
            <p className="mt-2">
              To use these rights, please contact us using the details at the end of this page.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">7. Children&apos;s privacy</h2>
            <p>
              MANO is not meant for children under the age required by local law. If we learn that
              we collected information from a child by mistake, we will delete it.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">8. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make important changes,
              we will update the date at the top and, when needed, let you know inside the app or
              by email.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-[#0F2944] mb-2">9. Contact us</h2>
            <p>
              If you have questions or requests about your privacy, you can contact us at:
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

