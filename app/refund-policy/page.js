"use client";

import { motion } from "framer-motion";

export default function RefundPolicy() {
  return (
    <div className="bg-white min-h-screen py-20 px-6 text-gray-900">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold text-center mb-10"
      >
        Refund & Cancellation Policy
      </motion.h1>

      <div className="max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed">
        <p>
          At <strong>HTG Studio</strong>, we want you to have a smooth and
          transparent experience. If you’re not satisfied with your purchase,
          we offer a <strong>7-day money-back guarantee</strong>.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Eligibility for Refund</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Refunds are valid only within 7 days of purchase.</li>
          <li>The request must be made from the same email used during checkout.</li>
          <li>No refund will be issued if more than 30% of the course content has been viewed or downloaded.</li>
          <li>Refunds are not applicable for promotional or discounted purchases unless stated.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Refund Process</h2>
        <p>
          Once your request is approved, your refund will be processed within{" "}
          <strong>5–7 business days</strong>. The amount will be credited to
          your original payment method.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Cancellation Policy</h2>
        <p>
          As our courses are delivered digitally with instant access, order
          cancellations are not possible once the content is accessed.
        </p>

        <p className="mt-8">
          For any refund-related queries, contact us at{" "}
          <a
            href="mailto:htgstudios110@gmail.com"
            className="text-blue-600 hover:underline"
          >
            htgstudios110@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
