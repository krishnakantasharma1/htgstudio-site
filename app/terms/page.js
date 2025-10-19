"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-20 px-6 text-gray-900">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold text-center mb-10"
      >
        Terms & Conditions
      </motion.h1>

      <div className="max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to <strong>HTG Studio</strong>. By accessing or purchasing our
          courses, you agree to the following terms and conditions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Use of Service</h2>
        <p>
          You agree to use the courses and materials solely for personal
          learning purposes. Sharing, reselling, or redistributing content
          without permission is strictly prohibited.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Account Security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials. HTG Studio will not be liable for unauthorized
          account access.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Payments</h2>
        <p>
          All payments made on our platform are processed through secure payment
          gateways like Razorpay. By completing a purchase, you agree to our
          refund policy and pricing terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Course Access</h2>
        <p>
          Access to digital courses is granted instantly after payment and is
          valid for lifetime, unless stated otherwise.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Changes to Policy</h2>
        <p>
          HTG Studio reserves the right to modify these terms at any time. Any
          changes will be updated on this page.
        </p>

        <p className="mt-8">
          For general inquiries, email us at{" "}
          <a
            href="mailto:contact@htgstudio.com"
            className="text-blue-600 hover:underline"
          >
            htgstudios110@gmail.com          </a>
        </p>
      </div>
    </div>
  );
}
