'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import { RiCustomerService2Fill } from 'react-icons/ri';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    recipient: 'support@aicontentgen.com'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeContact, setActiveContact] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitMessage('Message sent successfully! We\'ll get back to you soon.');
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        recipient: 'support@aicontentgen.com'
      });
    } catch (error) {
      setSubmitMessage('Error sending message. Please try again.');
      setSubmitStatus('error');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const contactItems = [
    {
      icon: <RiCustomerService2Fill className="text-2xl" />,
      title: "Support",
      details: ["support@aicontentgen.com", "Typically reply within 24 hours"],
      bg: "bg-slate-100 dark:bg-slate-800",
      color: "text-blue-500"
    },
    {
      icon: <FaPhone className="text-xl" />,
      title: "Phone",
      details: ["+1 (555) 123-4567", "Mon-Fri, 9am-6pm"],
      bg: "bg-slate-100 dark:bg-slate-800",
      color: "text-blue-500"
    },
    {
      icon: <FaMapMarkerAlt className="text-xl" />,
      title: "Location",
      details: ["123 AI Street", "Tech City, TC 10001"],
      bg: "bg-slate-100 dark:bg-slate-800",
      color: "text-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
              Get in Touch
            </span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Have questions or ideas? We'd love to hear from you.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MdSupportAgent className="text-blue-500" />
                Ways to Connect
              </h2>
            </motion.div>

            {contactItems.map((contact, index) => (
              <motion.div 
                key={index}
                className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
                  activeContact === index 
                    ? 'bg-white dark:bg-slate-800 shadow-lg border border-blue-100 dark:border-slate-700' 
                    : 'bg-white dark:bg-slate-800 hover:shadow-md hover:border-blue-100 border border-transparent'
                }`}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onHoverStart={() => setActiveContact(index)}
                onHoverEnd={() => setActiveContact(null)}
              >
                <div className="flex items-start gap-4">
                  <div className={`${contact.bg} ${contact.color} p-3 rounded-lg`}>
                    {contact.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-800 dark:text-white mb-1">
                      {contact.title}
                    </h3>
                    {contact.details.map((detail, i) => (
                      <p 
                        key={i} 
                        className={`text-gray-600 dark:text-gray-300 ${i === 0 ? 'font-medium' : 'text-sm'}`}
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
                {activeContact === index && (
                  <motion.div 
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}

            <motion.div 
              className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm text-white"
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <h3 className="font-bold text-xl mb-2">Need immediate help?</h3>
              <p className="mb-4 opacity-90">Check out our comprehensive FAQ section.</p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Visit Help Center
              </button>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-3 relative"
            variants={fadeInUp}
          >
            <div className="sticky top-24">
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <FaPaperPlane className="text-blue-500 text-lg" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Send us a message</h2>
                </div>

                <AnimatePresence>
                  {submitMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mb-6 overflow-hidden rounded-lg ${
                        submitStatus === 'success'
                          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}
                    >
                      <div className="p-4">{submitMessage}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('name')}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="peer w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all placeholder-transparent"
                        placeholder="Name"
                      />
                      <label 
                        htmlFor="name" 
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          formData.name || focusedInput === 'name' 
                            ? '-top-3 text-xs bg-white dark:bg-slate-800 px-1 text-blue-500' 
                            : 'top-3 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Your Name
                      </label>
                    </motion.div>

                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="peer w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all placeholder-transparent"
                        placeholder="Email"
                      />
                      <label 
                        htmlFor="email" 
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          formData.email || focusedInput === 'email' 
                            ? '-top-3 text-xs bg-white dark:bg-slate-800 px-1 text-blue-500' 
                            : 'top-3 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Email Address
                      </label>
                    </motion.div>
                  </div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput('subject')}
                      onBlur={() => setFocusedInput(null)}
                      className="peer w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all placeholder-transparent"
                      placeholder="Subject"
                    />
                    <label 
                      htmlFor="subject" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        formData.subject || focusedInput === 'subject' 
                          ? '-top-3 text-xs bg-white dark:bg-slate-800 px-1 text-blue-500' 
                          : 'top-3 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      Subject
                    </label>
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput('message')}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="peer w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all placeholder-transparent resize-none"
                      placeholder="Your message"
                    ></textarea>
                    <label 
                      htmlFor="message" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        formData.message || focusedInput === 'message' 
                          ? '-top-3 text-xs bg-white dark:bg-slate-800 px-1 text-blue-500' 
                          : 'top-3 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      Your Message
                    </label>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all ${
                      isSubmitting ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'
                    }`}
                    whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="text-sm" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              <motion.div 
                className="absolute -z-10 w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-xl -bottom-3 -right-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}