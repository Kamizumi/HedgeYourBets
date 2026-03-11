export default function TermsAndPrivacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Terms of Service Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Hedge Your Bets, you accept and agree to be bound by the 
            terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use Hedge Your Bets for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a 
            transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to decompile or reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Disclaimer</h2>
          <p className="mb-4">
            The information on this website is provided on an 'as is' basis. Hedge Your Bets 
            provides AI-powered analysis for educational and entertainment purposes only. 
            <strong> This is not financial advice and should not be used as the sole basis for 
            making betting decisions.</strong>
          </p>
          <p className="mb-4">
            <strong>Hedge Your Bets is not responsible for any monetary loss</strong> incurred 
            as a result of using our platform, predictions, or analysis. All betting decisions 
            and their financial consequences are solely the responsibility of the user.
          </p>
          <p className="mb-4">
            Our prediction models are based strictly on objective historical data that is 
            publicly available. We do not use insider information, proprietary data sources, 
            or any non-public information in generating our predictions. All analysis is 
            derived from publicly accessible statistical data and historical performance records.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Gambling Disclaimer</h2>
          <p className="mb-4">
            Gambling can be addictive. Please gamble responsibly. If you feel you have a 
            gambling problem, please seek help from appropriate organizations.
          </p>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">
            When you sign in with Google or GitHub, we collect:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Your name and email address</li>
            <li>Your profile picture (if available)</li>
            <li>Betting scenarios you create using our platform</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide you with access to our AI-powered betting analysis</li>
            <li>Save your betting scenarios and predictions</li>
            <li>Improve our machine learning models</li>
            <li>Communicate with you about your account</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information. 
            Your data is stored securely and we do not share it with third parties except as 
            necessary to provide our services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service or Privacy Policy, please contact us at:
            <br />
            Email: jasonmar2004.2@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}