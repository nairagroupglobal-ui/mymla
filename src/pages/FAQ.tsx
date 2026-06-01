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
