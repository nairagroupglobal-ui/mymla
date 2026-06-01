// src/pages/Services.tsx
export default function Services() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Services</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {['Petitions', 'Applications', 'Grievances', 'Proposals'].map((service) => (
            <div key={service} className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{service}</h3>
              <p className="text-gray-600">Submit and track your {service.toLowerCase()} with your MLA office.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
