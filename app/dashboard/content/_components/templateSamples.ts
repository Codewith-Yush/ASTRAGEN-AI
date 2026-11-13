/**
 * Curated, realistic sample inputs for every AI template.
 * Enables the "Try Sample" / "Fill Example" 1-click feature for instant testing.
 */

export const TEMPLATE_SAMPLES: Record<string, Record<string, any>> = {
  "blog-title-generator": {
    niche: "Artificial Intelligence & Productivity Tools",
    outline:
      "How modern generative AI workflows can save freelancers and small business teams 10+ hours per week, covering prompt engineering, smart email automation, and automated content repurposing.",
  },
  "blog-content-creator": {
    topic: "The Future of AI-Powered Workspace Automation in 2026",
    outline:
      "Introduction: The rise of autonomous AI assistants. Key Trend 1: Multimodal streaming workflows. Key Trend 2: Local and private LLMs for privacy. Actionable Steps: How teams can start integrating AI safely today. Conclusion and future outlook.",
  },
  "assignment-planner": {
    assignmentDetails:
      "Comprehensive Research Project on Renewable Energy Adoption in Developing Nations (Word count: 3,500 words, including literature review, statistical data analysis, and policy recommendations).",
    deadline: "Next Friday, 5:00 PM",
    dailyHours: "2.5 hours",
  },
  "study-schedule-planner": {
    subjects:
      "Organic Chemistry (Reaction mechanisms & stereochemistry), Multivariable Calculus (Double integrals & vector fields), Computer Systems (Memory hierarchy & cache coherence)",
    hoursAvailable: "4 hours per day",
    deadline: "Final exam week in 14 days",
  },
  "concept-map-creator": {
    conceptTopic: "Distributed Systems Consensus Algorithms",
    contentDetails:
      "Compare Raft, Paxos, and PBFT focusing on leader election, log replication, fault tolerance, and network partition resilience.",
    discipline: "Computer Science / Distributed Computing",
    complexityLevel: "Comprehensive",
    relationships:
      "Leader Election -> Heartbeat Mechanism -> Log Consistency -> Byzantine Fault Tolerance",
  },
  "essay-outline-builder": {
    essayTopic:
      "The Socioeconomic Impact of Remote Work on Urban Housing Markets",
    researchPoints:
      "Deurbanization trends, rise of secondary suburban hubs, commercial real estate devaluation, and shifts in local municipal tax revenues.",
    discipline: "Urban Economics & Sociology",
    wordCount: "2500",
    citationStyle: "APA 7th Edition",
  },
  "study-note-generator": {
    courseContent:
      "Cellular Respiration and ATP Synthesis: Glycolysis occurs in the cytoplasm yielding 2 pyruvate, 2 ATP, and 2 NADH. The Krebs cycle (citric acid cycle) in mitochondrial matrix produces 2 ATP, 6 NADH, and 2 FADH2 per glucose. The Electron Transport Chain on the inner mitochondrial membrane drives oxidative phosphorylation through ATP synthase, yielding approximately 30-32 total ATP.",
    subject: "Molecular Biology",
    focusTopics: "ATP Yield, Chemiosmosis, Redox Reactions",
    academicLevel: "Undergraduate",
    studyFormat: "Detailed",
  },
  "comprehensive-quiz-generator": {
    sourceMaterial:
      "Photosynthesis and Cellular Respiration form an interconnected ecological cycle. Photosynthesis in chloroplasts converts carbon dioxide, water, and sunlight into glucose and oxygen. Cellular respiration in mitochondria uses oxygen to break down glucose into ATP energy, releasing carbon dioxide and water as byproducts. Key enzymes like RuBisCO catalyze carbon fixation in the Calvin cycle, while ATP synthase utilizes proton gradients in both thylakoids and mitochondria to generate cellular chemical energy.",
    questionTypes: ["mcq", "true_false", "open_ended"],
    questionCount: 10,
    academicLevel: "undergrad",
    focusAreas: "Enzyme Kinetics, Proton Gradient, Energy Balance",
    realWorldApps: "yes",
  },
  "youtube-description-generator": {
    topic: "10 Proven Productivity Habits That Changed My Life",
    outline:
      "Timestamps: 0:00 Intro, 1:15 Habit 1: The 2-Minute Rule, 3:30 Habit 2: Time Blocking, 6:00 Habit 3: Digital Decluttering, 8:45 Habit 4: Weekly Review, 11:20 Summary. Resources, links to favorite apps, and affiliate disclaimer.",
  },
  "youtube-tag-generator": {
    title: "How to Build a Full-Stack AI SaaS in 2026 (Next.js, Tailwind, Gemini API)",
    outline:
      "Step-by-step tutorial covering authentication, database schema, AI streaming, Stripe billing, and deployment.",
  },
  "youtube-shorts-script-generator": {
    topic: "The 5-Second Brain Trick to Stop Procrastination",
    audience: "Students, creators, and professionals who struggle with focus",
    context:
      "Fast-paced, hook in the first 2 seconds, high energy, psychological explanation of the 'countdown method', and call to action to subscribe.",
  },
  "article-rewriter": {
    article:
      "Artificial intelligence is rapidly changing how content creators work. Today, writers and marketers use machine learning models to brainstorm outlines, summarize complex research papers, draft social media captions, and optimize articles for search engines. While early AI tools produced repetitive text, modern large language models offer nuance, personality, and contextual accuracy.",
  },
  "linkedin-post-generator": {
    topic: "Lessons learned from scaling a web application to 100,000 active users",
    audience: "Software engineers, tech founders, and product managers",
    keyPoints:
      "1. Premature optimization is real; prioritize database indexing over complex caches early on.\n2. Observability and error monitoring save weekends.\n3. Listening to user support tickets reveals the best roadmap features.",
    tone: "Inspirational & Authentic",
  },
  "linkedin-profile-optimizer": {
    jobTitle: "Senior Full Stack Engineer & Cloud Architect",
    industry: "Software & AI SaaS",
    skills:
      "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker, AI/LLM Integration",
    goals:
      "Transitioning into Tech Lead / Principal Engineering roles and consulting for fast-growing AI startups",
    audience: "Recruiters, engineering leaders, founders",
    tone: "Professional and authoritative",
  },
  "instagram-post-generator": {
    keywords: "morning routine, mindfulness, deep work, healthy habits, entrepreneurial mindset",
  },
  "instagram-hashtag-generator": {
    keywords: "web development, coding tips, frontend developer, learn to code, programming life",
  },
  "instagram-content-idea-generator": {
    keywords: "personal finance, investing for beginners, budgeting tips, financial independence",
  },
  "viral-tweet-thread": {
    topic: "7 mental models that make hard decisions feel effortless",
    perspective: "Practical founder and investor sharing actionable frameworks",
    audience: "Ambitious operators, engineers, and creators",
    keyPoints:
      "First Principles Thinking, Inversion, Opportunity Cost, Regret Minimization Framework, Second-Order Thinking, Pareto Principle (80/20), Hanlon's Razor",
  },
  "code-generator": {
    codeDescription:
      "Write a reusable React custom hook named `useDebounce` in TypeScript that debounces any value with a customizable delay (in ms) and cleans up timeouts properly on unmount.",
  },
  "code-explainer": {
    codeContent: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  "code-bug-detector": {
    codeInput: `async function fetchUserData(userIds) {
  const results = [];
  for (var i = 0; i < userIds.length; i++) {
    setTimeout(async () => {
      const res = await fetch('/api/user/' + userIds[i]);
      results.push(await res.json());
    }, 100);
  }
  return results;
}`,
  },
  "tagline-generator": {
    productName: "Astragen AI",
    outline:
      "An all-in-one generative AI content suite that empowers creators, educators, and developers to craft high-impact writing, code, and study guides in seconds.",
  },
  "product-description-generator": {
    productName: "AeroFlex Ergonomic Memory Foam Pillow",
    outline:
      "Targeting side and back sleepers with chronic neck tension. Features cooling gel infusion, breathable bamboo cover, hypoallergenic certified materials, and dual-contour cervical support.",
  },
  "seo-content-optimizer": {
    content:
      "Remote work offers flexibility and saves commute time. However, managing teams across different time zones requires clear communication tools and structured documentation to avoid burnout and keep projects on track.",
    keywords:
      "remote team management, asynchronous communication, remote work productivity, distributed teams",
    audience: "Operations managers and remote team leads",
    industry: "SaaS & Remote Workforce Management",
  },
  "language-drill-generator": {
    sourceMaterial:
      "Bonjour ! Je m'appelle Thomas. J'adore voyager en train à travers l'Europe et découvrir de nouveaux restaurants traditionnels avec mes amis chaque week-end.",
    targetLanguage: "French",
    nativeLanguage: "English",
    focusAreas: ["Vocabulary", "Grammar"],
    difficulty: 3,
  },
  "case-study-generator": {
    field: "Business",
    topic:
      "Turnaround Strategy for a Brick-and-Mortar Retailer Transitioning to Direct-to-Consumer E-Commerce",
    audienceLevel: "Advanced",
    includeEthics: true,
    caseLength: "Standard (3-5 pages)",
  },
  "research-paper-analyzer": {
    paperContent:
      "Abstract: Attention Is All You Need. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
    field: "Deep Learning / Natural Language Processing",
    audienceLevel: "Graduate",
    includeAnalysis: true,
  },
  "ai-image-prompt-generator": {
    aiTool: "Midjourney v6",
    subject: "A futuristic solar punk greenhouse floating in space above Earth",
    style: "Cinematic lighting, hyper-realistic, 8k resolution, octane render, soft ambient god rays",
    details:
      "Lush bioluminescent tropical flora, holographic climate monitors, warm golden hour sunbeams filtering through geometric glass panels.",
  },
  "ai-prompt-engineer": {
    aiTool: "Gemini 1.5 Pro / Claude 3.5 Sonnet",
    goal:
      "Act as an expert technical interviewer assessing a Senior Distributed Systems Engineer on designing an event-driven notification service.",
    requirements:
      "Include step-by-step follow-up probing questions, evaluation rubrics (scalability, idempotency, retry backoff), and sample ideal candidate answers.",
  },
  "podcast-episode-planner": {
    topic: "The Psychology of Peak Athletic Performance and Mental Grit",
    genre: "Health, Wellness & Human Optimization",
    guestInfo: "Dr. Elena Vance, Olympic sports psychologist and author of 'Mind Over Muscle'",
    audience: "Athletes, fitness enthusiasts, and high performers",
  },
  "meeting-agenda-creator": {
    purpose: "Q3 Product Strategy Alignment and Feature Prioritization",
    topics:
      "1. Review Q2 user feedback and retention metrics.\n2. Prioritize upcoming AI assistant capabilities.\n3. Technical architecture considerations for realtime streaming.\n4. Resource allocation & sprint milestones.",
    duration: "45 minutes",
    participants: "Head of Product, Engineering Leads, Design Lead, QA Lead",
    includeActionItems: true,
  },
  "content-repurposer": {
    originalContent:
      "Building an audience isn't about being on every single social platform. It's about dominating one platform where your ideal customers hang out, learning their language, delivering consistent value for 6 months, and then distributing that core content everywhere else.",
    platforms: "Twitter thread, LinkedIn post, and Instagram Carousel",
    contentGoal:
      "Demonstrate strategic thinking on organic audience growth and drive newsletter signups",
    brandVoice: "Direct, practical, no-fluff, actionable",
  },
};

