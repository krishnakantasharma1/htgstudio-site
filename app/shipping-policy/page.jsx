

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl text-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">
          Shipping Policy
        </h1>

        <p className="text-gray-600 mb-4">
          At <strong>HTG Studio</strong>, we specialize in digital learning products.
          Therefore, <strong>no physical items</strong> are shipped to customers.
          All courses and materials are delivered electronically.
        </p>

        <h2 className="text-xl font-semibold mb-2">Digital Delivery</h2>
        <p className="text-gray-600 mb-4">
          Once your payment is successfully completed, your course(s) become
          immediately accessible in your <strong>HTG Studio Dashboard</strong>.
          You will also receive a confirmation email with access details.
        </p>

        <h2 className="text-xl font-semibold mb-2">Access Issues</h2>
        <p className="text-gray-600 mb-4">
          If you face any issues accessing your purchased content, please reach
          out to our support team at{" "}
          <a
            href="mailto:htgstudios110@gmail.com"
            className="text-blue-600 hover:underline"
          >
            htgstudios110@gmail.com
          </a>
          . We’ll assist you promptly.
        </p>

        <h2 className="text-xl font-semibold mb-2">Refunds</h2>
        <p className="text-gray-600 mb-4">
          For refund eligibility and process, please review our{" "}
          <a href="/refund-policy" className="text-blue-600 hover:underline">
            Refund Policy
          </a>
          .
        </p>

        <p className="text-gray-500 text-sm mt-6 text-center">
          © {new Date().getFullYear()} HTG Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}