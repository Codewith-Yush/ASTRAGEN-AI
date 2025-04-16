const tools = [
  // Blog Tools
  {
    name: "Blog Title Generator",
    desc: "Create compelling blog titles tailored to your niche and content outline",
    category: "Blog",
    icon: "https://cdn-icons-png.flaticon.com/128/4186/4186534.png",
    slug: "blog-title-generator",
    aiPrompt: "Generate 5 blog title ideas based on the provided niche and outline. Format as bullet points in a rich text editor.",
    form: [
      {
        label: "Blog niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Blog outline (optional)",
        field: "textarea",
        name: "outline",
        required: false,
      },
    ],
  },
  {
    name: "Blog Content Creator",
    desc: "Generate detailed blog content based on your topic and outline",
    category: "Blog",
    icon: "https://cdn-icons-png.flaticon.com/128/4905/4905454.png",
    slug: "blog-content-creator",
    aiPrompt: "Create comprehensive blog content based on the provided topic and outline. Format in a rich text editor with clear headings and sections.",
    form: [
      {
        label: "Blog topic",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Blog outline (optional)",
        field: "textarea",
        name: "outline",
        required: false,
      },
    ],
  },

  // Learning Tools
 
  // Education Tools
  {
    name: "Assignment Planner",
    desc: "Organize assignments into daily tasks with milestones and time estimates",
    category: "Education",
    icon: "https://cdn-icons-png.flaticon.com/128/4201/4201125.png",
    slug: "assignment-planner",
    aiPrompt: "Generate a daily study plan for the assignment, including specific goals, estimated time per task, and milestone checkpoints, based on the provided details and deadline.",
    form: [
      {
        label: "Assignment title and description",
        field: "textarea",
        name: "assignmentDetails",
        required: true,
      },
      {
        label: "Deadline date (optional)",
        field: "input",
        name: "deadline",
        required: false,
      },
      {
        label: "Daily study hours (optional)",
        field: "input",
        name: "dailyHours",
        required: false,
      },
    ],
  },
  {
    name: "Study Schedule Planner",
    desc: "Design a balanced daily/weekly study timetable based on subjects and goals",
    category: "Education",
    icon: "https://cdn-icons-png.flaticon.com/128/2088/2088617.png",
    slug: "study-schedule-planner",
    aiPrompt: "Create a study schedule based on subjects, available hours, and priorities. Include breaks and balanced distribution. Format as a timetable in a rich text editor.",
    form: [
      {
        label: "List of subjects/topics",
        field: "textarea",
        name: "subjects",
        required: true,
      },
      {
        label: "Daily study hours",
        field: "input",
        name: "hoursAvailable",
        required: true,
      },
      {
        label: "Exam date or deadline (optional)",
        field: "input",
        name: "deadline",
        required: false,
      },
    ],
  },
  {
    name: "Concept Map Creator",
    desc: "Visualize complex topics with hierarchical concept maps showing key relationships",
    category: "Education",
    icon: "https://cdn-icons-png.flaticon.com/128/2910/2910824.png",
    slug: "concept-map-creator",
    aiPrompt: "Generate a text-based concept map for the provided topic, organizing central ideas, secondary concepts, and relationships hierarchically using indentation and arrows. Include brief explanations of connections in a rich text editor format.",
    form: [
      {
        label: "Topic or subject",
        field: "textarea",
        name: "conceptTopic",
        required: true,
      },
      {
        label: "Content details or notes (optional)",
        field: "textarea",
        name: "contentDetails",
        required: false,
      },
      {
        label: "Academic discipline",
        field: "input",
        name: "discipline",
        required: true,
      },
      {
        label: "Complexity level (Basic, Intermediate, Comprehensive, optional)",
        field: "input",
        name: "complexityLevel",
        required: false,
      },
      {
        label: "Specific relationships to highlight (optional)",
        field: "input",
        name: "relationships",
        required: false,
      },
    ],
  },
  {
    name: "Essay Outline Builder",
    desc: "Create structured essay outlines with thesis, topic sentences, and evidence",
    category: "Education",
    icon: "https://cdn-icons-png.flaticon.com/128/2541/2541988.png",
    slug: "essay-outline-builder",
    aiPrompt: "Generate a detailed essay outline with a thesis statement, organized sections, topic sentences, supporting evidence, and counter-arguments (if applicable). Use a hierarchical structure (I, A, 1) in a rich text editor format.",
    form: [
      {
        label: "Essay topic or research question",
        field: "textarea",
        name: "essayTopic",
        required: true,
      },
      {
        label: "Key research points or evidence (optional)",
        field: "textarea",
        name: "researchPoints",
        required: false,
      },
      {
        label: "Academic discipline",
        field: "input",
        name: "discipline",
        required: true,
      },
      {
        label: "Target word count (optional)",
        field: "input",
        name: "wordCount",
        required: false,
      },
      {
        label: "Citation style (APA, MLA, Chicago, etc., optional)",
        field: "input",
        name: "citationStyle",
        required: false,
      },
    ],
  },
  {
    name: "Study Note Generator",
    desc: "Convert course materials into organized study guides with summaries and questions",
    category: "Education",
    icon: "https://cdn-icons-png.flaticon.com/128/3024/3024163.png",
    slug: "study-note-generator",
    aiPrompt: "Transform the provided content into study notes with clear headings, key concept summaries, bullet points, mnemonics (if applicable), and 5-10 practice questions with answers. Format in a rich text editor for easy studying.",
    form: [
      {
        label: "Textbook chapter, lecture notes, or course material",
        field: "textarea",
        name: "courseContent",
        required: true,
      },
      {
        label: "Subject or course name",
        field: "input",
        name: "subject",
        required: true,
      },
      {
        label: "Focus topics (optional, separate with commas)",
        field: "input",
        name: "focusTopics",
        required: false,
      },
      {
        label: "Academic level (High School, Undergraduate, Graduate, optional)",
        field: "input",
        name: "academicLevel",
        required: false,
      },
      {
        label: "Study format (Condensed, Detailed, Visual, optional)",
        field: "input",
        name: "studyFormat",
        required: false,
      },
    ],
  },
  {
    "name": "Quiz Generator",
    "desc": "Create customized quizzes with multiple-choice, true/false, or open-ended questions",
    "category": "Education",
    "icon": "https://cdn-icons-png.flaticon.com/128/2921/2921222.png",
    "slug": "quiz-generator",
    "aiPrompt": "Generate a quiz with 5-15 questions (multiple-choice, true/false, or open-ended) based on the provided content or topic. Include answer keys and explanations for each question. Format in a rich text editor with clear question numbering and sections.",
    "form": [
      {
        "label": "Source material or quiz topic",
        "field": "textarea",
        "name": "sourceMaterial",
        "required": true
      },
      {
        "label": "Question type (Multiple-choice, True/False, Open-ended, Mixed)",
        "field": "select",
        "name": "questionType",
        "options": ["Multiple-choice", "True/False", "Open-ended", "Mixed"],
        "required": true
      },
      {
        "label": "Number of questions (5-15)",
        "field": "range",
        "name": "questionCount",
        "min": 5,
        "max": 15,
        "required": true
      },
      {
        "label": "Academic level (optional)",
        "field": "input",
        "name": "academicLevel",
        "required": false
      },
      {
        "label": "Include explanations? (optional)",
        "field": "checkbox",
        "name": "includeExplanations",
        "required": false
      }
    ]
  },
  // YouTube Tools
  {
    name: "YouTube Description Generator",
    desc: "Craft engaging YouTube video descriptions with emojis and key points",
    category: "YouTube",
    icon: "https://cdn-icons-png.flaticon.com/128/2111/2111748.png",
    slug: "youtube-description-generator",
    aiPrompt: "Generate a concise YouTube video description (4-5 lines) with emojis, based on the topic and outline. Format in a rich text editor.",
    form: [
      {
        label: "Video topic or title",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Video outline (optional)",
        field: "textarea",
        name: "outline",
        required: false,
      },
    ],
  },
  {
    name: "YouTube Tag Generator",
    desc: "Create relevant tags to boost YouTube video discoverability",
    category: "YouTube",
    icon: "https://cdn-icons-png.flaticon.com/128/4674/4674918.png",
    slug: "youtube-tag-generator",
    aiPrompt: "Generate 10 YouTube tags based on the provided title and outline. Format as bullet points in a rich text editor.",
    form: [
      {
        label: "YouTube video title",
        field: "input",
        name: "title",
        required: true,
      },
      {
        label: "Video outline (optional)",
        field: "textarea",
        name: "outline",
        required: false,
      },
    ],
  },
  {
    name: "YouTube Shorts Script Generator",
    desc: "Write engaging 30-60 second scripts for YouTube Shorts",
    category: "YouTube",
    icon: "https://cdn-icons-png.flaticon.com/128/9156/9156397.png",
    slug: "youtube-shorts-script-generator",
    aiPrompt: "Generate a 30-60 second YouTube Shorts script with a hook, main content, and call-to-action, based on the topic and audience. Format in a rich text editor.",
    form: [
      {
        label: "Trend or topic for Shorts",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Target audience",
        field: "input",
        name: "audience",
        required: true,
      },
      {
        label: "Additional context or points (optional)",
        field: "textarea",
        name: "context",
        required: false,
      },
    ],
  },

  // Writing Tools
  {
    name: "Article Rewriter",
    desc: "Rewrite articles to ensure originality and avoid plagiarism",
    category: "Writing",
    icon: "https://cdn-icons-png.flaticon.com/128/3131/3131607.png",
    slug: "article-rewriter",
    aiPrompt: "Rewrite the provided article to ensure originality, maintaining its meaning and tone. Format in a rich text editor.",
    form: [
      {
        label: "Article or content to rewrite",
        field: "textarea",
        name: "article",
        required: true,
      },
    ],
  },

  // Social Media Tools
  {
    "name": "LinkedIn Post Generator",
    "desc": "Craft professional LinkedIn posts to boost engagement",
    "category": "Social Media",
    "icon": "https://cdn-icons-png.flaticon.com/128/3536/3536505.png",
    "slug": "linkedin-post-generator",
    "aiPrompt": "Generate 3 LinkedIn posts based on the provided topic or expertise, with a professional tone, engaging hook, and call-to-action. Include hashtags and format in a rich text editor.",
    "form": [
      {
        "label": "Post topic or expertise",
        "field": "input",
        "name": "topic",
        "required": true
      },
      {
        "label": "Target audience (e.g., industry professionals, recruiters, optional)",
        "field": "input",
        "name": "audience",
        "required": false
      },
      {
        "label": "Key points to include (optional)",
        "field": "textarea",
        "name": "keyPoints",
        "required": false
      },
      {
        "label": "Desired tone (e.g., inspirational, informative, optional)",
        "field": "input",
        "name": "tone",
        "required": false
      }
    ]
  },
  {
    "name": "LinkedIn Profile Optimizer",
    "desc": "Optimize LinkedIn profile summaries and headlines for visibility and impact",
    "category": "Social Media",
    "icon": "https://cdn-icons-png.flaticon.com/128/732/732107.png",
    "slug": "linkedin-profile-optimizer",
    "aiPrompt": "Generate an optimized LinkedIn profile summary (150-300 words) and headline (up to 220 characters) based on the provided details, focusing on professional branding, keywords, and a compelling narrative. Include tips for profile enhancement (e.g., skills, endorsements) and format in a rich text editor.",
    "form": [
      {
        "label": "Current job title or role",
        "field": "input",
        "name": "jobTitle",
        "required": true
      },
      {
        "label": "Industry or field",
        "field": "input",
        "name": "industry",
        "required": true
      },
      {
        "label": "Key skills or expertise (separate with commas)",
        "field": "textarea",
        "name": "skills",
        "required": true
      },
      {
        "label": "Career goals or personal brand statement (optional)",
        "field": "textarea",
        "name": "goals",
        "required": false
      },
      {
        "label": "Target audience (e.g., recruiters, clients, optional)",
        "field": "input",
        "name": "audience",
        "required": false
      },
      {
        "label": "Desired tone (e.g., professional, approachable, optional)",
        "field": "input",
        "name": "tone",
        "required": false
      }
    ]
  },
  
  {
    name: "Instagram Post Generator",
    desc: "Design engaging Instagram posts based on keywords and trends",
    category: "Social Media",
    icon: "https://cdn-icons-png.flaticon.com/128/15713/15713420.png",
    slug: "instagram-post-generator",
    aiPrompt: "Generate 3 Instagram posts based on the provided keywords, incorporating trending elements. Format in a rich text editor.",
    form: [
      {
        label: "Keywords for the post",
        field: "input",
        name: "keywords",
        required: true,
      },
    ],
  },
  {
    name: "Instagram Hashtag Generator",
    desc: "Create targeted hashtags to increase Instagram post visibility",
    category: "Social Media",
    icon: "https://cdn-icons-png.flaticon.com/128/7045/7045432.png",
    slug: "instagram-hashtag-generator",
    aiPrompt: "Generate 15 Instagram hashtags based on the provided keywords, optimized for reach. Format in a rich text editor.",
    form: [
      {
        label: "Keywords for hashtags",
        field: "input",
        name: "keywords",
        required: true,
      },
    ],
  },
  {
    name: "Instagram Content Idea Generator",
    desc: "Suggest trending Instagram post or reel ideas for your niche",
    category: "Social Media",
    icon: "https://cdn-icons-png.flaticon.com/128/1029/1029183.png",
    slug: "instagram-content-idea-generator",
    aiPrompt: "Generate 5-10 Instagram post or reel ideas based on the niche and current trends. Format as bullet points in a rich text editor.",
    form: [
      {
        label: "Niche or keywords for ideas",
        field: "input",
        name: "keywords",
        required: true,
      },
    ],
  },
  {
    name: "Viral Tweet Thread Creator",
    desc: "Craft engaging Twitter/X threads to boost followers and interaction",
    category: "Social Media",
    icon: "https://cdn-icons-png.flaticon.com/128/5969/5969020.png",
    slug: "viral-tweet-thread",
    aiPrompt: "Generate a Twitter/X thread with a hook tweet, 5-8 content tweets, and a call-to-action tweet, based on the topic. Include hashtags and format each tweet within character limits in a rich text editor.",
    form: [
      {
        label: "Thread topic or main idea",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Your perspective or expertise (optional)",
        field: "textarea",
        name: "perspective",
        required: false,
      },
      {
        label: "Target audience (optional)",
        field: "input",
        name: "audience",
        required: false,
      },
      {
        label: "Key points to include (optional, separate with commas)",
        field: "textarea",
        name: "keyPoints",
        required: false,
      },
    ],
  },

  // Coding Tools
  {
    name: "Code Generator",
    desc: "Write programming code based on your specifications",
    category: "Coding",
    icon: "https://cdn-icons-png.flaticon.com/128/6062/6062646.png",
    slug: "code-generator",
    aiPrompt: "Generate code based on the provided description and programming language. Include comments and format in a rich text editor code block.",
    form: [
      {
        label: "Code description and programming language",
        field: "textarea",
        name: "codeDescription",
        required: true,
      },
    ],
  },
  {
    name: "Code Explainer",
    desc: "Provide line-by-line explanations for programming code",
    category: "Coding",
    icon: "https://cdn-icons-png.flaticon.com/128/8488/8488751.png",
    slug: "code-explainer",
    aiPrompt: "Explain the provided code line by line, detailing its functionality. Format in a rich text editor with code blocks and explanations.",
    form: [
      {
        label: "Code to explain",
        field: "textarea",
        name: "codeContent",
        required: true,
      },
    ],
  },
  {
    name: "Code Bug Detector",
    desc: "Identify and fix bugs in programming code with solutions",
    category: "Coding",
    icon: "https://cdn-icons-png.flaticon.com/128/4426/4426267.png",
    slug: "code-bug-detector",
    aiPrompt: "Analyze the provided code for bugs, explain issues, and provide fixed code with comments. Format in a rich text editor with code blocks.",
    form: [
      {
        label: "Code to debug",
        field: "textarea",
        name: "codeInput",
        required: true,
      },
    ],
  },

  // Marketing Tools
  {
    name: "Tagline Generator",
    desc: "Develop catchy taglines for brands or products",
    category: "Marketing",
    icon: "https://cdn-icons-png.flaticon.com/128/2178/2178616.png",
    slug: "tagline-generator",
    aiPrompt: "Generate 5-10 catchy taglines for the provided product or brand, based on its details. Format as bullet points in a rich text editor.",
    form: [
      {
        label: "Product or brand name",
        field: "input",
        name: "productName",
        required: true,
      },
      {
        label: "Product or service description",
        field: "textarea",
        name: "outline",
        required: true,
      },
    ],
  },
  {
    name: "Product Description Generator",
    desc: "Write SEO-friendly product descriptions for e-commerce",
    category: "Marketing",
    icon: "https://cdn-icons-png.flaticon.com/128/679/679922.png",
    slug: "product-description-generator",
    aiPrompt: "Generate an SEO-friendly product description based on the provided name and details, optimized for e-commerce. Format in a rich text editor.",
    form: [
      {
        label: "Product name",
        field: "input",
        name: "productName",
        required: true,
      },
      {
        label: "Product details",
        field: "textarea",
        name: "outline",
        required: true,
      },
    ],
  },
  {
    name: "SEO Content Optimizer",
    desc: "Enhance content for SEO with keyword integration and readability",
    category: "Marketing",
    icon: "https://cdn-icons-png.flaticon.com/128/11028/11028240.png",
    slug: "seo-content-optimizer",
    aiPrompt: "Optimize the provided content for SEO by integrating keywords, improving readability, and suggesting meta descriptions. Include an SEO analysis report. Format in a rich text editor.",
    form: [
      {
        label: "Content to optimize",
        field: "textarea",
        name: "content",
        required: true,
      },
      {
        label: "Target keywords (separate with commas)",
        field: "input",
        name: "keywords",
        required: true,
      },
      {
        label: "Target audience (optional)",
        field: "input",
        name: "audience",
        required: false,
      },
      {
        label: "Industry or niche (optional)",
        field: "input",
        name: "industry",
        required: false,
      },
    ],
  },

  // Language Tools
  {
    name: "Language Drill Generator",
    desc: "Create vocabulary and grammar exercises from texts or word lists",
    category: "Language",
    icon: "https://cdn-icons-png.flaticon.com/128/3898/3898156.png",
    slug: "language-drill-generator",
    aiPrompt: "Generate language exercises (vocabulary matching, fill-in-the-blank, sentence restructuring, translation, and contextual usage) based on the provided material, with progressive difficulty. Format in a rich text editor.",
    form: [
      {
        label: "Source text or word list",
        field: "textarea",
        name: "sourceMaterial",
        required: true,
      },
      {
        label: "Target language",
        field: "input",
        name: "targetLanguage",
        required: true,
      },
      {
        label: "Native language (optional)",
        field: "input",
        name: "nativeLanguage",
        required: false,
      },
      {
        label: "Focus areas (optional)",
        field: "select",
        name: "focusAreas",
        options: ["Vocabulary", "Grammar", "Reading", "Writing", "All"],
        multiple: true,
        required: false,
      },
      {
        label: "Difficulty level (1-5, optional)",
        field: "range",
        name: "difficulty",
        min: 1,
        max: 5,
        required: false,
      },
    ],
  },

  // Professional Tools
  {
    name: "Case Study Generator",
    desc: "Develop detailed case studies for business, medical, or legal fields",
    category: "Professional",
    icon: "https://cdn-icons-png.flaticon.com/128/3281/3281144.png",
    slug: "case-study-generator",
    aiPrompt: "Generate a case study with a realistic scenario, key facts, data, analysis frameworks, discussion questions, solutions, and teaching notes, tailored to the specified field. Format in a rich text editor.",
    form: [
      {
        label: "Case study field",
        field: "select",
        name: "field",
        options: ["Business", "Medicine", "Law", "Education", "Engineering", "Other"],
        required: true,
      },
      {
        label: "Specific topic or issue",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Target audience level (optional)",
        field: "select",
        name: "audienceLevel",
        options: ["Beginner", "Intermediate", "Advanced", "Expert"],
        required: false,
      },
      {
        label: "Include ethical considerations? (optional)",
        field: "checkbox",
        name: "includeEthics",
        required: false,
      },
      {
        label: "Preferred case length (optional)",
        field: "select",
        name: "caseLength",
        options: ["Brief (1-2 pages)", "Standard (3-5 pages)", "Detailed (5+ pages)"],
        required: false,
      },
    ],
  },

  // Academic Tools
  {
    name: "Research Paper Analyzer",
    desc: "Summarize academic papers with methodology, findings, and significance",
    category: "Academic",
    icon: "https://cdn-icons-png.flaticon.com/128/3652/3652191.png",
    slug: "research-paper-analyzer",
    aiPrompt: "Analyze the provided research paper, generating a plain-language summary, key findings, methodology overview, significance, limitations, and related works. Format in a rich text editor.",
    form: [
      {
        label: "Paper text or content",
        field: "textarea",
        name: "paperContent",
        required: true,
      },
      {
        label: "Academic field (optional)",
        field: "input",
        name: "field",
        required: false,
      },
      {
        label: "Target audience level (optional)",
        field: "select",
        name: "audienceLevel",
        options: ["Undergraduate", "Graduate", "Researcher", "General Public"],
        required: false,
      },
      {
        label: "Include critical analysis? (optional)",
        field: "checkbox",
        name: "includeAnalysis",
        required: false,
      },
    ],
  },

  // AI Tools
  {
    "name": "AI Image Prompt Generator",
    "desc": "Create prompts for AI image generation tools like Midjourney",
    "category": "AI Tools",
    "icon": "https://cdn-icons-png.flaticon.com/128/3655/3655579.png",
    "slug": "ai-image-prompt-generator",
    "aiPrompt": "Generate 3 detailed prompts for the specified AI image generation tool, including style, lighting, composition, and subject details. Provide formatting tips and examples, formatted in a rich text editor.",
    "form": [
      {
        "label": "AI image tool (e.g., Midjourney, Stable Diffusion)",
        "field": "input",
        "name": "aiTool",
        "required": true
      },
      {
        "label": "Desired image subject or theme",
        "field": "input",
        "name": "subject",
        "required": true
      },
      {
        "label": "Art style or aesthetic (e.g., realistic, cartoon, optional)",
        "field": "input",
        "name": "style",
        "required": false
      },
      {
        "label": "Additional details (e.g., colors, mood, optional)",
        "field": "textarea",
        "name": "details",
        "required": false
      }
    ]
  },
  {
    name: "AI Prompt Engineer",
    desc: "Design optimized prompts for AI tools like ChatGPT or DALL-E",
    category: "AI Tools",
    icon: "https://cdn-icons-png.flaticon.com/128/8002/8002173.png",
    slug: "ai-prompt-engineer",
    aiPrompt: "Generate 3 optimized prompts for the specified AI tool, tailored to the user’s goal and context, with clear formatting instructions. Format in a rich text editor.",
    form: [
      {
        label: "AI tool (e.g., ChatGPT, DALL-E)",
        field: "input",
        name: "aiTool",
        required: true,
      },
      {
        label: "Goal or desired output",
        field: "textarea",
        name: "goal",
        required: true,
      },
      {
        label: "Style, tone, or format requirements (optional)",
        field: "textarea",
        name: "requirements",
        required: false,
      },
    ],
  },

  // Content Tools
  {
    name: "Podcast Episode Planner",
    desc: "Plan podcast episodes with outlines, talking points, and guest questions",
    category: "Content",
    icon: "https://cdn-icons-png.flaticon.com/128/2659/2659399.png",
    slug: "podcast-episode-planner",
    aiPrompt: "Generate a podcast episode plan with an intro hook, 3-5 talking points with sub-points, 8-10 guest questions, and an outro. Format in a rich text editor.",
    form: [
      {
        label: "Episode topic or title",
        field: "input",
        name: "topic",
        required: true,
      },
      {
        label: "Podcast genre or style",
        field: "input",
        name: "genre",
        required: true,
      },
      {
        label: "Guest information (optional)",
        field: "textarea",
        name: "guestInfo",
        required: false,
      },
      {
        label: "Target audience (optional)",
        field: "input",
        name: "audience",
        required: false,
      },
    ],
  },
  {
    "name": "Meeting Agenda Creator",
    "desc": "Design structured meeting agendas with objectives and time allocations",
    "category": "Professional",
    "icon": "https://cdn-icons-png.flaticon.com/128/2099/2099085.png",
    "slug": "meeting-agenda-creator",
    "aiPrompt": "Generate a meeting agenda with a clear objective, 3-6 discussion topics, time allocations, and action items. Include facilitator notes and format in a rich text editor with a professional layout.",
    "form": [
      {
        "label": "Meeting purpose or objective",
        "field": "input",
        "name": "purpose",
        "required": true
      },
      {
        "label": "Key topics or discussion points",
        "field": "textarea",
        "name": "topics",
        "required": true
      },
      {
        "label": "Meeting duration (e.g., 30 minutes, 1 hour)",
        "field": "input",
        "name": "duration",
        "required": true
      },
      {
        "label": "Target audience or participants (optional)",
        "field": "input",
        "name": "participants",
        "required": false
      },
      {
        "label": "Include action item template? (optional)",
        "field": "checkbox",
        "name": "includeActionItems",
        "required": false
      }
    ]
  },
  {
    name: "Multi-Platform Content Repurposer",
    desc: "Adapt content for platforms like Twitter, LinkedIn, or YouTube",
    category: "Content",
    icon: "https://cdn-icons-png.flaticon.com/128/6664/6664504.png",
    slug: "content-repurposer",
    aiPrompt: "Repurpose the provided content for the selected platforms, optimizing for each platform’s format, length, and engagement patterns. Include separate sections for each platform in a rich text editor.",
    form: [
      {
        label: "Original content",
        field: "textarea",
        name: "originalContent",
        required: true,
      },
      {
        label: "Target platforms (e.g., Twitter, LinkedIn, Instagram)",
        field: "input",
        name: "platforms",
        required: true,
      },
      {
        label: "Content goal or key message (optional)",
        field: "textarea",
        name: "contentGoal",
        required: false,
      },
      {
        label: "Brand voice (optional, e.g., professional, casual)",
        field: "input",
        name: "brandVoice",
        required: false,
      },
    ],
  },
];

export default tools;