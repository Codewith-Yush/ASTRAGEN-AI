"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-4xl mx-auto px-6 py-16"
      >
        {/* Header Section */}
        <motion.section variants={fadeInUp} className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-teal-700 uppercase bg-teal-100 rounded-full dark:bg-teal-900 dark:text-teal-200 mb-4">
            Deep Dive
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-300 dark:to-blue-400">
              Learn More About Our Platform
            </span>
          </h1>
          <motion.div 
            className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto my-6"
            variants={fadeInUp}
          />
        </motion.section>

        {/* Content Sections */}
        <motion.section variants={staggerContainer} className="space-y-12 mb-16">
          {[
            {
              title: "Our Approach",
              description: "We combine cutting-edge AI with human-centered design principles to create tools that enhance rather than replace human creativity.",
              icon: "💡"
            },
            {
              title: "Technology Stack",
              description: "Built on transformer architectures with proprietary fine-tuning for content generation tasks.",
              icon: "⚙️"
            },
            {
              title: "Ethical Considerations",
              description: "We prioritize responsible AI development with built-in safeguards against misuse.",
              icon: "🛡️"
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              className="p-8 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{item.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* CTA Section */}
        <motion.section variants={fadeInUp} className="text-center">
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of creators already using our platform to enhance their content workflow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/about" 
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to About
              </Link>
              <Link 
                href="/technology" 
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Explore Technology
              </Link>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}