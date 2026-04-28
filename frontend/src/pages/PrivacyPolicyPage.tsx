import { useLayoutEffect } from "react";
import PageWrapper from "../components/shared/PageWrapper";

function PrivacyPolicyPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-hot-gray-950 mb-xl">
          Privacy Policy
        </h1>

        <div className="flex flex-col gap-md text-hot-gray-700 text-base leading-relaxed">
          <p>
            This policy establishes how we collect information about the actions
            that you take on our Services, and how we use this information to
            provide the Services to you. You can access some of the Service
            features without creating an account or providing us with personal
            information. However, if you set up an account with us, you'll need
            to provide us with contact information, such as your email, so that
            we can communicate with you and provide you with information about
            the Services. Additionally, we use Matomo, an open-source web
            analytics tool, to help us analyze data on website traffic and page
            views. We take steps to protect the personal information you provide
            us, such as by limiting access to the information to trained staff
            and designated volunteers, and only sharing your information as
            needed to provide the Services to you. We also provide you with
            certain choices regarding your personal information, and we aim to
            honor your preferences.
          </p>

          <div>
            <p className="font-semibold text-hot-gray-900 mb-sm">
              This Privacy Policy Contains the Following Sections:
            </p>
            <ul className="list-disc pl-lg flex flex-col gap-xs">
              <li><a href="#section-1">Information We Collect From You and How We Collect It</a></li>
              <li><a href="#section-2">Legal Bases for Collecting and Using Information</a></li>
              <li><a href="#section-3">How and When We Share Information</a></li>
              <li><a href="#section-4">Your Choices Regarding Your Personal Information</a></li>
              <li><a href="#section-5">Third-Party Websites and Services</a></li>
              <li><a href="#section-6">Children's Privacy</a></li>
              <li><a href="#section-7">How to Contact Us</a></li>
            </ul>
          </div>

          {/* Section 1 */}
          <section id="section-1" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              1. Information We Collect From You and How We Collect It
            </h2>
            <p>
              Depending on how you use the Services and its features, we or
              third parties working on our behalf may collect information about
              you (sometimes referred to as "personal information"). The type of
              personal information we collect from or about you may include:
              name, address, country, email address, gender, social media
              account information, OpenStreetMap ("OSM") account information,
              and any other information you choose to provide to us. We may also
              collect information about the device you are using, such as the
              device's IP address.{" "}
              <strong>
                We may also collect information about you from third parties.
              </strong>{" "}
              We treat any personal information we receive from these third
              parties consistent with this Privacy Policy.
            </p>

            <h3 className="text-lg font-semibold text-hot-gray-900">
              Cookies and Similar Technologies
            </h3>
            <p>
              When you use the Services, we, or third parties operating on our
              behalf, use cookies and similar technologies to collect information
              about the features that you access and use, and about the browser
              and computer or device you use to access the Services. We use
              Matomo, an open-source website analytics tool, across the Services
              to help us collect the following information:
            </p>
            <ul className="list-disc pl-lg flex flex-col gap-xs">
              <li>
                <strong>Log Information:</strong> Information about visitors to
                the Services, including IP address, operating system, and
                browser ID.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how
                visitors interact with the Services, including information about
                what webpages on the Services were visited and for how long, the
                website the visitor navigated to the Services from, and the
                actions taken while using the Services.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-hot-gray-900">
              How to Refuse the Use of Cookies
            </h3>
            <p>
              Most browsers include tools to help you manage cookies. Each
              browser is different, so please consult your browser's "Help" menu
              to learn the correct way to modify how your browser handles
              cookies. Keep in mind that we need certain information in order for
              the Services to function properly. If you disable cookies, you may
              no longer be able to use or access some features of the Services.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              2. Legal Bases for Collecting and Using Information
            </h2>
            <p>
              For those visitors whose personal information is subject to EU
              data protection laws, the legal bases for processing your
              information as set out in this Privacy Policy are as follows: (1)
              The processing is necessary in order to fulfill our contractual
              commitments to you; (2) The processing is necessary for us to
              comply with a legal obligation; (3) We have a legitimate interest
              in processing your information – for example, to provide and
              update our Services, to improve our Services so that we can offer
              you an even better user experience, to safeguard our Services, to
              communicate with you, to measure, gauge, and improve the
              effectiveness of our services, and better understand user
              retention and attrition, to monitor and prevent any problems with
              our Services, and to personalize your experience; or (4) You have
              given us your consent – for example before we place certain
              cookies on your device and access and analyze them later on.
            </p>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              3. How and When We Share Information
            </h2>
            <p>
              We may share information about you in limited circumstances for
              the purposes described in this Privacy Policy and with appropriate
              safeguards on your privacy and the security of your personal
              information. We use appropriate administrative, technical, and
              physical measures designed to prevent unauthorized access,
              improper use or disclosure, unauthorized modification or unlawful
              destruction or accidental loss of personal information.
            </p>
            <p>
              Although we exercise reasonable care in providing secure
              transmission of information and storage of the information provide
              us through the Services, no method of transmission over the
              Internet, and no means of electronic or physical storage, is
              absolutely secure. Accordingly, we cannot ensure or warrant the
              security of any information you transmit to us.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              4. Your Choices Regarding Your Personal Information
            </h2>
            <p>
              We provide you with several choices when it comes to information
              about you:
            </p>
            <ul className="list-disc pl-lg flex flex-col gap-sm">
              <li>
                <strong>Opt-Out of Electronic Communications:</strong> You may
                opt out of receiving messages from HOT depending on the Services
                used. Just follow the instructions in those messages. If you opt
                out of receiving marketing messages from us, we may still send
                you other non-commercial messages, like those about your account
                and legal notices.
              </li>
              <li>
                <strong>Do Not Track:</strong> HOT responds to "do not track"
                signals across all of our Services, so you may elect to use this
                signal in your browser settings.
              </li>
              <li>
                <strong>Set Your Browser to Reject Cookies:</strong> As
                mentioned above, you can usually choose to set your browser to
                remove or reject browser cookies before using HOT's services,
                with the drawback that certain features may not function
                properly without the aid of cookies.
              </li>
              <li>
                <strong>Close Your Account:</strong> If you created a profile or
                account with us, you can contact us at{" "}
                <a href="mailto:info@hotosm.org">info@hotosm.org</a> to request
                that we close a specific HOT account and/or profile. Please keep
                in mind that we may continue to retain and use your information
                after you close your account as described in this Privacy
                Policy. For example, we may use your information if reasonably
                needed to comply with (or demonstrate our compliance with) legal
                obligations, or as reasonably needed for our legitimate business
                interests.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              5. Third-Party Websites and Services
            </h2>
            <p>
              The Services may include links to third-party websites and
              services that are not owned or controlled by us, such as GitHub,
              Slack, Venmo, PayPal, or social media platforms like Twitter,
              Facebook, and LinkedIn. We have no control over, and assume no
              responsibility for, the content, privacy policies, or practices of
              any third-party websites or services. If you choose to use any
              third-party websites or services, the collection, use, and
              disclosure of your information on those websites will be subject
              to the privacy policies of these websites and services.
            </p>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              6. Children's Privacy
            </h2>
            <p>
              We encourage youth to volunteer with HOT under the supervision of
              their parent or guardian, and are committed to protecting the
              privacy of children who use our Services. We do not knowingly
              collect personal information from children under 16. However,
              depending on how you use the Services, we may collect and use
              information about your child that you provide to us. Before we
              collect any such information, we will seek your permission. If we
              become aware we are processing the data of a child under the age
              of 16 without parental consent, we will take reasonable steps to
              delete such information as required under applicable laws. If you
              believe we might have personal information from or about a child
              under 16, please contact us at{" "}
              <a href="mailto:info@hotosm.org">info@hotosm.org</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-hot-gray-900">
              7. How to Contact Us
            </h2>
            <p>
              If you have a question about this Privacy Policy, please contact
              us at <a href="mailto:info@hotosm.org">info@hotosm.org</a>.
            </p>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}

export default PrivacyPolicyPage;
