'use client';

import Link from 'next/link';

export default function TermsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
              <p className="text-gray-600">Last updated: April 24, 2025</p>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Kolayers. These Terms and Conditions govern your use of our website and services. 
                By accessing or using Kolayers, you agree to be bound by these Terms. If you disagree with any part of these terms, 
                you may not access our service.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">2. Definitions</h2>
              <p className="mb-4">
                <strong>"Service"</strong> refers to the Kolayers platform.<br />
                <strong>"User"</strong> refers to individuals who access or use our Service.<br />
                <strong>"Content"</strong> refers to all materials displayed on or available through our Service.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">3. User Accounts</h2>
              <p className="mb-4">
                When you create an account with us, you must provide accurate and complete information. You are responsible for 
                maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities 
                that occur under your account. If you suspect unauthorized access to your account, you must notify us immediately.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">4. Content and Conduct</h2>
              <p className="mb-4">
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, 
                videos, or other material. You are responsible for the Content that you post on or through the Service, including its 
                legality, reliability, and appropriateness.
              </p>
              
              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">5. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of 
                Kolayers and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and 
                trade dress may not be used in connection with any product or service without the prior written consent of Kolayers.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">6. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including 
                without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall Kolayers, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
                any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or 
                use the Service.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">8. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
                we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material 
                change will be determined at our sole discretion.
              </p>

              <h2 className="text-xl font-semibold text-lavender-800 mt-8 mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at support@kolayers.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 