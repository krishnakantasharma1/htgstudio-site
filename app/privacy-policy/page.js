"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen py-20 px-6 text-gray-900">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold text-center mb-10"
      >
        Privacy Policy
      </motion.h1>

      <div className="max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed">
        <p>
          This Privacy Policy describes how <strong>HTG Studio</strong> collects,
          uses, and protects your personal information when you use our website
          and purchase our digital courses.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Your name, email address, and payment information at checkout.</li>
          <li>Technical information such as IP address and browser details.</li>
          <li>Course progress data to help improve your learning experience.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">How We Use Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To process payments and provide instant course access.</li>
          <li>To send course updates, support emails, or offers (with consent).</li>
          <li>To maintain and improve website performance and security.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Data Protection</h2>
        <p>
          We use SSL encryption and secure payment gateways to protect your
          data. Your information will never be shared or sold to third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Cookies</h2>
        <p>
          Our website may use cookies to enhance your browsing experience. You
          can disable cookies in your browser at any time.
        </p>

        <p className="mt-8">
          For privacy-related questions, contact us at{" "}
          <a
            href="mailto:privacy@htgstudio.com"
            className="text-blue-600 hover:underline"
          >
            htgstudios110@gmail.com          </a>
        </p>
      </div>
    </div>
  );
}
