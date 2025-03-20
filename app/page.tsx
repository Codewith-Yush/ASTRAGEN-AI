"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { motion } from "framer-motion";
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
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageReveal = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for modern feel
      },
    },
  };

  return (
    <motion.section
      className="py-20 bg-gray-100 dark:bg-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div data-scroll className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          variants={fadeInUp}
        >
          <h2 data-scroll data-scroll-speed="2" className="text-3xl md:text-4xl font-bold text-teal-800 mb-6 dark:text-teal-300 tracking-tight">
            About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Learn more about our company and our mission to revolutionize content creation using AI.
          </p>
        </motion.div>

        {/* Minimalist Image Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* First Image */}
          <motion.div 
            className="group aspect-[4/3] relative overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800"
            variants={imageReveal}
          >
            <Image
              src="/3852.gif" 
              alt="Our approach" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              className="transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-teal-900/20 transition-all duration-500"/>
            <div className="absolute bottom-0 left-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-1">Human-centered design</h3>
              <div className="h-0.5 w-10 bg-teal-300 mb-3"></div>
              <p className="text-white/90 text-sm">Creating AI solutions with people in mind.</p>
            </div>
          </motion.div>

          {/* Second Image */}
          <motion.div 
            className="group aspect-[4/3] relative overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800"
            variants={imageReveal}
            transition={{ delay: 0.15 }}
          >
            <Image
              src="/car.gif" 
              alt="Our technology" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              className="transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-teal-900/20 transition-all duration-500"/>
            <div className="absolute bottom-0 left-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-1">Cutting-edge AI</h3>
              <div className="h-0.5 w-10 bg-teal-300 mb-3"></div>
              <p className="text-white/90 text-sm">Leveraging the latest in AI technology.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
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
    <section className="py-24 bg-white dark:bg-slate-900">
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

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    { 
      number: "01", 
      title: "Select Content Type", 
      description: "Choose from a variety of content types including blog posts, product descriptions, or creative writing." 
    },
    { 
      number: "02", 
      title: "Define Parameters", 
      description: "Set your requirements such as tone, length, keywords, and target audience." 
    },
    { 
      number: "03", 
      title: "Generate & Edit", 
      description: "Our AI creates content instantly, which you can then refine and personalize." 
    },
  ];

  return (
    <section className="py-24 bg-gray-100 dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6 dark:text-teal-300 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Get your content created in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-lg">
                <div className="text-teal-500 text-4xl font-light mb-4">{step.number}</div>
                <h3 className="text-xl font-medium text-teal-700 dark:text-teal-300 mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-teal-200 dark:bg-teal-700 transform translate-x-4"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "This AI tool has doubled our content production with the same team size. The quality is impressive, requiring minimal editing.",
      author: "Rajendra T.",
      role: "CS Student"
    },
    {
      quote: "As a solopreneur, this platform has been a game-changer for creating professional marketing materials consistently.",
      author: "Raj S.",
      role: "CS Student"
    },
    {
      quote: "The ability to customize the AI output to match our brand voice has been invaluable for our marketing team.",
      author: "Vikrant C.",
      role: "CS Student"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6 dark:text-teal-300 tracking-tight">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed">
            Join thousands of satisfied users creating content with our AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-100 dark:bg-slate-800 p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <svg className="w-8 h-8 text-teal-500 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{testimonial.quote}</p>
              <div>
                <p className="font-medium text-teal-700 dark:text-teal-300">{testimonial.author}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
              </div>
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
    <section className="py-24 bg-gray-100 dark:bg-slate-800">
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
  const buttonsRef = useRef(null);
  
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
    
    /// Buttons animation
if (buttonsRef.current) {
  tl.from(buttonsRef.current.children, {
    duration: 0.8,
    opacity: 0,
    y: 20,
    stagger: 0.15,
    ease: "back.out(1.7)"
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
            src="/logo.jpg"
            alt="Logo"
            width={220}
            height={220}
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
      <section className="py-20 bg-white dark:bg-slate-900">
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
      
      {/* Pricing section */}
      <PricingSection />

      {/* CTA section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white py-20 dark:from-slate-800 dark:to-slate-900">
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
              variants={buttonVariants}
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
    </div>
  );
}