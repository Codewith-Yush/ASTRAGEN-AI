"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { motion,useTransform, useScroll,AnimatePresence} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Lenis from "@studio-freight/lenis";


gsap.registerPlugin(ScrollTrigger);
// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Define the type for feature items
interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

// Define the type for use case items
interface UseCase {
  title: string;
  description: string;
  image: string;
}

// Define the type for testimonial items
interface Testimonial {
  quote: string;
  author: string;
  role: string;
}
const AboutSection = () => {
  const [isInView, setIsInView] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Enhanced parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [1, 1, 1, 0.3]);
  
  // Glow effects
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.1, 0.3]);
  
  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

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
  
  const cardHover = {
    scale: 1.03,
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  };

  const imageHover = {
    scale: 1.1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-30 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 30% 50%, rgba(94, 234, 212, 0.3), transparent 50%), radial-gradient(circle at 70% 30%, rgba(96, 165, 250, 0.3), transparent 50%)",
          y: backgroundY,
          opacity: glowOpacity
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-teal-400 dark:bg-teal-600 opacity-10"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              transition: {
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }}
          />
        ))}
      </div>
      
      {/* Decorative border */}
      <motion.div 
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />
      
      {/* Floating blobs */}
      <motion.div 
        className="absolute right-0 top-0 h-96 w-96 -mr-48 -mt-48 opacity-20 dark:opacity-10"
        animate={{
          rotate: [0, 15, 0],
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.3,-76.8C55.9,-69.4,63.2,-55,70.8,-41C78.5,-27,86.3,-13.5,84.8,-0.9C83.2,11.7,72.3,23.4,62.2,33.5C52.1,43.6,42.8,52.1,32.1,58.4C21.4,64.6,10.7,68.5,-2.1,71.9C-14.9,75.3,-29.9,78.1,-41.5,72.3C-53.1,66.4,-61.5,51.9,-67.7,37.9C-73.9,23.9,-78.1,11.9,-79,0C-79.9,-11.9,-77.4,-23.8,-71.6,-34.4C-65.8,-45,-56.7,-54.3,-44.9,-61.7C-33.1,-69.1,-18.6,-74.6,-2.5,-71.5C13.7,-68.4,27.3,-56.8,44.3,-76.8Z" transform="translate(100 100)" className="text-teal-400 dark:text-teal-800" />
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute left-0 bottom-0 h-96 w-96 -ml-48 -mb-48 opacity-20 dark:opacity-10"
        animate={{
          rotate: [0, -15, 0],
          transition: {
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M39.9,-68.9C51.1,-62.9,59.5,-50.1,64.6,-37C69.8,-23.8,71.7,-10.4,71.2,3C70.7,16.5,67.8,29.9,60.8,41.1C53.8,52.2,42.7,61.1,30.1,67.3C17.4,73.5,3.3,77,-10.9,76.5C-25.1,76,-39.5,71.4,-51.5,63C-63.6,54.5,-73.4,42.1,-77.7,28.1C-82,14.1,-80.8,-1.4,-76.9,-16C-73,-30.5,-66.5,-44.1,-56.3,-51.5C-46.2,-58.9,-32.5,-60,-20.4,-63.6C-8.3,-67.2,2.3,-73.3,14.2,-75.2C26.1,-77.2,39.3,-75,39.9,-68.9Z" transform="translate(100 100)" className="text-blue-400 dark:text-blue-800" />
        </svg>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="space-y-20"
          style={{ opacity }}
        >
          {/* Header Section */}
          <motion.div variants={fadeInUp} className="text-center">
            <motion.div 
              className="inline-block overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium tracking-wider text-teal-700 uppercase bg-teal-100 dark:bg-teal-900/50 dark:text-teal-200 mb-4 shadow-sm">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                Our Story
              </span>
            </motion.div>
            
            <motion.h2 
              className="mt-4 text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
              style={{ y: textY }}
            >
              <span className="relative inline-block">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-300 dark:to-blue-400">
                  About Us
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-300 dark:to-blue-400 opacity-10 blur-xl -z-10"></span>
              </span>
            </motion.h2>
            
            <motion.div 
              className="h-1.5 w-24 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-8 rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: 96 } : { width: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            
            <motion.p 
              variants={fadeInUp} 
              className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300 leading-relaxed"
            >
              We're revolutionizing content creation through cutting-edge AI technology, 
              designed with <span className="font-semibold text-teal-600 dark:text-teal-400">creativity</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">human connection</span> at its core.
            </motion.p>
          </motion.div>
          
          {/* Feature Cards */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* First Feature Card */}
            <motion.div
              variants={fadeInUp}
              whileHover="hover"
              onHoverStart={() => setHoveredCard(1)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-800 transition-all duration-300 border border-gray-100 dark:border-slate-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-blue-100/30 dark:from-teal-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="aspect-video relative overflow-hidden">
                <motion.img
                  src="/content.gif"
                  alt="Human-centered design"
                  className="w-full h-full object-cover"
                  whileHover={imageHover}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="p-8 relative">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-teal-100 dark:bg-teal-900/50 shadow-sm group-hover:shadow-md transition-shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-5 text-2xl font-bold text-gray-900 dark:text-white">Human-Centered Design</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  We build intuitive AI solutions that adapt to how people naturally work and create, 
                  enhancing human capabilities without replacing the human touch.
                </p>
                <div className="mt-8">
  <Link 
    href="/about/learnmore" 
    className="inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors duration-300"
  >
    Learn more
    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  </Link>
</div>
              </div>
              
              <AnimatePresence>
                {hoveredCard === 1 && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Second Feature Card */}
            <motion.div
              variants={fadeInUp}
              whileHover="hover"
              onHoverStart={() => setHoveredCard(2)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-800 transition-all duration-300 border border-gray-100 dark:border-slate-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="aspect-video relative overflow-hidden">
                <motion.img
                  src="/3852.gif"
                  alt="Cutting-edge AI"
                  className="w-full h-full object-cover"
                  whileHover={imageHover}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="p-8 relative">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 shadow-sm group-hover:shadow-md transition-shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="ml-5 text-2xl font-bold text-gray-900 dark:text-white">Cutting-Edge Technology</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Our platform leverages state-of-the-art AI models to deliver intelligent content 
                  generation that adapts to your unique style and requirements.
                </p>
                <div className="mt-8">
  <Link
    href="/about/technology"
    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors duration-300"
  >
    Explore technology
    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  </Link>
</div>
              </div>
              
              <AnimatePresence>
                {hoveredCard === 2 && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div 
            variants={fadeInUp}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-[url('/api/placeholder/800/400')] bg-cover opacity-5 dark:opacity-[0.02]"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: "😊", label: "Customer Satisfaction", color: "teal" },
                { value: "Free to Use", label: "Content", color: "blue" },
                { value: "24/7", label: "Support Available", color: "purple" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.3 + index * 0.15,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    } 
                  } : {}}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <h3 className={`text-5xl md:text-6xl font-bold text-${stat.color}-600 dark:text-${stat.color}-300 mb-3`}>
                    {stat.value}
                  </h3>
                  <p className={`text-lg font-medium text-gray-600 dark:text-gray-300 border-t border-${stat.color}-100 dark:border-${stat.color}-900/50 pt-4`}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
// Use Cases Section
const UseCasesSection = () => {
  const useCases: UseCase[] = [
    {
      title: "Blog Posts",
      description: "Generate SEO-optimized blog posts with custom tone and style.",
      image: "/blog.jpg"
    },
    {
      title: "Marketing Copy",
      description: "Create compelling ad copy, product descriptions, and email content.",
      image: "/marketing.png"
    },
    {
      title: "Creative Writing",
      description: "Inspire your fiction, poetry, and storytelling with AI assistance.",
      image: "/writing.jpg"
    }
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.9  ,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
      },
    },
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6 dark:text-teal-300 tracking-tight">
            Content Creation Simplified
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Discover how our AI can help you create various types of content
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {useCases.map((useCase, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden group hover:shadow-x1 transition-all duration-300"
              variants={fadeIn}
            >
              <div className="aspect-[3/2] relative overflow-hidden">
                <Image
                  src={useCase.image}
                  alt={useCase.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="transition-all duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-teal-700 dark:text-teal-300 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Select Content Type",
      description: "Choose from a variety of content types including blog posts, product descriptions, or creative writing.",
      icon: "DocumentTextIcon"
    },
    {
      number: "02",
      title: "Define Parameters",
      description: "Set your requirements such as tone, length, keywords, and target audience.",
      icon: "AdjustmentsIcon"
    },
    {
      number: "03",
      title: "Generate & Edit",
      description: "Our AI creates content instantly, which you can then refine and personalize.",
      icon: "SparklesIcon"
    },
  ];
  
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-300 dark:bg-teal-600 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-800 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-blue-300 dark:bg-blue-800 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 text-sm font-medium mb-6">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300">It Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Get your content created in three simple steps
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Lines */}
          <motion.div 
            className="hidden md:block absolute top-1/3 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-teal-500 to-teal-300 dark:from-teal-600 dark:to-teal-400 z-0"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
          ></motion.div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative z-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.7, ease: "easeOut" }}
              whileHover={{ translateY: -8, transition: { duration: 0.3 } }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 h-full flex flex-col">
                {/* Circular Icon Container */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 flex items-center justify-center mb-6 text-white shadow-md">
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-grow">
                  {step.description}
                </p>
                
                {/* Animated Indicator */}
                <motion.div 
                  className="w-12 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 rounded-full mt-2"
                  initial={{ width: "20px" }}
                  whileInView={{ width: "48px" }}
                  transition={{ delay: index * 0.2 + 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Action Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            Start Creating Content
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "The quality is impressive, and i use it for my Blogs and assignments.",
      author: "Rajendra T.",
      role: "CS Student",
      image: "/raju.jpg"
    },
    {
      quote: "I liked it very much and I generated notes from here for study.",
      author: "Kuldeep Y.",
      role: "CS Student",
      image: "/kuldeep.jpg"
    },
    {
      quote: "I use it for my personal work im a youtuber and this platform is do uefull.",
      author: "Nitin G.",
      role: "CS Student",
      image: "/nitin.jpg"
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 dark:text-white tracking-tight">
            Trusted by <span className="text-teal-600 dark:text-teal-400">Students</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            See how our AI platform is transforming content creation for students and professionals
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl group transition-all duration-300 border border-gray-100 dark:border-slate-700 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full transition-all duration-500 group-hover:scale-150"></div>
              
              {/* Quote icon */}
              <div className="relative">
                <svg className="w-10 h-10 text-teal-500 opacity-80 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              {/* Quote text */}
              <p className="text-gray-700 dark:text-gray-300 mb-8 relative z-10 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Profile section */}
              <div className="flex items-center relative z-10">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md relative z-10 group-hover:border-teal-100 dark:group-hover:border-teal-900 transition-all duration-300"
                  />
                </div>
                <div className="ml-4 transition-all duration-300">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors duration-300">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              {/* Accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 group-hover:w-full transition-all duration-500 ease-out"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "$19",
      period: "per month",
      features: [
        "5,000 words per month",
        "5 content types",
        "Standard editing tools",
        "Email support"
      ],
      featured: false
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      features: [
        "20,000 words per month",
        "All content types",
        "Advanced editing tools",
        "Priority support",
        "SEO optimization"
      ],
      featured: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      features: [
        "50,000 words per month",
        "All content types",
        "Advanced editing tools",
        "Dedicated support",
        "SEO optimization",
        "Brand voice customization"
      ],
      featured: false
    }
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6 dark:text-teal-300 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Choose the plan that works best for your content needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-white dark:bg-slate-900 rounded-lg overflow-hidden ${
                plan.featured ? 'ring-2 ring-teal-500 shadow-lg' : 'border border-gray-100 dark:border-slate-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {plan.featured && (
                <div className="bg-teal-500 text-white text-center text-sm font-medium py-1">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-300 mb-4">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-teal-800 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.featured
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                }`}>
                  Get Started
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
// Add this section after the PricingSection or before the CTA section

const DevelopersSection = () => {
  const developers = [
    {
      name: "Ayush Singh",
      role: "CS Student",
      image: "/Ayush.jpeg",
      bio: "Passionate about creating intuitive and impactful user experiences through clean code.",
      social: {
        github: "https://github.com/codewith-yush",
        linkedin: "https://www.linkedin.com/in/ayush-singh-643a4b25a/"
      }
    },
    {
      name: "Om Vishwakarma",
      role: "CS Student",
      image: "/om.png",
      bio: "Dedicated to solving complex problems with elegant solutions and innovative approaches.",
      social: {
        github: "https://github.com/om-999",
        linkedin: "https://www.linkedin.com/in/om-vishwakarma-467b8933b/"
      }
    }
  ];

  return (
    <section className="py-19 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 top-40 w-72 h-72 bg-teal-500 opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute right-40 bottom-20 w-80 h-80 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Section header */}
        <motion.div
          className="text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm uppercase tracking-wider font-semibold text-teal-600 dark:text-teal-400 mb-3 block">
            The Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="relative inline-block">
              <span className="relative z-10">Meet Our</span>
            </span>{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400">
                Developers
              </span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 rounded-full opacity-80 -z-0"></span>
            </span>
          </h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Brilliance and creativity combined to bring this platform to life
          </motion.p>
        </motion.div>

        {/* Developer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {developers.map((developer, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-slate-700/30 transition duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  {/* Profile image */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg h-44 w-44 transition duration-300 group-hover:scale-105">
                      <Image
                        src={developer.image}
                        alt={developer.name}
                        width={176}
                        height={176}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {developer.name}
                    </h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400 mb-4 font-medium">
                      {developer.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm">
                      {developer.bio}
                    </p>
                    
                    {/* Social links */}
                    <div className="flex items-center space-x-4">
                      <motion.a 
                        href={developer.social.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-800 dark:text-white text-sm font-medium"
                        aria-label={`${developer.name}'s GitHub`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        GitHub
                      </motion.a>
                      <motion.a 
                        href={developer.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors text-blue-700 dark:text-blue-300 text-sm font-medium"
                        aria-label={`${developer.name}'s LinkedIn`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card decorative elements */}
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-200 dark:border-blue-900/40 rounded-lg -z-10 opacity-70"></div>
              <div className="absolute bottom-10 right-10 w-20 h-20 border-2 border-teal-200 dark:border-teal-900/40 rounded-lg -z-10 opacity-70"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home(): JSX.Element {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.5, // Smoothness duration
      easing: (t) => 1 - Math.pow(1 - t, 3), // Smooth easing
    });

    // Sync Lenis with GSAP ScrollTrigger
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Update GSAP ScrollTrigger on Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy(); // Cleanup
    };
  }, []);
  useEffect(() => {
    gsap.from(".content", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".content",
        start: "top 80%",
        end: "top 50%",
        scrub: true,
      },
    });
  }, []);
  // Create refs for the elements we want to animate
  const headerRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    // GSAP animation code goes here
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Heading animation
    tl.from(headingRef.current, {
      duration: 1.2,
      opacity: 0,
      y: 50,
      skewY: 5
    });
    
    // Description animation
    tl.from(descriptionRef.current, {
      duration: 1,
      opacity: 0,
      y: 30,
      delay: 0.2
    });
    
    if (buttonsRef.current) {
      const childrenArray = Array.from(buttonsRef.current.children);
    
      tl.from(childrenArray, {
        duration: 0.8,
        opacity: 0,
        y: 20,
        stagger: 0.15,
        ease: "back.out(1.7)",
      });
    }
    
    
    // Floating animation
    gsap.to(headerRef.current, {
      y: 15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Clean up on unmount
    return () => {
      tl.kill();
      gsap.killTweensOf(headerRef.current);
    };
  }, []);

  // Rest of your component...
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.4)",
      transition: { duration: 0.7 },
    },
    tap: { scale: 0.95 },
  };

  const featureItems: FeatureItem[] = [
    {
      title: "AI-Powered",
      description: "Generate high-quality content using advanced AI models",
      icon: "✨",
    },
    {
      title: "Time-Saving",
      description: "Create content in seconds that would take hours manually",
      icon: "⏱️",
    },
    {
      title: "Customizable",
      description: "Fine-tune outputs to match your specific requirements",
      icon: "🔧",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFDADA] to-[#AEE2FF] dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center flex-col justify-center text-center">



        {/* Add Flex Column for Image and Text */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-7"
        >
          {/* Image Above Text */}
          <Image
            src="/logos.png"
            alt="Logo"
            width={330}
            height={330}
            priority
            className="drop-shadow-xl mx-auto"
            style={{ transformOrigin: "center" }}
          />
        </motion.div>

        {/* Text Below Image */}
        <motion.h1
          className="font-extrabold text-transparent text-5xl md:text-7xl lg:text-8xl bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 mb-1 tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          AI Content Generation 
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300 mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Create high-quality, original content in seconds with our powerful AI tools
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <motion.div variants={buttonVariants} initial="idle" whileHover="hover" whileTap="tap">
            <Link href="/dashboard">
              <span className="inline-flex justify-center items-center gap-x-2 px-8 py-4 text-lg font-semibold bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition">
                Get Started
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </Link>
          </motion.div>
          <motion.div variants={buttonVariants} initial="idle" whileHover="hover" whileTap="tap">
            <Link href="/demo">
              <span className="inline-flex justify-center items-center gap-x-2 px-8 py-4 text-lg font-semibold bg-white text-teal-600 border-2 border-teal-200 rounded-full shadow-md hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition dark:bg-slate-800 dark:text-teal-400 dark:border-slate-700 dark:hover:border-slate-600">
                Watch Demo
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4 dark:text-teal-300">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Our platform leverages cutting-edge AI to transform how you create content
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 1, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-teal-700 dark:text-teal-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      

      {/* About section */}
      <AboutSection />
      
      {/* How It Works section */}
      <HowItWorksSection />
      
      {/* Use Cases section */}
      <UseCasesSection />
      
      {/* Testimonials section */}
      <TestimonialsSection />
      
      <DevelopersSection />

      
      {/* Pricing section */}
      <PricingSection />
      
      
          {/* CTA section */}
          <div className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white py-16 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-teal-800 dark:text-teal-300">
              Ready to transform your content creation?
            </h2>
            <motion.div
              variants={{
                idle: { scale: 1 },
                hover: {
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.4)",
                  transition: { duration: 0.7 },
                },
                tap: { scale: 0.95 },
              }}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="inline-block"
            >
              <Link href="/dashboard">
                <span className="inline-flex justify-center items-center px-8 py-4 text-lg bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition">
                  Get Started Today
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

{/* Ultra Dynamic Floating Button with Enhanced Visual Effects - Fixed Tooltip */}
<motion.div
  className="fixed bottom-8 right-8 z-50 cursor-pointer group"
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ 
    opacity: 1, 
    scale: 1,
    y: [0, -15, 0], // Enhanced floating amplitude
    transition: { 
      delay: 0.8, 
      duration: 0.8,
      y: { 
        repeat: Infinity, 
        duration: 3, 
        ease: "easeInOut" 
      } 
    }
  }}
  whileHover={{ 
    scale: 1.25,
    rotate: [0, 8, -8, 0], // More dynamic hover effect
    transition: { 
      rotate: { 
        repeat: 1, 
        duration: 0.5,
        ease: "easeOut"
      } 
    }
  }}
  whileTap={{ 
    scale: 0.85,
    rotate: [0, 15, -15, 0] // More pronounced click feedback
  }}
