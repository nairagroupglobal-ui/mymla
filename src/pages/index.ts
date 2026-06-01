// src/pages/About.tsx
export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">About MLA.com</h1>
        <div className="space-y-6 text-gray-600">
          <p>MLA.com is a civic engagement platform designed to streamline communication between citizens and their elected representatives.</p>
          <p>Our mission is to democratize access to government services and make civic participation transparent, efficient, and accessible to all.</p>
        </div>
      </div>
    </div>
  );
}

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

// src/pages/FAQ.tsx
import { FAQ_ITEMS } from '@/lib/utils';

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        {FAQ_ITEMS.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
            <div className="space-y-4">
              {category.items.map((item, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/Contact.tsx
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Call API to save contact message
      toast.success('Message sent successfully');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-32"></textarea>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
        </div>
      </div>
    </div>
  );
}

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
        </div>
      </div>
    </div>
  );
}

// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Go Home
        </Link>
      </div>
    </div>
  );
}
