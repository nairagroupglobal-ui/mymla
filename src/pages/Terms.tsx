// src/pages/Terms.tsx
export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-600">
          <p>By using MLA.com, you agree to these terms and conditions.</p>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage</h2>
            <p>Users must use this platform in accordance with all applicable laws and regulations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Liability</h2>
            <p>MLA.com provides the platform as-is. We are not liable for misuse or damages resulting from use of the platform.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
