'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-lavender-600 hover:text-lavender-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-lavender-300 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-lavender-900 text-2xl font-extrabold">k</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: April 24, 2025</p>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">1. Introduction</h2>
              <p className="mb-4">
                At Kolayers, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform 
                you about how we look after your personal data when you visit our website and tell you about your privacy rights and how 
                the law protects you.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">2. The Data We Collect</h2>
              <p className="mb-4">
                We may collect, use, store and transfer different kinds of personal data about you including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Identity Data: includes first name, last name, username or similar identifier</li>
                <li>Contact Data: includes email address and telephone numbers</li>
                <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
                <li>Usage Data: includes information about how you use our website and services</li>
                <li>Marketing and Communications Data: includes your preferences in receiving marketing from us and our third parties</li>
              </ul>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">3. How We Use Your Data</h2>
              <p className="mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests</li>
                <li>Where we need to comply with a legal or regulatory obligation</li>
              </ul>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">4. Data Security</h2>
              <p className="mb-4">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. 
                We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">5. Data Retention</h2>
              <p className="mb-4">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
                including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">6. Your Legal Rights</h2>
              <p className="mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">7. Cookies</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your computer when you visit our website. We use cookies to improve your 
                user experience, understand how our website is being used, and to enable certain functionality. You can set your browser 
                to refuse all or some browser cookies, or to alert you when websites set or access cookies.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">8. Changes to the Privacy Policy</h2>
              <p className="mb-4">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy 
                on this page and updating the "Last updated" date at the top of this privacy policy.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@kolayers.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 