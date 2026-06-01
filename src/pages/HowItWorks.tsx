// src/pages/HowItWorks.tsx
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">How It Works</h1>
        <div className="space-y-8">
          {[
            { step: 1, title: 'Create Account', desc: 'Sign up with your email' },
            { step: 2, title: 'Submit Request', desc: 'Fill and submit your civic request' },
            { step: 3, title: 'Track Status', desc: 'Monitor your submission status in real-time' },
            { step: 4, title: 'Get Response', desc: 'Receive guaranteed acknowledgment and updates' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{step}</div>
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