>
  <Link href="/contact" className="relative block">
    {/* Main Button with Enhanced Glow & Multi-layered Effects */}
    <motion.button
      className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-5 rounded-full shadow-2xl relative overflow-hidden backdrop-blur-sm"
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(129, 140, 248, 0.7)",
          "0 0 25px 15px rgba(129, 140, 248, 0.3)",
          "0 0 0 0 rgba(129, 140, 248, 0.7)"
        ],
        background: [
          "linear-gradient(to bottom right, #6366f1, #8b5cf6, #ec4899)",
          "linear-gradient(to bottom right, #818cf8, #a78bfa, #f472b6)",
          "linear-gradient(to bottom right, #6366f1, #8b5cf6, #ec4899)"
        ]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      aria-label="Contact us"
    >
      {/* Multiple Glow Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.5 + i * 0.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}

      {/* Spinning Highlight Effect */}
      <motion.span
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Chat Icon with Enhanced Animation */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 0, 5, -5, 0, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.4, 0.5, 0.6, 0.7, 1]
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
          <circle cx="12" cy="8" r="1" fill="white" />
          <circle cx="8" cy="8" r="1" fill="white" />
        </svg>
      </motion.div>

      {/* Enhanced Floating Particles with Varied Sizes & Colors */}
      {[...Array(12)].map((_, i) => {
        const isLargeParticle = i < 3;
        const size = isLargeParticle ? Math.random() * 5 + 3 : Math.random() * 3 + 1;
        const colors = ['bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-white'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.span
            key={i}
            className={`absolute ${color} rounded-full`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 60],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0, isLargeParticle ? 0.9 : 0.7, 0],
              scale: [1, 1.8, 0.4]
            }}
            transition={{
              delay: Math.random() * 2,
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3
            }}
          />
        );
      })}
    </motion.button>

    {/* Fixed Tooltip with Explicit Transition for Group Hover */}
    <div 
      className="absolute right-16 bottom-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-x-8 group-hover:translate-x-0 transition-all duration-300 ease-in-out"
      style={{
        transitionProperty: "opacity, visibility, transform",
        willChange: "opacity, visibility, transform"
      }}
    >
      <div className="bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-xl shadow-xl border border-white/20 whitespace-nowrap">
        <span>NEED HELP? CLICK ME!</span>
        
        {/* Animated arrow inside tooltip */}
        <motion.div 
          className="ml-1 inline-block"
          animate={{ 
            x: [0, 3, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          👋
        </motion.div>
        
        {/* Tooltip pointer */}
        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-3 h-3 bg-black/80 border-t border-r border-white/20 rotate-45"></div>
      </div>
    </div>
    
    {/* Ripple effect when the button appears */}
    <motion.div
      className="absolute inset-0 rounded-full border-4 border-white/40"
      initial={{ scale: 0.2, opacity: 1 }}
      animate={{
        scale: 2.5,
        opacity: 0
      }}
      transition={{
        duration: 1.5,
        delay: 1,
        ease: "easeOut"
      }}
    />
  </Link>
</motion.div>
    </div>
  );
}