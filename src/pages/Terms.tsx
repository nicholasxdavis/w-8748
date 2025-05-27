
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Terms = () => {
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
          <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
          
          <div className="text-gray-300 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Lore, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of Lore per device for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Disclaimer</h2>
              <p>
                The materials on Lore are provided on an 'as is' basis. Lore makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Limitations</h2>
              <p>
                In no event shall Lore or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Lore, even if Lore or a Lore authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through our website.
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

export default Terms;
