
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 pt-6">
          <Button
            onClick={() => navigate('/auth')}
            variant="ghost"
            className="text-white hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auth
          </Button>
        </div>

        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          
          <div className="text-gray-300 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
            © 2025 Lore by{' '}
            <a 
              href="https://www.blacnova.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Blacnova
            </a>
            . All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
