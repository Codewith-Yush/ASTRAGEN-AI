"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const TechnologyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      
      <motion.main
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        {/* Hero Section */}
        <motion.section variants={fadeInUp} className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium tracking-wider text-blue-700 uppercase bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 mb-6">
            Our Tech Stack
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Advanced AI Technology
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the cutting-edge artificial intelligence that powers our content generation platform.
          </p>
        </motion.section>

        {/* Technology Features */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-12 mb-24">
          {[
            {
              title: "Natural Language Processing",
              description: "Our NLP models understand context, tone, and style to generate human-like content.",
              icon: "💬"
            },
            {
              title: "Deep Learning Architecture",
              description: "Built on transformer models with billions of parameters for superior performance.",
              icon: "🧠"
            },
            {
              title: "Continuous Learning",
              description: "Our system improves with every interaction, adapting to your specific needs.",
              icon: "🔄"
            },
            {
              title: "Ethical AI Framework",
              description: "Responsible AI practices built into our core architecture.",
              icon: "⚖️"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="p-8 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* CTA Section */}
        <motion.section variants={fadeInUp} className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to experience our technology?</h2>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/about/learnmore" 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Learn More
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              About Us
            </Link>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default TechnologyPage;