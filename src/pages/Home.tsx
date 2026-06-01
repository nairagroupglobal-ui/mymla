// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, FAQ_ITEMS, ROUTES } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">MLA.com</h1>
          <div className="flex gap-6">
            <Link to={ROUTES.HOME} className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to={ROUTES.ABOUT} className="text-gray-600 hover:text-gray-900">About</Link>
            <Link to={ROUTES.SERVICES} className="text-gray-600 hover:text-gray-900">Services</Link>
            <Link to={ROUTES.AUTH_LOGIN} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            Direct Communication with Your MLA
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            File petitions, applications, and grievances securely. Track status in real-time. Get guaranteed acknowledgment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={ROUTES.AUTH_SIGNUP} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Get Started
            </Link>
            <Link to={ROUTES.HOW_IT_WORKS} className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose MLA.com?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Secure Filing', description: 'Encrypted submission of documents and petitions' },
              { title: 'Real-time Tracking', description: 'Monitor your submission status 24/7' },
              { title: 'Direct Connection', description: 'Direct communication with your MLA office' },
              { title: 'Document Support', description: 'Upload and verify supporting documents' },
              { title: 'Multi-language', description: 'Available in regional languages' },
              { title: '24/7 Support', description: 'Dedicated support for all users' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">What Users Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">MLA.com</h4>
            <p className="text-gray-400">Direct civic engagement platform</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to={ROUTES.SERVICES} className="hover:text-white">Submit Petition</Link></li>
              <li><Link to={ROUTES.SERVICES} className="hover:text-white">File Grievance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to={ROUTES.PRIVACY} className="hover:text-white">Privacy</Link></li>
              <li><Link to={ROUTES.TERMS} className="hover:text-white">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <Link to={ROUTES.CONTACT} className="text-gray-400 hover:text-white">Get in Touch</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MLA.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
