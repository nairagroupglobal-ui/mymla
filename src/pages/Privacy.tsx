// src/pages/Privacy.tsx
export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-600">
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Collection</h2>
            <p>We collect information necessary to provide civic engagement services and improve our platform.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
            <p>Your data is encrypted and securely stored. We never share your information with third parties without consent.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
