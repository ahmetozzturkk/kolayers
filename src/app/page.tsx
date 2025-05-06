import React from 'react';
import Link from 'next/link';
import ClientHeader from '../components/ClientHeader';

export default function HomePage() {
  return (
    <>
      <ClientHeader />
      <div className="bg-softwhite pt-20">
        {/* Hero Section */}
        <section className="bg-lavender-900 text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
            <div className="absolute w-64 h-64 rounded-full bg-lavender-300 -top-20 -left-20"></div>
            <div className="absolute w-96 h-96 rounded-full bg-lavender-300 -bottom-40 -right-20"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl sm:text-6xl font-bold mb-8 leading-tight">
              learn. achieve.<br />get rewarded.
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-12 text-lavender-100 font-light">
              a better way to explore, learn, and engage with your work — designed for winners like you.
            </p>
            <Link 
              href="/register" 
              className="inline-block bg-amber-400 text-lavender-900 px-10 py-4 rounded-lg font-semibold shadow-lg hover:bg-amber-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
            >
              start your journey
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 relative">
              how it works
              <div className="absolute w-24 h-1 bg-lavender-300 left-1/2 transform -translate-x-1/2 bottom-0 mt-4 rounded-full"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {/* Step 1 */}
              <div className="text-center p-8 rounded-xl bg-white shadow-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg glow">
                <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  <span className="text-lavender-600">🏆</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-lavender-900">start your journey</h3>
                <p className="text-gray-600">browse available badges based on HR topics. choose one and hit "start" to unlock its tasks.</p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center p-8 rounded-xl bg-white shadow-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg glow">
                <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  <span className="text-lavender-600">✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-lavender-900">complete tasks</h3>
                <p className="text-gray-600">follow the guided tasks — read, watch, try features, or take quizzes to progress.</p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center p-8 rounded-xl bg-white shadow-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg glow">
                <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  <span className="text-lavender-600">🏅</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-lavender-900">earn badges</h3>
                <p className="text-gray-600">complete all tasks under a badge to earn it. badges mark your hands-on experience.</p>
              </div>
              
              {/* Step 4 */}
              <div className="text-center p-8 rounded-xl bg-white shadow-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg glow">
                <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  <span className="text-lavender-600">📜</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-lavender-900">earn certificates</h3>
                <p className="text-gray-600">collect a defined set of badges to unlock certificate programs that validate your expertise.</p>
              </div>
              
              {/* Step 5 */}
              <div className="text-center p-8 rounded-xl bg-white shadow-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg glow">
                <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  <span className="text-lavender-600">💎</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-lavender-900">unlock rewards</h3>
                <p className="text-gray-600">earn exclusive rewards or recognition. everything you earn is displayed on your profile.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Badge Showcase Section */}
        <section className="py-16 bg-lavender-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              sample badges
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {/* Badge 1 */}
              <div className="bg-white rounded-xl shadow-card p-6 w-56 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="w-24 h-24 bg-mint-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">🚀</span>
                </div>
                <h3 className="text-lg font-bold mb-2">onboarding pro</h3>
                <p className="text-sm text-gray-600 mb-4">master the HR onboarding process</p>
                <div className="h-1 w-full bg-lavender-100 rounded-full overflow-hidden">
                  <div className="h-full bg-mint-400 w-2/3 rounded-full"></div>
                </div>
              </div>
              
              {/* Badge 2 */}
              <div className="bg-white rounded-xl shadow-card p-6 w-56 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="w-24 h-24 bg-lavender-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">👥</span>
                </div>
                <h3 className="text-lg font-bold mb-2">team builder</h3>
                <p className="text-sm text-gray-600 mb-4">team formation & management</p>
                <div className="h-1 w-full bg-lavender-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lavender-400 w-1/2 rounded-full"></div>
                </div>
              </div>
              
              {/* Badge 3 */}
              <div className="bg-white rounded-xl shadow-card p-6 w-56 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="w-24 h-24 bg-amber-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">📊</span>
                </div>
                <h3 className="text-lg font-bold mb-2">performance guru</h3>
                <p className="text-sm text-gray-600 mb-4">master performance evaluation</p>
                <div className="h-1 w-full bg-lavender-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-1/4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
