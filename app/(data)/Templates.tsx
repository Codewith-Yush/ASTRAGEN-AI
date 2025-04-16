const tools = [
  // Blog Tools
  {
    name: "Blog Title Generator",
    desc: "Create compelling blog titles tailored to your niche and content outline",
    category: "Blog",
    icon: "https://cdn-icons-png.flaticon.com/128/4186/4186534.png",
    slug: "blog-title-generator",
    aiPrompt: "## 🧠 AI Prompt: Blog Title Generator\n**Purpose**: Generate **5-10 engaging blog titles** based on the provided niche and outline.\n\n---\n\n### ✅ Requirements\n- Titles should be **catchy and SEO-friendly**\n- Include **power words** where appropriate\n- Vary title structures (lists, questions, how-tos)\n- Keep titles under **65 characters**\n\n---\n\n### 🖍️ Formatting Instructions\n- Output as **numbered list**\n- Highlight **power words** in bold\n- Include **estimated character count** for each\n\n---\n\n### 🧾 Example Output\n**1. 10 **Essential** Tips for [Niche] Beginners (58 chars)**\n**2. How to [Achieve Result] in Just 5 Simple Steps (52 chars)**\n**3. The **Ultimate** Guide to [Topic] (42 chars)**",
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
    aiPrompt:"## 🧠 AI Prompt: Blog Content Creator\n**Purpose**: Generate **comprehensive blog content** based on provided topic and outline.\n\n---\n\n### ✅ Requirements\n- Structure with **H2/H3 headings**\n- Include **introduction** and **conclusion**\n- Use **bullet points** for lists\n- Add **transition sentences** between sections\n- Maintain **consistent tone** throughout\n\n---\n\n### 🖍️ Formatting Instructions\n- Use **Markdown formatting**\n- Bold **key terms**\n- Italicize *examples*\n- Add > blockquotes for important notes\n\n---\n\n### 🧾 Example Output\n**## Introduction**  \n[Engaging opening paragraph...]  \n\n**## Main Section 1**  \n- Key point 1 with explanation  \n- *Example*: [Relevant example]  \n> **Note**: [Important clarification]",
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
    aiPrompt: "## 🧠 AI Prompt: Assignment Planner\n**Purpose**: Create a **daily study plan** for assignments with time estimates.\n\n---\n\n### ✅ Requirements\n- Break into **daily tasks**\n- Include **time estimates**\n- Set **milestone checkpoints**\n- Prioritize **difficult sections**\n\n---\n\n### 🖍️ Formatting Instructions\n- Use **tables** for schedule\n- Highlight **milestones**\n- Add **!important** tags for critical tasks\n\n---\n\n### 🧾 Example Output\n**Day 1 (3 hours)**  \n- [ ] Research topic (1h)  \n- [ ] Outline main sections (1h)  \n- [ ] !important Draft introduction (1h)",
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
    aiPrompt: "## 🧠 AI Prompt: Study Schedule Planner\n**Purpose**: Create **optimized study timetable** based on subjects and availability.\n\n---\n\n### ✅ Requirements\n- Balance **difficult/easy** subjects\n- Include **break times**\n- Alternate **study modes** (reading, practice, review)\n- Highlight **priority subjects**\n\n---\n\n### 🖍️ Formatting Instructions\n- Use **time blocks** (9:00-10:30)\n- Color-code **subject types**\n- Add **⏰** for focus periods\n\n---\n\n### 🧾 Example Output\n**Monday**  \n⏰ 9:00-10:30 | Math (Practice problems)  \n10:45-11:30 | History (Reading)  \n...",
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
    aiPrompt: "## 🧠 AI Prompt: Quiz Generator\n**Purpose**: Generate a **quiz** from the **provided content or topic** with multiple types of questions and a rich text format.\n\n---\n\n### ✅ Quiz Requirements\n- Number of questions: **5 to 15**\n- Types: \n  - Multiple Choice Questions (MCQs)\n  - True/False\n  - Open-Ended\n- Each question must include:\n  - **Question Number**\n  - **Question Text**\n  - **Answer Options** (if applicable)\n  - **Correct Answer** (bolded)\n  - **Explanation** (in italics or quotes)\n\n---\n\n### 🖍️ Formatting Instructions (Rich Text Editor Style)\n- Use **bold headings** for sections\n- Use **numbered questions** (e.g., Q1, Q2, etc.)\n- Use **bullet points (A–D)** for MCQ options\n- Highlight **correct answers** clearly\n- Add brief **explanations** for each answer\n\n---\n\n### 🧾 Example Output\n**🔹 Topic**: *Photosynthesis*\n\n**Q1. What is the main pigment involved in photosynthesis?**  \n- A. Hemoglobin  \n- B. Melanin  \n- C. Carotene  \n- D. **Chlorophyll**  \n*Explanation*: *Chlorophyll is responsible for absorbing light energy for photosynthesis.*\n\n**Q2. True or False: Photosynthesis occurs in the mitochondria.**  \n✅ **Correct Answer**: False  \n*Explanation*: *Photosynthesis happens in chloroplasts, not mitochondria.*",
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
    aiPrompt: `
## 🧠 AI Prompt: Essay Outline Builder
**Purpose**: Generate a **detailed essay outline** based on the **provided topic or research question**, structured to guide academic writing with clarity and depth.

---

### ✅ Outline Requirements
- Components:
  - Thesis statement summarizing the essay’s argument
  - 3–5 main sections with topic sentences
  - Supporting evidence (e.g., quotes, data, examples)
  - Counter-arguments (if applicable)
- Each section must include:
  - **Section Heading**
  - **Topic Sentence**
  - **Evidence** (with source if provided)
  - **Explanation** (in italics, linking evidence to argument)
- Characteristics:
  - Hierarchical structure (I, A, 1)
  - Aligned with academic discipline
  - Citation style integration (if specified)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for thesis and sections
- Use **Roman numerals (I, II, III)** for main sections
- Use **letters (A, B)** and **numbers (1, 2)** for subpoints
- Include **bullet points** for evidence
- Add *explanations* in italics
- Format counter-arguments in a separate section (if included)

---

### 🧾 Example Output
**🔹 Topic**: *Impact of Social Media on Mental Health*  
**🔹 Discipline**: *Psychology*  
**🔹 Citation Style**: *APA*

**Thesis Statement**  
Social media has a dual impact on mental health, offering connectivity while contributing to anxiety and depression (Smith, 2023).  

**I. Connectivity and Support Networks**  
  A. **Topic Sentence**: Social media fosters community and emotional support.  
    1. Evidence: Online groups reduce isolation (Jones, 2024).  
    2. Evidence: 70% of users report feeling connected (APA, 2022).  
    *Explanation*: *Support networks mitigate loneliness, improving mental health.*  

**II. Negative Mental Health Effects**  
  A. **Topic Sentence**: Excessive social media use increases anxiety.  
    1. Evidence: 3+ hours/day linked to stress (Lee, 2023).  
    2. Evidence: Comparison triggers self-esteem issues (Brown, 2024).  
    *Explanation*: *Constant exposure to curated lives harms self-perception.*  

**III. Counter-Arguments**  
  A. **Topic Sentence**: Some argue social media enhances self-expression.  
    1. Evidence: Creative platforms boost confidence (Taylor, 2023).  
    *Explanation*: *Positive outlets exist but are outweighed by negative effects.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Study Note Generator
**Purpose**: Transform **provided course material** into **organized study notes**, designed to enhance retention and understanding.

---

### ✅ Study Note Requirements
- Components:
  - Summary of key concepts (100–200 words)
  - 3–5 sections with clear headings
  - Bullet points for key facts
  - Mnemonics or visual aids (if applicable)
  - 5–10 practice questions (mixed types: MCQ, True/False, Open-Ended)
- Each section must include:
  - **Heading**
  - **Key Points** (bullet points)
  - **Practice Question** with **Correct Answer** (bolded)
  - **Explanation** (in italics)
- Characteristics:
  - Tailored to academic level
  - Matches requested format (Condensed, Detailed, Visual)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections and summary
- Use **bullet points** for key points
- Use **numbered questions** (e.g., Q1, Q2) for practice
- Highlight **correct answers** in bold
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Subject**: *World History*  
**🔹 Material**: *Industrial Revolution*  
**🔹 Academic Level**: *High School*

**Summary**  
The Industrial Revolution (1760–1840) transformed economies through mechanization, urbanization, and innovations like the steam engine. It shifted societies from agrarian to industrial, impacting labor and living conditions.  
*Explanation*: *Provides a concise overview for quick understanding.*  

**1. Technological Advancements**  
- Steam engine powered factories and railways.  
- Spinning jenny revolutionized textile production.  
*Q1. What powered early factories?*  
- **Correct Answer**: Steam engine  
*Explanation*: *Steam engines were critical for industrial growth.*  

**2. Social Impacts**  
- Urbanization led to crowded cities.  
- Child labor was prevalent in factories.  
*Q2. True/False: Urbanization decreased.*  
- **Correct Answer**: False  
*Explanation*: *Migration to cities increased during this period.*  

**3. Economic Changes**  
- Factory system boosted mass production.  
- Global trade expanded significantly.  
*Q3. What system drove production?*  
- **Correct Answer**: Factory system  
*Explanation*: *Factories enabled efficient, large-scale manufacturing.*  
`,
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
    "desc": "Create customized quizzes with multiple-choice, true/false, or open-ended questions, complete with answers and explanations, in a structured and formatted layout.",
    "category": "Education",
    "icon": "https://cdn-icons-png.flaticon.com/128/2921/2921222.png",
    "slug": "quiz-generator",
    "aiPrompt": "## 🧠 AI Prompt: Quiz Generator\n**Purpose**: Generate a **quiz** from the **provided content or topic** with multiple types of questions and a rich text format.\n\n---\n\n### ✅ Quiz Requirements\n- Number of questions: **5 to 15**\n- Types: \n  - Multiple Choice Questions (MCQs)\n  - True/False\n  - Open-Ended\n- Each question must include:\n  - **Question Number**\n  - **Question Text**\n  - **Answer Options** (if applicable)\n  - **Correct Answer** (bolded)\n  - **Explanation** (in italics or quotes)\n\n---\n\n### 🖍️ Formatting Instructions (Rich Text Editor Style)\n- Use **bold headings** for sections\n- Use **numbered questions** (e.g., Q1, Q2, etc.)\n- Use **bullet points (A–D)** for MCQ options\n- Highlight **correct answers** clearly\n- Add brief **explanations** for each answer\n\n---\n\n### 🧾 Example Output\n**🔹 Topic**: *Photosynthesis*\n\n**Q1. What is the main pigment involved in photosynthesis?**  \n- A. Hemoglobin  \n- B. Melanin  \n- C. Carotene  \n- D. **Chlorophyll**  \n*Explanation*: *Chlorophyll is responsible for absorbing light energy for photosynthesis.*\n\n**Q2. True or False: Photosynthesis occurs in the mitochondria.**  \n✅ **Correct Answer**: False  \n*Explanation*: *Photosynthesis happens in chloroplasts, not mitochondria.*",
    "form": [
      {
        "label": "Source material or quiz topic",
        "field": "textarea",
        "name": "sourceMaterial",
        "required": true
      },
      {
        "label": "Question type",
        "field": "select",
        "name": "questionType",
        "options": ["Multiple-choice", "True/False", "Open-ended", "Mixed"],
        "required": true
      },
      {
        "label": "Number of questions (5–15)",
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
        "label": "Include explanations?",
        "field": "checkbox",
        "name": "includeExplanations",
        "required": false
      },
      {
        "label": "Formatting style (Rich text, Plain text, Markdown)",
        "field": "select",
        "name": "formatStyle",
        "options": ["Rich text", "Plain text", "Markdown"],
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
    aiPrompt: "## 🧠 AI Prompt: YouTube Description Generator\n**Purpose**: Create **optimized video descriptions** with key elements.\n\n---\n\n### ✅ Requirements\n- First **2 lines** as hook\n- Include **3-5 key points**\n- Add **relevant emojis** (max 3)\n- **SEO keywords** in first 100 chars\n- **CTA** at end\n\n---\n\n### 🖍️ Formatting Instructions\n- Separate sections with **---**\n- Bold **important phrases**\n- Use > for CTA\n\n---\n\n### 🧾 Example Output\n**Learn Python FAST** 🚀💻  \nIn this tutorial, you'll discover...  \n---  \n- Key point 1  \n- Key point 2  \n> **Subscribe** for more coding tips!",
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
 // YouTube Tools
 {
  name: "YouTube Tag Generator",
  desc: "Create relevant tags to boost YouTube video discoverability",
  category: "YouTube",
  icon: "https://cdn-icons-png.flaticon.com/128/4674/4674918.png",
  slug: "youtube-tag-generator",
  aiPrompt: `
## 🧠 AI Prompt: YouTube Tag Generator
**Purpose**: Generate **relevant YouTube tags** based on the **provided video title and optional outline**, optimized for discoverability and engagement.

---

### ✅ Tag Requirements
- Number of tags: **10**
- Characteristics:
- Mix of broad and niche tags
- Aligned with video content
- Optimized for YouTube’s search algorithm
- Each tag must include:
- **Tag Text**
- **Explanation** (in italics, why it’s effective)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for each tag
- Include *explanations* in italics
- Ensure tags are concise (1–3 words)

---

### 🧾 Example Output
**🔹 Title**: *How to Bake Sourdough Bread*  
**🔹 Outline**: *Step-by-step guide, beginner-friendly*

- **sourdough bread**  
*Explanation*: *Broad term captures baking enthusiasts.*  
- **baking tutorial**  
*Explanation*: *Targets users seeking instructional videos.*  
- **homemade bread**  
*Explanation*: *Appeals to DIY home bakers.*  
- **sourdough recipe**  
*Explanation*: *Specific for recipe searches.*  
- **beginner baking**  
*Explanation*: *Attracts novice bakers.*  
- **bread baking**  
*Explanation*: *General term for baking content.*  
- **sourdough starter**  
*Explanation*: *Niche term for key process.*  
- **artisan bread**  
*Explanation*: *Targets gourmet baking fans.*  
- **baking tips**  
*Explanation*: *Attracts users looking for advice.*  
- **home baking**  
*Explanation*: *Broad term for home-based searches.*  
`,
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
  aiPrompt: `
## 🧠 AI Prompt: YouTube Shorts Script Generator
**Purpose**: Generate an **engaging 30–60 second YouTube Shorts script** based on the **provided topic and audience**, designed for high retention.

---

### ✅ Script Requirements
- Length: **30–60 seconds** (100–200 words)
- Components:
- Hook (5–10 seconds)
- Main content (20–40 seconds)
- Call-to-action (5–10 seconds)
- Characteristics:
- Attention-grabbing and concise
- Tailored to target audience
- Includes visual cues (stage directions)
- Each section must include:
- **Section Title**
- **Script Text**
- **Stage Directions** (in brackets)
- **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Hook, Main Content, CTA)
- Use **bullet points** for script lines
- Include **[stage directions]** in brackets
- Add *explanations* in italics

---

### 🧾 Example Output
**🔹 Topic**: *Quick Fitness Tips*  
**🔹 Audience**: *Beginners*

**Hook**  
- "Want to get fit in just 5 minutes?" [Show energetic jump cuts]  
*Explanation*: *Bold promise grabs attention instantly.*  

**Main Content**  
- "Try these 3 moves: squats, push-ups, planks!" [Demonstrate each move]  
- "Do each for 1 minute, repeat twice." [Show timer graphic]  
*Explanation*: *Clear, actionable tips keep viewers engaged.*  

**CTA**  
- "Like and follow for more fitness hacks!" [Point to subscribe button]  
*Explanation*: *Encourages interaction and channel growth.*  
`,
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
  aiPrompt: `
## 🧠 AI Prompt: Article Rewriter
**Purpose**: Rewrite the **provided article** to ensure **originality** while preserving its **meaning and tone**, suitable for publication.

---

### ✅ Rewrite Requirements
- Length: Match original length (±10%)
- Components:
- Paraphrased text
- Retained factual accuracy
- Consistent tone (e.g., formal, casual)
- Output must include:
- **Rewritten Article**
- **Comparison Note** (in italics, highlighting key changes)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Rewritten Article, Comparison Note)
- Use **paragraphs** for rewritten text
- Include *comparison notes* in italics
- Preserve original structure (e.g., headings, lists)

---

### 🧾 Example Output
**🔹 Original Article**: *Coffee boosts focus. It contains caffeine, which stimulates the brain.*  

**Rewritten Article**  
Coffee enhances concentration. Its caffeine content activates neural pathways, improving alertness.  

**Comparison Note**  
*Explanation*: *Rephrased sentences for originality while maintaining the informative tone and key facts.*  
`,
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
    "aiPrompt":"## 🧠 AI Prompt: LinkedIn Post Generator\n**Purpose**: Generate **3 professional LinkedIn posts** with engagement elements.\n\n---\n\n### ✅ Requirements\n- Start with **hook question/statistic**\n- Include **2-3 key insights**\n- Add **industry-relevant hashtags** (max 5)\n- End with **CTA/question**\n\n---\n\n### 🖍️ Formatting Instructions\n- Number each **post variant**\n- Bold **key data points**\n- Separate sections with ---\n\n---\n\n### 🧾 Example Output\n**1. Did you know 72% of...**  \n[Insightful content...]  \n---  \n**Key takeaway**: [Value]  \n#Leadership #Management  \nWhat's your experience with this?",
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
 // Social Media Tools
 {
  name: "LinkedIn Profile Optimizer",
  desc: "Optimize LinkedIn profile summaries and headlines for visibility and impact",
  category: "Social Media",
  icon: "https://cdn-icons-png.flaticon.com/128/732/732107.png",
  slug: "linkedin-profile-optimizer",
  aiPrompt: `
## 🧠 AI Prompt: LinkedIn Profile Optimizer
**Purpose**: Generate an **optimized LinkedIn profile summary and headline** based on the **provided details**, enhancing professional branding and visibility.

---

### ✅ Optimization Requirements
- Components:
- **Headline**: Up to 220 characters, keyword-rich
- **Summary**: 150–300 words, compelling narrative
- **Enhancement Tips**: 3–5 actionable suggestions (e.g., skills, endorsements)
- Characteristics:
- Incorporates key skills and industry keywords
- Aligns with career goals and tone
- Targets specified audience (e.g., recruiters, clients)
- Each component must include:
- **Content**
- **Explanation** (in italics, why it’s effective)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Headline, Summary, Tips)
- Use **paragraphs** for summary
- Use **bullet points** for tips
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Job Title**: *Marketing Manager*  
**🔹 Industry**: *Digital Marketing*  
**🔹 Skills**: *SEO, content strategy, analytics*

**Headline**  
Marketing Manager | SEO & Content Strategy Expert | Driving Brand Growth  
*Explanation*: *Keywords like SEO and concise value statement boost searchability.*  

**Summary**  
As a passionate Marketing Manager, I specialize in crafting data-driven campaigns that elevate brands. With expertise in **SEO**, **content strategy**, and **analytics**, I’ve boosted engagement by 40% for clients across industries. My approach blends creativity with precision, turning insights into impact. I thrive on collaboration and am dedicated to empowering teams to achieve bold goals. Let’s connect to create something extraordinary!  
*Explanation*: *Engaging narrative with keywords appeals to recruiters and clients.*  

**Enhancement Tips**  
- Add 10+ skills (e.g., Google Analytics) for better visibility.  
- Seek endorsements from colleagues to build credibility.  
- Upload a professional headshot to increase profile views.  
*Explanation*: *Practical tips enhance overall profile strength.*  
`,
  form: [
    {
      label: "Current job title or role",
      field: "input",
      name: "jobTitle",
      required: true,
    },
    {
      label: "Industry or field",
      field: "input",
      name: "industry",
      required: true,
    },
    {
      label: "Key skills or expertise (separate with commas)",
      field: "textarea",
      name: "skills",
      required: true,
    },
    {
      label: "Career goals or personal brand statement (optional)",
      field: "textarea",
      name: "goals",
      required: false,
    },
    {
      label: "Target audience (e.g., recruiters, clients, optional)",
      field: "input",
      name: "audience",
      required: false,
    },
    {
      label: "Desired tone (e.g., professional, approachable, optional)",
      field: "input",
      name: "tone",
      required: false,
    },
  ],
},
{
  name: "Instagram Post Generator",
  desc: "Design engaging Instagram posts based on keywords and trends",
  category: "Social Media",
  icon: "https://cdn-icons-png.flaticon.com/128/15713/15713420.png",
  slug: "instagram-post-generator",
  aiPrompt: `
## 🧠 AI Prompt: Instagram Post Generator
**Purpose**: Generate **engaging Instagram posts** based on the **provided keywords**, incorporating trending elements for maximum impact.

---

### ✅ Post Requirements
- Number of posts: **3**
- Components per post:
- Caption (50–150 words)
- Hashtags (5–10)
- Call-to-action
- Characteristics:
- Aligned with current Instagram trends (e.g., storytelling, aesthetics)
- Optimized for engagement (e.g., questions, emojis)
- Reflects keyword themes
- Each post must include:
- **Post Number**
- **Caption**
- **Hashtags**
- **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each post (Post 1, Post 2, etc.)
- Use **paragraphs** for captions
- Use **bullet points** for hashtags
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Keywords**: *Fitness, Motivation, Workout*

**Post 1**  
Ready to crush your workout? 💪 Start your day with a 10-minute HIIT session to boost energy and confidence. What’s your go-to exercise? Comment below!  
- #FitnessGoals  
- #WorkoutMotivation  
- #HIITWorkout  
- #HealthyLiving  
- #FitLife  
*Explanation*: *Short, action-oriented caption with question drives engagement.*  

**Post 2**  
Some days, motivation is tough. 🥳 Push through with a playlist that pumps you up! My favorite is sprinting to upbeat tracks. What song gets you moving?  
- #FitnessJourney  
- #WorkoutVibes  
- #MotivationMonday  
- #ExerciseTips  
- #StayActive  
*Explanation*: *Relatable tone and music angle tap into trending content.*  

**Post 3**  
Small steps lead to big wins! 🚀 Try adding one new exercise this week. Tag a friend to join your fitness journey!  
- #FitnessChallenge  
- #WorkoutInspo  
- #HealthAndFitness  
- #FitCommunity  
- #StrongerEveryDay  
*Explanation*: *Encourages interaction with tagging and trend-aligned positivity.*  
`,
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
  aiPrompt: `
## 🧠 AI Prompt: Instagram Hashtag Generator
**Purpose**: Generate **targeted Instagram hashtags** based on the **provided keywords**, optimized for reach and visibility.

---

### ✅ Hashtag Requirements
- Number of hashtags: **15**
- Characteristics:
- Mix of broad, niche, and trending hashtags
- Aligned with keywords
- Optimized for Instagram’s algorithm
- Each hashtag must include:
- **Hashtag Text**
- **Explanation** (in italics, why it’s effective)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for each hashtag
- Include *explanations* in italics
- Ensure hashtags are concise and relevant

---

### 🧾 Example Output
**🔹 Keywords**: *Travel, Adventure*

- **#Travel**  
*Explanation*: *Broad term captures global travel audience.*  
- **#AdventureTime**  
*Explanation*: *Trending term for thrill-seekers.*  
- **#Wanderlust**  
*Explanation*: *Popular for travel inspiration.*  
- **#TravelGram**  
*Explanation*: *Niche tag for Instagram travel posts.*  
- **#ExploreMore**  
*Explanation*: *Encourages adventure content discovery.*  
- **#TravelPhotography**  
*Explanation*: *Targets visual travel enthusiasts.*  
- **#AdventureAwaits**  
*Explanation*: *Inspirational tag for explorers.*  
- **#GlobeTrotter**  
*Explanation*: *Appeals to frequent travelers.*  
- **#TravelVibes**  
*Explanation*: *Trendy for lifestyle content.*  
- **#OffTheGrid**  
*Explanation*: *Niche for unique adventures.*  
- **#WorldTraveler**  
*Explanation*: *Broad appeal for travel lovers.*  
- **#AdventureLife**  
*Explanation*: *Engages active travel community.*  
- **#TravelInspo**  
*Explanation*: *Drives inspiration-based searches.*  
- **#ExploreTheWorld**  
*Explanation*: *Motivational for global explorers.*  
- **#TravelAddict**  
*Explanation*: *Connects passionate travelers.*  
`,
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
  aiPrompt: `
## 🧠 AI Prompt: Instagram Content Idea Generator
**Purpose**: Generate **trending Instagram post or reel ideas** based on the **provided niche or keywords**, designed for high engagement.

---

### ✅ Idea Requirements
- Number of ideas: **5–10**
- Components per idea:
- Content type (e.g., Reel, Post, Carousel)
- Description of concept
- Suggested hashtags
- Characteristics:
- Aligned with current Instagram trends
- Relevant to niche
- Includes engagement hooks (e.g., questions, challenges)
- Each idea must include:
- **Idea Number**
- **Content Type**
- **Description**
- **Hashtags**
- **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each idea (Idea 1, Idea 2, etc.)
- Use **bullet points** for description and hashtags
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Keywords**: *Fashion, Style*

**Idea 1**  
- **Content Type**: Reel  
- **Description**: Show a 5-second outfit transition from casual to party-ready. Ask: “Which vibe is your favorite?”  
- **Hashtags**: #FashionReels, #StyleInspo, #OutfitIdeas  
*Explanation*: *Quick transitions are trending and drive viewer interaction.*  

**Idea 2**  
- **Content Type**: Carousel  
- **Description**: Share 5 ways to style a denim jacket. Include text overlays for tips.  
- **Hashtags**: #FashionTips, #DenimStyle, #WardrobeEssentials  
*Explanation*: *Carousels encourage longer engagement with actionable tips.*  

**Idea 3**  
- **Content Type**: Post  
- **Description**: Post a bold outfit photo with a caption about confidence. Ask followers to share their power look.  
- **Hashtags**: #FashionVibes, #StyleConfidence, #OOTD  
*Explanation*: *Empowering captions resonate and prompt comments.*  

**Idea 4**  
- **Content Type**: Reel  
- **Description**: Create a “Get Ready With Me” video for a chic event. Highlight accessories.  
- **Hashtags**: #GRWM, #FashionReels, #StyleDetails  
*Explanation*: *GRWM videos are highly engaging for fashion audiences.*  

**Idea 5**  
- **Content Type**: Post  
- **Description**: Showcase a sustainable fashion brand. Share why eco-fashion matters.  
- **Hashtags**: #SustainableFashion, #EcoStyle, #FashionForGood  
*Explanation*: *Taps into growing trend of ethical fashion.*  
`,
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
  aiPrompt: `
## 🧠 AI Prompt: Viral Tweet Thread Creator
**Purpose**: Generate an **engaging Twitter/X thread** based on the **provided topic**, designed to maximize interaction and follower growth.

---

### ✅ Thread Requirements
- Components:
- Hook tweet (1)
- Content tweets (5–8)
- Call-to-action tweet (1)
- Characteristics:
- Each tweet within 280 characters
- Includes hashtags (2–3 per tweet)
- Incorporates key points and perspective
- Engaging tone (e.g., storytelling, tips)
- Each tweet must include:
- **Tweet Number**
- **Tweet Text**
- **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each tweet (Tweet 1, Tweet 2, etc.)
- Use **paragraphs** for tweet text
- Include *explanations* in italics
- Ensure **character count** compliance

---

### 🧾 Example Output
**🔹 Topic**: *Productivity Hacks*  
**🔹 Audience**: *Professionals*

**Tweet 1**  
Struggling to stay productive? 🚀 Here are 5 hacks to skyrocket your efficiency! #Productivity #CareerTips  
*Explanation*: *Bold hook grabs attention and sets thread focus.*  

**Tweet 2**  
1/ Use the 2-minute rule: If it takes <2 min, do it now. No delays! #ProductivityHacks #TimeManagement  
*Explanation*: *Actionable tip encourages immediate application.*  

**Tweet 3**  
2/ Try Pomodoro: Work 25 min, break 5. Keeps you sharp! 🕒 #WorkSmart #Productivity  
*Explanation*: *Popular method resonates with busy professionals.*  

**Tweet 4**  
3/ Declutter your desk. A clear space = a clear mind. 🧹 #Minimalism #ProductivityTips  
*Explanation*: *Simple advice with broad appeal.*  

**Tweet 5**  
4/ Write your top 3 tasks daily. Focus on what matters most. 📝 #Prioritize #CareerGrowth  
*Explanation*: *Daily habit builds long-term productivity.*  

**Tweet 6**  
5/ Block distractions. Turn off notifications for 1 hr. Game-changer! 🚫 #Focus #ProductivityHacks  
*Explanation*: *Addresses common pain point for workers.*  

**Tweet 7**  
Which hack will you try? Share below and follow for more tips! 🙌 #Productivity #Motivation  
*Explanation*: *CTA encourages engagement and follower growth.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Code Generator
**Purpose**: Generate **functional programming code** based on the **provided description and language**, adhering to best practices.

---

### ✅ Code Requirements
- Components:
  - Functional code in the specified language
  - Inline comments explaining logic
  - Error handling where applicable
  - Input/output expectations
- Characteristics:
  - Follows language-specific best practices
  - Modular and readable
- Output must include:
  - **Code Block**
  - **Usage Example** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **code blocks** (\`\`\`) for code
- Include **comments** within code (e.g., //, #)
- Add *usage examples* in italics
- Bold **important notes** (e.g., limitations)

---

### 🧾 Example Output
**🔹 Description**: *Python function to calculate factorial*

**Code Block**  
\`\`\`python
def factorial(n):
    # Handle invalid input
    if not isinstance(n, int) or n < 0:
        raise ValueError("Input must be a non-negative integer")
    # Base case
    if n == 0 or n == 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

# Example usage
try:
    print(factorial(5))  # Output: 120
except ValueError as e:
    print(e)
\`\`\`  
*Usage Example*: *Call factorial(5) to compute 5! = 120.*  
**Note**: *Handles negative inputs with error checking.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Code Explainer
**Purpose**: Provide a **line-by-line explanation** of the **provided code**, detailing its functionality and purpose.

---

### ✅ Explanation Requirements
- Components:
  - Line-by-line breakdown
  - Summary of overall functionality
  - Key concepts or techniques used
- Each explanation must include:
  - **Line Number**
  - **Code Line**
  - **Explanation** (in italics)
- Output must include:
  - **Code Block**
  - **Line Explanations**
  - **Summary**

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Code, Explanations, Summary)
- Use **code blocks** for code
- Use **bullet points** for line explanations
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Code**: *Python list comprehension*

**Code Block**  
\`\`\`python
numbers = [1, 2, 3, 4]
squares = [x**2 for x in numbers]
print(squares)  # Output: [1, 4, 9, 16]
\`\`\`  

**Line Explanations**  
- **Line 1**: \`numbers = [1, 2, 3, 4]\`  
  *Explanation*: *Defines a list of integers to be processed.*  
- **Line 2**: \`squares = [x**2 for x in numbers]\`  
  *Explanation*: *Uses list comprehension to create a new list with squared values.*  
- **Line 3**: \`print(squares)\`  
  *Explanation*: *Outputs the list of squared numbers.*  

**Summary**  
*This code efficiently squares a list of numbers using list comprehension, a concise Python feature.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Code Bug Detector
**Purpose**: Analyze the **provided code** for **bugs**, explain issues, and provide a **fixed version** with comments.

---

### ✅ Bug Detection Requirements
- Components:
  - Identification of bugs (syntax, logic, runtime)
  - Explanation of each bug
  - Fixed code with comments
- Output must include:
  - **Bug Description**
  - **Original Code** (with line numbers)
  - **Fixed Code**
  - **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Bugs, Original Code, Fixed Code)
- Use **code blocks** for code
- Use **bullet points** for bug descriptions
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Code**: *Python sum function with bug*

**Bugs**  
- **Line 2**: Incorrect accumulator initialization (total = 1) leads to wrong sum.  

**Original Code**  
\`\`\`python
def sum_list(numbers):
    total = 1  # Bug: Should be 0
    for num in numbers:
        total += num
    return total
\`\`\`  

**Fixed Code**  
\`\`\`python
def sum_list(numbers):
    total = 0  # Initialize to 0 for correct sum
    for num in numbers:
        total += num
    return total
\`\`\`  
*Explanation*: *Changed initializer to 0 to ensure accurate summation.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Tagline Generator
**Purpose**: Generate **catchy taglines** for the **provided product or brand**, based on its description, to enhance brand identity.

---

### ✅ Tagline Requirements
- Number of taglines: **5–10**
- Characteristics:
  - Short (5–10 words)
  - Memorable and unique
  - Aligned with brand values
- Each tagline must include:
  - **Tagline Text**
  - **Explanation** (in italics, why it works)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for each tagline
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Product**: *Eco-Friendly Water Bottle*  
**🔹 Description**: *Sustainable, reusable, BPA-free*

- **"Hydrate the Planet, One Sip at a Time"**  
  *Explanation*: *Emphasizes eco-consciousness and action.*  
- **"Green Today, Thriving Tomorrow"**  
  *Explanation*: *Connects sustainability to future impact.*  
- **"Sustainable Sips for a Better World"**  
  *Explanation*: *Simple and mission-driven.*  
- **"Drink Smart, Save the Earth"**  
  *Explanation*: *Action-oriented and empowering.*  
- **"Eco-Hydration, Made Simple"**  
  *Explanation*: *Highlights ease and eco-friendliness.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Product Description Generator
**Purpose**: Generate an **SEO-friendly product description** for the **provided product**, optimized for e-commerce sales.

---

### ✅ Description Requirements
- Length: **100–200 words**
- Components:
  - Attention-grabbing opening
  - Key features and benefits
  - Call-to-action (e.g., buy now)
  - SEO keywords (integrated naturally)
- Output must include:
  - **Description Text**
  - **Explanation** (in italics, why it sells)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for features
- Include **paragraphs** for narrative
- Add *explanations* in italics

---

### 🧾 Example Output
**🔹 Product**: *Wireless Earbuds*  
**🔹 Details**: *Long battery life, sweat-resistant*

**Description**  
Experience music like never before with our **Wireless Earbuds**! Designed for comfort and sound clarity, these earbuds deliver:  
- **Crystal-Clear Audio**: Immersive sound for music and calls.  
- **Long Battery Life**: Up to 20 hours of playback.  
- **Sweat-Resistant**: Perfect for workouts.  
Whether you’re commuting or exercising, stay connected in style. Buy now and elevate your audio game!  

*Explanation*: *Uses keywords like “wireless earbuds” and highlights benefits for SEO and sales.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: SEO Content Optimizer
**Purpose**: Optimize the **provided content** for **SEO**, integrating keywords, improving readability, and suggesting meta descriptions.

---

### ✅ Optimization Requirements
- Components:
  - Revised content with keyword integration
  - Readability improvements (short sentences, clear structure)
  - Meta description (50–160 characters)
  - SEO analysis report
- Output must include:
  - **Optimized Content**
  - **Meta Description**
  - **SEO Report** (bullet points)
  - **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **paragraphs** for content
- Use **bullet points** for SEO report
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Content**: *Learn about yoga benefits.*  
**🔹 Keywords**: *yoga, wellness*

**Optimized Content**  
Discover the power of **yoga**! This practice boosts **wellness**, improves flexibility, and reduces stress. Start your **yoga** journey today!  

**Meta Description**  
Explore yoga’s wellness benefits: flexibility, stress relief, and more. Start now!  

**SEO Report**  
- **Keyword Density**: Yoga and wellness used naturally.  
- **Readability**: Short sentences for clarity.  
- **Length**: Concise for quick engagement.  
*Explanation*: *Keywords integrated seamlessly; meta description is concise and clickable.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Language Drill Generator
**Purpose**: Generate **language exercises** based on the **provided text or word list**, with progressive difficulty for vocabulary and grammar.

---

### ✅ Exercise Requirements
- Number of exercises: **5–10**
- Types:
  - Vocabulary matching
  - Fill-in-the-blank
  - Sentence restructuring
  - Translation
  - Contextual usage
- Each exercise must include:
  - **Exercise Number**
  - **Question/Task**
  - **Correct Answer** (bolded)
  - **Explanation** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **numbered exercises** (e.g., E1, E2)
- Use **bullet points** for options (if applicable)
- Highlight **correct answers** in bold
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Material**: *Spanish vocabulary: casa, sol, árbol*  
**🔹 Target Language**: *Spanish*

**E1. Match the word to its meaning.**  
- Casa:  
  - A. Sun  
  - B. **House**  
  - C. Tree  
*Explanation*: *Tests recognition of basic vocabulary.*  

**E2. Fill in the blank: El ___ brilla.**  
- **Correct Answer**: Sol  
*Explanation*: *Reinforces contextual use of “sol” (sun).*  

**E3. Translate: The tree is tall.**  
- **Correct Answer**: El árbol es alto.  
*Explanation*: *Practices translation and adjective agreement.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Case Study Generator
**Purpose**: Generate a **detailed case study** for the **specified field and topic**, including a realistic scenario, analysis, and solutions.

---

### ✅ Case Study Requirements
- Components:
  - Realistic scenario with context
  - Key facts and data
  - Analysis framework (e.g., SWOT, PESTLE)
  - 3–5 discussion questions
  - Solutions and teaching notes
- Structure:
  - Introduction
  - Background
  - Analysis
  - Solutions
  - Discussion Questions
- Each section must include:
  - **Heading**
  - **Content**
  - **Explanation** (in italics, why it’s relevant)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for facts, solutions, and questions
- Include *explanations* in italics
- Use **tables** for data (if applicable)

---

### 🧾 Example Output
**🔹 Field**: *Business*  
**🔹 Topic**: *Market Entry Strategy*

**Introduction**  
A tech startup aims to enter the Asian market.  
*Explanation*: *Sets the stage for strategic analysis.*  

**Background**  
- Company: TechTrend, AI software provider.  
- Target: Southeast Asia, high-growth region.  
*Explanation*: *Provides context for decision-making.*  

**Analysis (SWOT)**  
- **Strengths**: Innovative AI, strong R&D.  
- **Weaknesses**: Limited local knowledge.  
*Explanation*: *SWOT clarifies strategic position.*  

**Solutions**  
- Partner with local firms for distribution.  
- Invest in cultural training for staff.  
*Explanation*: *Practical solutions address weaknesses.*  

**Discussion Questions**  
- What risks does TechTrend face?  
- How should TechTrend select partners?  
*Explanation*: *Prompts critical thinking for learning.*  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Research Paper Analyzer
**Purpose**: Analyze the **provided research paper** to generate a **plain-language summary**, highlighting methodology, findings, and significance.

---

### ✅ Analysis Requirements
- Components:
  - Summary (150–300 words)
  - Methodology overview
  - Key findings (3–5 points)
  - Significance and limitations
  - Related works (if applicable)
- Each section must include:
  - **Heading**
  - **Content**
  - **Explanation** (in italics, why it matters)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections
- Use **bullet points** for findings and limitations
- Use **paragraphs** for summary
- Include *explanations* in italics

---

### 🧾 Example Output
**🔹 Paper**: *AI in Healthcare Study*

**Summary**  
This paper explores AI’s role in diagnostics. Using machine learning, it achieves 95% accuracy in detecting diseases, offering faster diagnoses.  
*Explanation*: *Condenses complex research for accessibility.*  

**Methodology**  
- Data: 10,000 patient records.  
- Model: Deep learning algorithm.  
*Explanation*: *Clarifies how results were achieved.*  

**Findings**  
- 95% accuracy in early detection.  
- Reduced diagnosis time by 30%.  
*Explanation*: *Highlights impactful results.*  

**Significance**  
- Improves patient outcomes.  
- **Limitation**: Requires large datasets.  
*Explanation*: *Shows real-world value and constraints.*  
`,
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
    name: "AI Image Prompt Generator",
    desc: "Create prompts for AI image generation tools like Midjourney",
    category: "AI Tools",
    icon: "https://cdn-icons-png.flaticon.com/128/3655/3655579.png",
    slug: "ai-image-prompt-generator",
    aiPrompt: `
## 🧠 AI Prompt: AI Image Prompt Generator
**Purpose**: Generate **detailed prompts** for the **specified AI image generation tool**, tailored to the subject, style, and details.

---

### ✅ Prompt Requirements
- Number of prompts: **3**
- Components:
  - Description of subject, style, lighting, and composition
  - Tool-specific formatting (e.g., Midjourney flags)
  - Example image description
- Each prompt must include:
  - **Prompt Text**
  - **Explanation** (in italics, why it’s effective)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each prompt (Prompt 1, Prompt 2, etc.)
- Use **paragraphs** for prompt text
- Include *explanations* in italics
- Add **formatting tips** in a separate section

---

### 🧾 Example Output
**🔹 Tool**: *Midjourney*  
**🔹 Subject**: *Futuristic City*

**Prompt 1**  
A sprawling futuristic city at dusk, neon lights, towering skyscrapers, flying cars, cyberpunk aesthetic, vibrant colors, cinematic lighting, highly detailed, --ar 16:9  
*Explanation*: *Specific details ensure a vivid, tool-optimized image.*  

**Prompt 2**  
Futuristic metropolis under a starry sky, holographic billboards, sleek architecture, moody blue tones, photorealistic, soft fog, --v 5  
*Explanation*: *Moody tones create a unique atmosphere.*  

**Prompt 3**  
Cyberpunk cityscape at sunrise, reflective glass buildings, bustling streets, warm orange hues, ultra-realistic, --q 2  
*Explanation*: *Contrasting lighting adds dynamic appeal.*  

**Formatting Tips**  
- Use commas to separate descriptors.  
- Include aspect ratio (--ar) for composition control.  
`,
    form: [
      {
        label: "AI image tool (e.g., Midjourney, Stable Diffusion)",
        field: "input",
        name: "aiTool",
        required: true,
      },
      {
        label: "Desired image subject or theme",
        field: "input",
        name: "subject",
        required: true,
      },
      {
        label: "Art style or aesthetic (e.g., realistic, cartoon, optional)",
        field: "input",
        name: "style",
        required: false,
      },
      {
        label: "Additional details (e.g., colors, mood, optional)",
        field: "textarea",
        name: "details",
        required: false,
      },
    ],
  },
  {
    name: "AI Prompt Engineer",
    desc: "Design optimized prompts for AI tools like ChatGPT or DALL-E",
    category: "AI Tools",
    icon: "https://cdn-icons-png.flaticon.com/128/8002/8002173.png",
    slug: "ai-prompt-engineer",
    aiPrompt: `
## 🧠 AI Prompt: AI Prompt Engineer
**Purpose**: Generate **optimized prompts** for the **specified AI tool**, tailored to the user’s goal and context for precise outputs.

---

### ✅ Prompt Requirements
- Number of prompts: **3**
- Components:
  - Clear, specific instructions
  - Context or constraints
  - Desired output format
- Each prompt must include:
  - **Prompt Text**
  - **Explanation** (in italics, why it’s optimized)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each prompt (Prompt 1, Prompt 2, etc.)
- Use **paragraphs** for prompt text
- Include *explanations* in italics
- Add **formatting tips** in a separate section

---

### 🧾 Example Output
**🔹 Tool**: *ChatGPT*  
**🔹 Goal**: *Write a product description*

**Prompt 1**  
Write a 150-word product description for a smartwatch, emphasizing battery life and fitness tracking. Use a persuasive tone and include a call-to-action. Format with bullet points for features.  
*Explanation*: *Specific word count and structure ensure clarity and focus.*  

**Prompt 2**  
Describe a smartwatch in 100–200 words, focusing on style and connectivity. Use a casual tone, integrate “smartwatch” twice, and end with “Buy now!”  
*Explanation*: *SEO keyword and tone align with marketing goals.*  

**Prompt 3**  
Create a concise smartwatch description (150 words) for fitness enthusiasts. Highlight heart rate monitoring and durability. Use an energetic tone and bullet points.  
*Explanation*: *Audience targeting improves relevance and engagement.*  

**Formatting Tips**  
- Specify tone and length for precision.  
- Use action verbs to guide the AI.  
`,
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
    aiPrompt: `
## 🧠 AI Prompt: Podcast Episode Planner
**Purpose**: Generate a **podcast episode plan** based on the **provided topic and genre**, including a structured outline and guest questions.

---

### ✅ Plan Requirements
- Components:
  - Intro hook (30–60 seconds)
  - 3–5 talking points with sub-points
  - 8–10 guest questions
  - Outro with call-to-action
- Each section must include:
  - **Heading**
  - **Content**
  - **Explanation** (in italics, why it engages)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Intro, Talking Points, Questions, Outro)
- Use **bullet points** for talking points and questions
- Include *explanations* in italics
- Use **timestamps** (e.g., 0:00–1:00) for structure

---

### 🧾 Example Output
**🔹 Topic**: *Entrepreneurship*  
**🔹 Genre**: *Business*

**Intro (0:00–1:00)**  
- Welcome listeners and tease guest’s success story.  
*Explanation*: *Hook sets tone and builds anticipation.*  

**Talking Points (1:00–15:00)**  
- **Starting a Business**:  
  - Importance of market research.  
  - Common pitfalls to avoid.  
*Explanation*: *Actionable insights keep listeners engaged.*  
- **Scaling Up**:  
  - Strategies for growth.  
  - Managing cash flow.  
*Explanation*: *Relevant for aspiring entrepreneurs.*  

**Guest Questions (15:00–25:00)**  
- What inspired your first venture?  
- How do you handle failure?  
*Explanation*: *Personal questions create relatability.*  

**Outro (25:00–26:00)**  
- Recap key takeaways and invite reviews.  
*Explanation*: *CTA encourages listener interaction.*  
`,
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
    name: "Meeting Agenda Creator",
    desc: "Design structured meeting agendas with objectives and time allocations",
    category: "Professional",
    icon: "https://cdn-icons-png.flaticon.com/128/2099/2099085.png",
    slug: "meeting-agenda-creator",
    aiPrompt: `
## 🧠 AI Prompt: Meeting Agenda Creator
**Purpose**: Generate a **structured meeting agenda** based on the **provided purpose and topics**, with clear objectives and time allocations.

---

### ✅ Agenda Requirements
- Components:
  - Clear meeting objective
  - 3–6 discussion topics with objectives
  - Time allocations per topic
  - Action items template (if requested)
  - Facilitator notes
- Each topic must include:
  - **Topic Title**
  - **Time Slot** (e.g., 10:00–10:15)
  - **Objective** (in bold)
  - **Notes** (in italics)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for sections (Objective, Agenda, Action Items)
- Use **bullet points** or **tables** for topics
- Include **time ranges** for each topic
- Add *notes* in italics for facilitator guidance

---

### 🧾 Example Output
**🔹 Purpose**: *Plan Q2 marketing campaign*  
**🔹 Duration**: *1 hour*

**Objective**  
Align team on Q2 marketing campaign goals and deliverables.  

**Agenda**  
- **10:00–10:10 – Campaign Goals**  
  **Objective**: Define key performance indicators.  
  *Notes*: *Ensure goals are measurable.*  
- **10:10–10:30 – Content Strategy**  
  **Objective**: Assign content creation tasks.  
  *Notes*: *Discuss social media priorities.*  
- **10:30–10:50 – Budget Review**  
  **Objective**: Finalize campaign budget.  
  *Notes*: *Address overspending concerns.*  

**Action Items (Optional)**  
- Assign content tasks by [date].  
- Submit budget report by [date].  
*Explanation*: *Clear structure ensures efficient discussion and follow-up.*  
`,
    form: [
      {
        label: "Meeting purpose or objective",
        field: "input",
        name: "purpose",
        required: true,
      },
      {
        label: "Key topics or discussion points",
        field: "textarea",
        name: "topics",
        required: true,
      },
      {
        label: "Meeting duration (e.g., 30 minutes, 1 hour)",
        field: "input",
        name: "duration",
        required: true,
      },
      {
        label: "Target audience or participants (optional)",
        field: "input",
        name: "participants",
        required: false,
      },
      {
        label: "Include action item template? (optional)",
        field: "checkbox",
        name: "includeActionItems",
        required: false,
      },
    ],
  },
  {
    name: "Multi-Platform Content Repurposer",
    desc: "Adapt content for platforms like Twitter, LinkedIn, or YouTube",
    category: "Content",
    icon: "https://cdn-icons-png.flaticon.com/128/6664/6664504.png",
    slug: "content-repurposer",
    aiPrompt: `
## 🧠 AI Prompt: Multi-Platform Content Repurposer
**Purpose**: Repurpose the **provided content** for **selected platforms**, optimizing for each platform’s format, length, and engagement patterns.

---

### ✅ Repurposing Requirements
- Platforms: As specified (e.g., Twitter, LinkedIn, YouTube)
- Components per platform:
  - Adapted content (e.g., tweet thread, LinkedIn post, YouTube description)
  - Platform-specific formatting (e.g., hashtags, emojis)
  - Call-to-action tailored to platform
- Each platform output must include:
  - **Platform Name**
  - **Repurposed Content**
  - **Explanation** (in italics, why it fits the platform)

---

### 🖍️ Formatting Instructions (Rich Text Editor Style)
- Use **bold headings** for each platform
- Use **paragraphs** or **bullet points** for content
- Include *explanations* in italics
- Add **platform-specific notes** (e.g., character limits)

---

### 🧾 Example Output
**🔹 Original Content**: *Blog post: “5 Productivity Hacks”*  
**🔹 Platforms**: *Twitter, LinkedIn*

**Twitter**  
- 1/ 🚀 Boost productivity with these 5 hacks! #ProductivityHacks  
- 2/ Hack #1: Use the 2-minute rule. Do quick tasks now!  
- 3/ Hack #2: Try Pomodoro. Work 25 min, break 5. 🕒  
- Follow for more tips!  
*Explanation*: *Short tweets with hashtags maximize reach.*  
**Note**: *280-character limit per tweet.*  

**LinkedIn**  
Struggling to stay productive? Here are 2 of my favorite hacks:  
- **2-Minute Rule**: If it takes <2 min, do it now.  
- **Pomodoro**: Work 25 min, take a 5-min break.  
What’s your go-to productivity tip? Comment below! #Productivity #CareerGrowth  
*Explanation*: *Professional tone and CTA drive engagement.*  
**Note**: *Ideal for 100–200 words.*  
`,
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