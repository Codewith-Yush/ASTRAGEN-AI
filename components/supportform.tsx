"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SupportForm(): JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMessage("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Message</label>
        <textarea name="message" value={formData.message} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
      </div>
      <motion.button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </motion.button>
      {successMessage && <p className="mt-4 text-green-600 text-center">{successMessage}</p>}
    </motion.form>
  );
}
