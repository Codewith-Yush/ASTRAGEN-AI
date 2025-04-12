// tools.js
const tools = [
  {
    name: 'Blog Title',
    desc: 'Generate blog titles based on your blog information',
    category: 'Blog',
    icon: 'https://cdn-icons-png.flaticon.com/128/4186/4186534.png',
    slug: 'generate-blog-title',
    aiPrompt: 'Give me 5 blog topic ideas in bullet points only based on the given niche & outline in rich text editor format',
    form: [
      {
        label: 'Enter your blog niche',
        field: 'input',
        name: 'niche',
        required: true
      },
      {
        label: 'Enter blog outline',
        field: 'textarea',
        name: 'outline'
      }
    ]
  },
  {
    name: 'Blog Content',
    desc: 'Generate comprehensive blog content based on your topic and outline',
    category: 'Blog',
    icon: 'https://cdn-icons-png.flaticon.com/128/4905/4905454.png',
    slug: 'blog-content-generation',
    aiPrompt: 'Generate Blog Content based on topic and outline in rich text editor format',
    form: [
      {
        label: 'Enter your blog topic',
        field: 'input',
        name: 'topic',
        required: true
      },
      {
        label: 'Enter blog outline here',
        field: 'textarea',
        name: 'outline'
      }
    ]
  },
  {
    name: 'Blog Topic Ideas',
    desc: 'Generate engaging blog topic ideas based on your niche',
    category: 'Blog',
    icon: 'https://cdn-icons-png.flaticon.com/128/11497/11497847.png',
    slug: 'blog-topic-idea',
    aiPrompt: 'Generate top 5 Blog Topic Ideas in bullet points only (no Description) based on niche in rich text editor format',
    form: [
      {
        label: 'Enter your niche',
        field: 'input',
        name: 'niche',
        required: true
      }
    ]
  },
  {
    name: 'Youtube SEO Title',
    desc: 'Create SEO-optimized YouTube video titles that rank higher',
    category: 'Youtube',
    icon: 'https://cdn-icons-png.flaticon.com/128/402/402075.png',
    slug: 'youtube-seo-title',
    aiPrompt: 'Give me best SEO-optimized high-ranked 5 title ideas in bullet points only based on keywords and outline in HTML tags format',
    form: [
      {
        label: 'Enter your YouTube video topic keywords',
        field: 'input',
        name: 'keywords',
        required: true
      },
      {
        label: 'Enter YouTube description outline here',
        field: 'textarea',
        name: 'outline'
      }
    ]
  },
  {
    name: 'Youtube Description',
    desc: 'Generate engaging YouTube video descriptions with appropriate emojis',
    category: 'Youtube',
    icon: 'https://cdn-icons-png.flaticon.com/128/2111/2111748.png',
    slug: 'youtube-description',
    aiPrompt: 'Generate Youtube description with emoji under 4-5 lines based on topic and outline in rich text editor format',
    form: [
      {
        label: 'Enter your video topic/title',
        field: 'input',
        name: 'topic',
        required: true
      },
      {
        label: 'Enter YouTube outline here',
        field: 'textarea',
        name: 'outline'
      }
    ]
  },
  {
    name: 'Youtube Tags',
    desc: 'Generate relevant tags for your YouTube videos to improve discoverability',
    category: 'Youtube',
    icon: 'https://cdn-icons-png.flaticon.com/128/4674/4674918.png',
    slug: 'youtube-tag',
    aiPrompt: 'Generate 10 Youtube tags in bullet points based on title and outline in rich text editor format',
    form: [
      {
        label: 'Enter your YouTube title',
        field: 'input',
        name: 'title',
        required: true
      },
      {
        label: 'Enter YouTube video outline here (Optional)',
        field: 'textarea',
        name: 'outline'
      }
    ]
  },
  {
    name: 'Rewrite Article (Plagiarism Free)',
    desc: 'Rewrite existing articles to bypass AI detectors and eliminate plagiarism',
    category: 'Writing',
    icon: 'https://cdn-icons-png.flaticon.com/128/3131/3131607.png',
    slug: 'rewrite-article',
    aiPrompt: 'Rewrite given article without any plagiarism in rich text editor format',
    form: [
      {
        label: '🤖 Provide your Article/Blogpost or any other content to rewrite',
        field: 'textarea',
        name: 'article',
        required: true
      }
    ]
  },
  {
    name: 'Text Improver',
    desc: 'Refine your writing by eliminating errors and improving readability',
    category: 'Writing',
    icon: 'https://cdn-icons-png.flaticon.com/128/1686/1686815.png',
    slug: 'text-improver',
    aiPrompt: 'Given textToImprove, rewrite text without any grammar mistakes and professionally in rich text editor format',
    form: [
      {
        label: 'Enter text that you want to rewrite or improve',
        field: 'textarea',
        name: 'textToImprove',
        required: true
      }
    ]
  },
  {
    name: 'Add Emojis to Text',
    desc: 'Enhance your text with relevant emojis to make it more engaging',
    category: 'Writing',
    icon: 'https://cdn-icons-png.flaticon.com/128/2584/2584606.png',
    slug: 'add-emoji-to-text',
    aiPrompt: 'Add emoji to outline text depends on outline and rewrite it in rich text editor format',
    form: [
      {
        label: 'Enter your text to add emojis',
        field: 'textarea',
        name: 'outline',
        required: true
      }
    ]
  },
  {
    name: 'Instagram Post Generator',
    desc: 'Create engaging Instagram posts based on your keywords',
    category: 'Social Media',
    icon: 'https://cdn-icons-png.flaticon.com/128/15713/15713420.png',
    slug: 'instagram-post-generator',
    aiPrompt: 'Generate 3 Instagram posts based on given keywords and give output in rich text editor format',
    form: [
      {
        label: 'Enter keywords for your post',
        field: 'input',
        name: 'keywords',
        required: true
      }
    ]
  },
  {
    name: 'Instagram Hashtag Generator',
    desc: 'Generate relevant hashtags to boost your Instagram post reach',
    category: 'Social Media',
    icon: 'https://cdn-icons-png.flaticon.com/128/7045/7045432.png',
    slug: 'instagram-hash-tag-generator',
    aiPrompt: 'Generate 15 Instagram hashtags based on given keywords and give output in rich text editor format',
    form: [
      {
        label: 'Enter keywords for your Instagram hashtags',
        field: 'input',
        name: 'keywords',
        required: true
      }
    ]
  },
  {
    name: 'Instagram Post/Reel Idea',
    desc: 'Generate trending Instagram content ideas based on your niche',
    category: 'Social Media',
    icon: 'https://cdn-icons-png.flaticon.com/128/1029/1029183.png',
    slug: 'instagram-post-idea-generator',
    aiPrompt: 'Generate 5-10 Instagram ideas based on niche with latest trends and give output in rich text editor format',
    form: [
      {
        label: 'Enter keywords/niche for your Instagram ideas',
        field: 'input',
        name: 'keywords',
        required: true
      }
    ]
  },
  {
    name: 'English Grammar Check',
    desc: 'Correct grammar errors in your text',
    category: 'Writing',
    icon: 'https://cdn-icons-png.flaticon.com/128/12596/12596700.png',
    slug: 'english-grammar-checker',
    aiPrompt: 'Rewrite the inputText by correcting the grammar and give output in rich text editor format',
    form: [
      {
        label: 'Enter text to correct the grammar',
        field: 'textarea',
        name: 'inputText',
        required: true
      }
    ]
  },
  {
    name: 'Write Code',
    desc: 'Generate programming code in any language based on your description',
    category: 'Coding',
    icon: 'https://cdn-icons-png.flaticon.com/128/6062/6062646.png',
    slug: 'write-code',
    aiPrompt: 'Based on user codeDescription, write code and give output in rich text editor format in code block',
    form: [
      {
        label: 'Enter description of code you want along with programming language',
        field: 'textarea',
        name: 'codeDescription',
        required: true
      }
    ]
  },
  {
    name: 'Explain Code',
    desc: 'Get a line-by-line explanation of programming code',
    category: 'Coding',
    icon: 'https://cdn-icons-png.flaticon.com/128/8488/8488751.png',
    slug: 'explain-code',
    aiPrompt: 'Based on user codeDescription, explain code line by line and give output in rich text editor format in code block',
    form: [
      {
        label: 'Enter code which you want to understand',
        field: 'textarea',
        name: 'codeContent',
        required: true
      }
    ]
  },
  {
    name: 'Code Bug Detector',
    desc: 'Identify and fix bugs in your code with detailed solutions',
    category: 'Coding',
    icon: 'https://cdn-icons-png.flaticon.com/128/4426/4426267.png',
    slug: 'code-bug-detector',
    aiPrompt: 'Based on user codeInput, find bugs in code and give solutions in rich text editor format in code block',
    form: [
      {
        label: 'Enter code which you want to test for bugs',
        field: 'textarea',
        name: 'codeInput',
        required: true
      }
    ]
  },
  {
    name: 'Tagline Generator',
    desc: 'Create catchy taglines for your brand or product',
    category: 'Marketing',
    icon: 'https://cdn-icons-png.flaticon.com/128/2178/2178616.png',
    slug: 'tagline-generator',
    aiPrompt: 'Based on user productName and outline, generate 5-10 catchy taglines for the business product and give output in rich text editor format',
    form: [
      {
        label: 'Product/Brand Name',
        field: 'input',
        name: 'productName',
        required: true
      },
      {
        label: 'What you are selling/marketing',
        field: 'textarea',
        name: 'outline',
        required: true
      }
    ]
  },
  {
    name: 'Product Description',
    desc: 'Generate SEO-friendly e-commerce product descriptions',
    category: 'Marketing',
    icon: 'https://cdn-icons-png.flaticon.com/128/679/679922.png',
    slug: 'product-description',
    aiPrompt: 'Based on user productName and description, generate a compelling description for e-commerce products and give output in rich text editor format',
    form: [
      {
        label: 'Product Name',
        field: 'input',
        name: 'productName',
        required: true
      },
      {
        label: 'Product Details',
        field: 'textarea',
        name: 'outline',
        required: true
      }
    ]
  },
  {
    name: 'TikTok Script Generator',
    desc: 'Create engaging short-form video scripts optimized for TikTok and similar platforms',
    category: 'Social Media',
    icon: 'https://cdn-icons-png.flaticon.com/128/9156/9156397.png',
    slug: 'tiktok-script-generator',
    aiPrompt: 'Generate a compelling 30-60 second TikTok script based on the trend/topic and target audience. Include hook, main content sections, and call-to-action in rich text editor format',
    form: [
      {
        label: 'Enter trend/topic for your TikTok video',
        field: 'input',
        name: 'topic',
        required: true
      },
      {
        label: 'Describe your target audience',
        field: 'input',
        name: 'audience',
        required: true
      },
      {
        label: 'Additional context or specific points to include (Optional)',
        field: 'textarea',
        name: 'context'
      }
    ]
  },
  {
    name: 'AI Prompt Engineer',
    desc: 'Create optimized prompts for ChatGPT, Claude, DALL-E, Midjourney and other AI tools',
    category: 'AI Tools',
    icon: 'https://cdn-icons-png.flaticon.com/128/8002/8002173.png',
    slug: 'ai-prompt-engineer',
    aiPrompt: 'Create 3 optimized AI prompts for the specified AI tool based on the user\'s goal and context. Include specific details, formatting instructions, and parameters that will generate the best results. Output in rich text editor format.',
    form: [
      {
        label: 'Which AI tool are you using? (ChatGPT, DALL-E, Midjourney, etc.)',
        field: 'input',
        name: 'aiTool',
        required: true
      },
      {
        label: 'What do you want to create/generate?',
        field: 'textarea',
        name: 'goal',
        required: true
      },
      {
        label: 'Any specific style, tone, or format requirements?',
        field: 'textarea',
        name: 'requirements'
      }
    ]
  },
  {
    name: 'Podcast Episode Planner',
    desc: 'Generate comprehensive podcast episode outlines including talking points and guest questions',
    category: 'Content',
    icon: 'https://cdn-icons-png.flaticon.com/128/2659/2659399.png',
    slug: 'podcast-episode-planner',
    aiPrompt: 'Create a detailed podcast episode plan based on the topic, including an intro hook, 3-5 main talking points with sub-points, 8-10 engaging questions for guests, and outro suggestions. Output in rich text editor format.',
    form: [
      {
        label: 'Podcast episode topic/title',
        field: 'input',
        name: 'topic',
        required: true
      },
      {
        label: 'Podcast genre/style',
        field: 'input',
        name: 'genre',
        required: true
      },
      {
        label: 'Guest information (if applicable)',
        field: 'textarea',
        name: 'guestInfo'
      },
      {
        label: 'Target audience',
        field: 'input',
        name: 'audience'
      }
    ]
  },
  {
    name: 'SEO Content Optimizer',
    desc: 'Transform existing content into highly optimized SEO material with keyword analysis and readability improvements',
    category: 'Marketing',
    icon: 'https://cdn-icons-png.flaticon.com/128/11028/11028240.png',
    slug: 'seo-content-optimizer',
    aiPrompt: 'Analyze and optimize the provided content for SEO. Identify keyword opportunities, improve readability, add semantic-related terms, optimize headings and structure, and suggest meta descriptions. Return the fully optimized content with an SEO analysis report in rich text editor format.',
    form: [
      {
        label: 'Enter the content you want to optimize',
        field: 'textarea',
        name: 'content',
        required: true
      },
      {
        label: 'Target keywords (separate with commas)',
        field: 'input',
        name: 'keywords',
        required: true
      },
      {
        label: 'Target audience',
        field: 'input',
        name: 'audience'
      },
      {
        label: 'Industry/niche',
        field: 'input',
        name: 'industry'
      }
    ]
  },
  {
    name: 'Multi-Platform Content Repurposer',
    desc: 'Transform a single piece of content into formats optimized for multiple platforms (Twitter, LinkedIn, Instagram, TikTok, Newsletter)',
    category: 'Content',
    icon: 'https://cdn-icons-png.flaticon.com/128/6664/6664504.png',
    slug: 'content-repurposer',
    aiPrompt: 'Transform the original content into optimized formats for the selected platforms. For each platform, create appropriate content that matches the platform\'s best practices, optimal length, formatting, and user engagement patterns. Output should include a separate section for each selected platform in rich text editor format.',
    form: [
      {
        label: 'Original content to repurpose',
        field: 'textarea',
        name: 'originalContent',
        required: true
      },
      {
        label: 'Select target platforms (separate with commas: Twitter, LinkedIn, Instagram, TikTok, YouTube, Newsletter, Blog)',
        field: 'input',
        name: 'platforms',
        required: true
      },
      {
        label: 'Content goal/key message',
        field: 'textarea',
        name: 'contentGoal'
      },
      {
        label: 'Brand voice (professional, casual, educational, etc.)',
        field: 'input',
        name: 'brandVoice'
      }
    ]
  },
  {
    name: 'Study Note Generator',
    desc: 'Transform textbook chapters, lecture notes, or course materials into organized study guides with key concepts and practice questions',
    category: 'Education',
    icon: 'https://cdn-icons-png.flaticon.com/128/3024/3024163.png',
    slug: 'study-note-generator',
    aiPrompt: 'Create comprehensive study notes from the provided educational content. Organize information into clear sections with headings, highlight key concepts and definitions, create bullet point summaries of important ideas, include mnemonics where helpful, and generate 5-10 practice questions with answers. Format output in rich text editor format optimized for studying.',
    form: [
      {
        label: 'Paste your textbook chapter, lecture notes, or course material',
        field: 'textarea',
        name: 'courseContent',
        required: true
      },
      {
        label: 'Subject/Course name',
        field: 'input',
        name: 'subject',
        required: true
      },
      {
        label: 'Specific topics to focus on (separate with commas)',
        field: 'input',
        name: 'focusTopics'
      },
      {
        label: 'Academic level (High School, Undergraduate, Graduate)',
        field: 'input',
        name: 'academicLevel'
      },
      {
        label: 'Preferred study format (Condensed, Detailed, Visual)',
        field: 'input',
        name: 'studyFormat'
      }
    ]
  },
  {
    name: 'Viral Tweet Thread Creator',
    desc: 'Generate engaging, shareable Twitter/X thread sequences that drive engagement and followers',
    category: 'Social Media',
    icon: 'https://cdn-icons-png.flaticon.com/128/5969/5969020.png',
    slug: 'viral-tweet-thread',
    aiPrompt: 'Create a compelling, high-engagement Twitter/X thread on the given topic. Include an attention-grabbing hook tweet, 5-8 substantive content tweets with actionable insights, and a strong closing tweet with call-to-action. Format each tweet within character limits and include appropriate hashtag suggestions. Output in rich text editor format with each tweet clearly numbered.',
    form: [
      {
        label: 'Thread topic/main idea',
        field: 'input',
        name: 'topic',
        required: true
      },
      {
        label: 'Your expertise/perspective on this topic',
        field: 'textarea',
        name: 'perspective'
      },
      {
        label: 'Target audience',
        field: 'input',
        name: 'audience'
      },
      {
        label: 'Key points to include (separate with commas)',
        field: 'textarea',
        name: 'keyPoints'
      }
    ]
  }
];

export default tools;