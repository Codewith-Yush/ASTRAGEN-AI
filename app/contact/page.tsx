'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

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
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [inView, setInView] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setInView(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus(null);
    
    // Create email template HTML
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formData.subject || 'Contact Form Submission'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .email-header {
            background: linear-gradient(to right, #14b8a6, #0d9488);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 30px;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 15px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
          .message-box {
            background-color: #f8fafc;
            border-left: 4px solid #14b8a6;
            padding: 15px;
            margin: 20px 0;
          }
          .contact-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="email-body">
            <p>You've received a new message from your website contact form.</p>
            
            <h2>Contact Details:</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Subject:</strong> ${formData.subject || 'No subject provided'}</p>
            
            <h2>Message:</h2>
            <div class="message-box">
              ${formData.message.replace(/\n/g, '<br>')}
            </div>
            
            <div class="contact-info">
              <p>This email was sent from the contact form on your website. Please respond directly to the sender's email address if needed.</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AI Content Gen. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emailTemplate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('Message sent successfully');
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          recipient: 'support@aicontentgen.com'
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending message. Please try again.';
      setSubmitMessage(errorMessage);
      setSubmitStatus('error');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: { 
      y: [-5, 5, -5],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const shimmer = {
    initial: { backgroundPosition: '200% 0' },
    animate: {
      backgroundPosition: ['-200%', '200%'],
      transition: {
        repeat: Infinity,
        duration: 8,
        ease: "linear"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 sm:py-16 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={staggerItems}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-3 relative"
            initial="initial"
            animate="animate"
            variants={shimmer}
            style={{
              backgroundImage: 'linear-gradient(90deg, #14b8a6, #0ea5e9, #14b8a6)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block'
            }}
          >
            Get in Touch
          </motion.h1>
          <div className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto rounded-full my-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            We're here to help with any questions you might have.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-7 order-2 lg:order-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-slate-700"
            variants={fadeInUp}
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          >
            <AnimatePresence>
              {submitMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-4 rounded-lg ${
                    submitStatus === 'success'
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}
                >
                  {submitMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div whileHover={{ y: -2 }}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:text-white transition-all"
                    placeholder="Your name"
                  />
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:text-white transition-all"
                    placeholder="your.email@example.com"
                  />
                </motion.div>
              </div>

              <motion.div whileHover={{ y: -2 }}>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:text-white transition-all"
                  placeholder="How can we help?"
                />
              </motion.div>

              <motion.div whileHover={{ y: -2 }}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:text-white transition-all resize-none"
                  placeholder="Tell us what you need..."
                ></textarea>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="lg:col-span-5 order-1 lg:order-2 space-y-6"
            variants={staggerItems}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="w-8 h-1 bg-teal-500 mr-2 rounded-full"></span>
                Contact Info
              </h2>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-5 p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-slate-700"
              variants={{...fadeInUp, ...floatAnimation}}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial="initial"
              animate="animate"
            >
              <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-full shadow-md">
                <FaPhone className="text-white text-lg" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri, 9am-6pm</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-5 p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-slate-700"
              variants={{...fadeInUp, ...floatAnimation}}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-full shadow-md">
                <FaEnvelope className="text-white text-lg" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">support@aicontentgen.com</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reply within 24 hours</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-5 p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-slate-700"
              variants={{...fadeInUp, ...floatAnimation}}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial="initial"
              animate="animate"
              style={{ animationDelay: "1s" }}
            >
              <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-full shadow-md">
                <FaMapMarkerAlt className="text-white text-lg" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">123 AI Street</p>
                <p className="text-gray-600 dark:text-gray-400">Tech City, TC 10001</p>
              </div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-slate-700"
              variants={fadeInUp}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center space-x-1 text-yellow-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm italic">"The team responded to my inquiry within hours. Extremely professional and helpful!"</p>
              <p className="text-gray-700 dark:text-gray-200 font-medium mt-2">YASH TAk.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}