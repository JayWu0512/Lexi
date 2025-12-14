import { Resource, UserRole, ContentType } from '../types';

export const resources: Resource[] = [
  // Student Content - Real World Curated Resources
  {
    id: 's1',
    title: 'Assistive Tech Tools That Help With Reading',
    description: 'Discover tools like text-to-speech and optical character recognition (OCR) that can make reading easier and boost your independence.',
    type: ContentType.ARTICLE,
    roles: [UserRole.STUDENT],
    tags: ['Technology', 'Reading'],
    url: 'https://www.understood.org/en/articles/assistive-technology-for-reading',
    imageUrl: 'https://images.unsplash.com/photo-1531297461136-82lwDe43qR8w?q=80&w=2070&auto=format&fit=crop',
    content: `Here are the key takeaways from this guide on Assistive Technology (AT):

1. **Text-to-Speech (TTS):** This tool reads digital text aloud. It's great for when your eyes get tired or when you want to focus on understanding the story instead of decoding words.
2. **Audiobooks:** Listening to books lets you enjoy complex stories even if reading them is hard. Services like Learning Ally or Bookshare are made just for students like us.
3. **Optical Character Recognition (OCR):** This technology takes a picture of a worksheet or book page and turns it into digital text that can be read aloud.

Remember, using these tools is not cheating. It is working smart.`
  },
  {
    id: 's2',
    title: 'How to Explain Dyslexia to Your Friends',
    description: 'Self-advocacy starts with understanding yourself. Here is how to talk about your learning difference with confidence.',
    type: ContentType.ARTICLE,
    roles: [UserRole.STUDENT],
    tags: ['Advocacy', 'Social'],
    url: 'https://www.dyslexic.com/blog/explaining-dyslexia-to-friends/',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop',
    content: `Talking about dyslexia can feel scary, but it helps your friends understand you better. Here is a simple way to explain it:

**Start with your strengths:** "I am really good at creative thinking and solving puzzles."
**Explain the challenge:** "My brain is wired a bit differently, so reading and spelling take me more effort than they take you. It doesn't mean I'm not smart; I just learn differently."
**Ask for what you need:** "Sometimes I might ask for help reading a menu or a game instruction. Thanks for being patient with me."`
  },
  {
    id: 's3',
    title: 'Study Hacks for the ADHD Brain',
    description: 'Traditional studying might not work for you. Try these active learning strategies designed for how your brain works.',
    type: ContentType.ARTICLE,
    roles: [UserRole.STUDENT],
    tags: ['ADHD', 'Study Skills'],
    url: 'https://www.additudemag.com/study-skills-for-students-with-adhd/',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop',
    content: `Studying with ADHD requires a different approach. Try these proven strategies:

1. **The Pomodoro Technique:** Set a timer for 25 minutes of focus, then take a 5-minute break. Your brain can handle short bursts better than long hours.
2. **Active Recall:** Don't just re-read your notes. Cover them up and try to say them out loud. If you can explain it, you know it.
3. **Body Doubling:** Study with a friend or in a room where other people are working. Just having someone else nearby can help you stay on task.`
  },
  {
    id: 's4',
    title: 'Famous People with Learning Disabilities',
    description: 'You are in good company. Read about successful actors, scientists, and entrepreneurs who share your diagnosis.',
    type: ContentType.ARTICLE,
    roles: [UserRole.STUDENT],
    tags: ['Inspiration', 'Role Models'],
    url: 'https://www.understood.org/en/articles/success-stories-celebrities-with-dyslexia-adhd-and-dyscalculia',
    imageUrl: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=2071&auto=format&fit=crop',
    content: `Having a learning disability does not stop you from achieving greatness. 

**Daniel Radcliffe (Harry Potter):** He has Dyspraxia, which affects coordination. He struggled with tying shoelaces but became a world-famous actor.
**Keira Knightley:** The Star Wars and Pirates of the Caribbean actress has dyslexia. She had to work extra hard to read her scripts, but she didn't give up.
**Richard Branson:** A billionaire entrepreneur who struggled in school due to dyslexia. He says his dyslexia helped him simplify complex business problems.`
  },
  {
    id: 's5',
    title: 'Graphic Organizers for Better Writing',
    description: 'Struggling to start an essay? Visual tools can help you organize your thoughts before you write a single sentence.',
    type: ContentType.TOOL,
    roles: [UserRole.STUDENT],
    tags: ['Writing', 'Tools'],
    url: 'https://www.readingrockets.org/topics/writing/articles/graphic-organizers-writing',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2074&auto=format&fit=crop',
    content: `Writing is a multi-step process. Don't try to do it all at once. Use a "Graphic Organizer" first.

**Mind Mapping:** Draw your main idea in the center. Draw lines out to supporting details. This helps you see how ideas connect without worrying about grammar yet.
**Hamburger Paragraph:** 
- Top Bun: Topic Sentence
- Lettuce/Tomato/Meat: Supporting Details
- Bottom Bun: Conclusion Sentence

Mapping it out visually takes the stress out of the blank page.`
  },
  
  // Parent Content
  {
    id: 'p1',
    title: 'Signs of a Language-Based LD',
    description: 'What to look for if you suspect your child is struggling with reading or language.',
    type: ContentType.ARTICLE,
    roles: [UserRole.PARENT],
    tags: ['diagnosis', 'signs'],
    url: 'https://www.ldonline.org/ld-topics/writing-spelling/language-based-learning-disability-what-know',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1972&auto=format&fit=crop',
    content: `Language-Based Learning Disabilities (LBLD) affect age-appropriate reading, spelling, and writing. Common signs in young children include trouble rhyming, difficulty learning letter names, or persistent baby talk.

In school-age children, look for:
- Slow or laborious reading.
- Guessing at words based on shape or context.
- Difficulty organizing thoughts for writing.
- Strong verbal skills but poor written work.

If you see these signs, request a formal evaluation from your school district.`
  },
  {
    id: 'p2',
    title: 'Homework Help Strategies',
    description: 'Practical ways to reduce homework battles.',
    type: ContentType.ARTICLE,
    roles: [UserRole.PARENT],
    tags: ['homework', 'strategies'],
    url: 'https://www.readingrockets.org/topics/struggling-readers/articles/homework-help-struggling-readers',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop',
    content: `1. **Create a Routine:** Same time, same place every day.
2. **Break it Down:** Cut worksheets into strips or cover parts of the page so it looks less overwhelming.
3. **Scribe:** If writing is the blocker, let your child dictate the answers to you while you write them down. This separates the thinking process from the mechanical act of writing.`
  },
  {
    id: 'p3',
    title: 'IEP vs. 504 Plan: What is the Difference?',
    description: 'Understanding the legal documents that protect your child is crucial. Here is a simple breakdown of the two main types of school support plans.',
    type: ContentType.ARTICLE,
    roles: [UserRole.PARENT],
    tags: ['Legal', 'School', 'IEP'],
    url: 'https://www.understood.org/en/articles/the-difference-between-ieps-and-504-plans',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    content: `**IEP (Individualized Education Program):**
- **Law:** Individuals with Disabilities Education Act (IDEA).
- **Goal:** Provides *specialized instruction* and related services.
- **Who qualifies:** Students with one of 13 specific disabilities who *need* specialized instruction to make progress.
- **Includes:** Specific learning goals, services, and accommodations.

**504 Plan:**
- **Law:** Section 504 of the Rehabilitation Act.
- **Goal:** Provides *access* and removes barriers (Accommodations).
- **Who qualifies:** Any student with a disability that limits a major life activity (like learning or concentrating).
- **Includes:** Accommodations (like extra time, front seating) but usually not specialized instruction.`
  },
  {
    id: 'p4',
    title: 'Building Self-Esteem in Kids with LD',
    description: 'Children with learning differences often struggle with confidence. Learn how to foster resilience and a growth mindset at home.',
    type: ContentType.ARTICLE,
    roles: [UserRole.PARENT],
    tags: ['Emotional Support', 'Parenting'],
    url: 'https://childmind.org/article/how-to-help-kids-with-learning-disabilities-build-confidence/',
    imageUrl: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?q=80&w=1974&auto=format&fit=crop',
    content: `1. **Praise Effort, Not Grades:** Focus on the hard work they put in, not just the "A". Say, "I saw how hard you practiced those spelling words," rather than "Good job on the test."
2. **Identify Strengths:** Everyone has a "Superpower." Maybe your child struggles to read but is an amazing artist, builder, or storyteller. Invest time in their strengths.
3. **Normalize Mistakes:** Model that making mistakes is part of learning. When you make a mistake, say it out loud: "Oops, I burned the toast. That's okay, I'll pay more attention next time."`
  },
  {
    id: 'p5',
    title: 'Questions to Ask at Your Next Parent-Teacher Conference',
    description: 'Don\'t go in unprepared. Use this list of questions to get a clear picture of how your child is really doing in class.',
    type: ContentType.DOWNLOADABLE,
    roles: [UserRole.PARENT],
    tags: ['Advocacy', 'School'],
    url: 'https://www.understood.org/en/articles/questions-to-ask-at-your-parent-teacher-conference',
    imageUrl: 'https://images.unsplash.com/photo-1577896337349-c373046fbda6?q=80&w=2070&auto=format&fit=crop',
    content: `**Academic Progress:**
- "What does my child's reading look like compared to grade-level expectations?"
- "Are they using their accommodations (like audiobooks or extra time) regularly?"

**Social/Emotional:**
- "Who does my child play with at recess?"
- "Do they seem frustrated or anxious during independent work time?"

**Action Items:**
- "What is one specific thing we can do at home to support what you are teaching in class this month?"`
  },

  // Teacher Content
  {
    id: 't1',
    title: 'Universal Design for Learning (UDL)',
    description: 'Classroom strategies that help LD students and everyone else.',
    type: ContentType.ARTICLE,
    roles: [UserRole.TEACHER],
    tags: ['classroom', 'pedagogy'],
    url: 'https://udlguidelines.cast.org/',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop',
    content: `UDL suggests providing multiple means of representation, action, and engagement. For a student with dyslexia, this might mean:

- Providing audio versions of texts.
- Allowing oral presentations instead of written reports.
- Using graphic organizers to scaffold writing assignments.`
  },
  {
    id: 't2',
    title: 'Accommodations List Template',
    description: 'A quick checklist of common IEP accommodations.',
    type: ContentType.DOWNLOADABLE,
    roles: [UserRole.TEACHER],
    tags: ['IEP', 'legal'],
    url: 'https://www.understood.org/en/articles/common-classroom-accommodations-and-modifications',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop',
    content: `Common Accommodations:

- Extended time on tests (50% or 100%).
- Preferential seating (near the front, away from distractions).
- Use of a calculator for math facts.
- Audiobooks for reading assignments.
- Speech-to-text software for writing.`
  },
  {
    id: 't3',
    title: 'Multisensory Teaching: Not Just for K-12',
    description: 'Learn how to incorporate visual, auditory, and kinesthetic elements into high school and adult education lessons.',
    type: ContentType.ARTICLE,
    roles: [UserRole.TEACHER],
    tags: ['Pedagogy', 'Multisensory'],
    url: 'https://www.dyslexia-reading-well.com/multisensory-learning.html',
    imageUrl: 'https://images.unsplash.com/photo-1572053139366-c92330a61286?q=80&w=2069&auto=format&fit=crop',
    content: `Multisensory teaching connects learning to multiple senses. 

1. **Visual:** Use color-coding for grammar or math steps.
2. **Auditory:** Have students pair-share or record their thoughts before writing.
3. **Kinesthetic:** Use manipulatives or "sky writing" for vocabulary.`
  },
  {
    id: 't4',
    title: 'Executive Function in the Classroom',
    description: 'Students who forget homework or lose papers likely have executive function deficits. Here is how to scaffold them.',
    type: ContentType.ARTICLE,
    roles: [UserRole.TEACHER],
    tags: ['ADHD', 'Executive Function'],
    url: 'https://developingchild.harvard.edu/science/key-concepts/executive-function/',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    content: `Scaffolding Executive Function:

- **Checklists:** Provide a printed checklist for end-of-day pack-up routines.
- **Time Management:** Use analog clocks or visual timers to show time passing.
- **Chunking:** Break long-term projects into weekly deliverables with separate due dates.`
  },
  {
    id: 't5',
    title: 'Behavior as Communication',
    description: 'Reframing disruptive behavior as a symptom of unmet learning needs or anxiety.',
    type: ContentType.ARTICLE,
    roles: [UserRole.TEACHER],
    tags: ['Behavior', 'Psychology'],
    url: 'https://childmind.org/article/breaking-behavior-code/',
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop',
    content: `When a student acts out, ask "Why?"

- **Avoidance:** Are they avoiding a task that is too hard (e.g., reading aloud)?
- **Sensory Overload:** Is the classroom too loud or bright?
- **Anxiety:** Are they afraid of making a mistake in front of peers?`
  },

  // Adult Content
  {
    id: 'a1',
    title: 'Technology for the Workplace',
    description: 'Free tools that can help you manage reading and writing at work.',
    type: ContentType.ARTICLE,
    roles: [UserRole.ADULT],
    tags: ['work', 'technology'],
    url: 'https://www.understood.org/en/articles/workplace-accommodations-for-adhd-and-learning-differences',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    content: `You do not need to struggle in silence. Modern phones and computers have built-in accessibility tools:

- **Dictation:** Use the microphone button on your phone keyboard to dictate emails.
- **Immersive Reader:** Available in Microsoft Edge and Word, it reads text aloud to you.
- **Screen Readers:** Features like 'Speak Screen' on iPhone can read articles while you commute.`
  },
  {
    id: 'a2',
    title: 'Your Rights: ADA and the Workplace',
    description: 'Understanding the Americans with Disabilities Act (ADA) and what it means for your career.',
    type: ContentType.ARTICLE,
    roles: [UserRole.ADULT],
    tags: ['Legal', 'Rights', 'Work'],
    url: 'https://askjan.org/topics/Americans-with-Disabilities-Act-ADA.cfm',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2086&auto=format&fit=crop',
    content: `The ADA protects qualified individuals with disabilities from discrimination in the workplace.

**Key Rights:**

- You have the right to request "reasonable accommodations" to help you do your job.
- An employer cannot refuse to hire you solely because of your LD if you can perform the essential functions of the job.
- You are not required to disclose your disability unless you are asking for an accommodation.`
  },
  {
    id: 'a3',
    title: 'Organizing Life with ADHD',
    description: 'Adulting is hard. Here are strategies to manage bills, appointments, and chores.',
    type: ContentType.ARTICLE,
    roles: [UserRole.ADULT],
    tags: ['ADHD', 'Organization'],
    url: 'https://chadd.org/for-adults/organizing-the-home-and-office/',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop',
    content: `1. **The Launch Pad:** Designate one spot near the door for keys, wallet, and bag. Always put them there.
2. **Auto-Pay Everything:** Avoid late fees by automating bill payments.
3. **Digital Calendar:** If it is not on the calendar, it does not exist. Set two reminders for every event: one day before and one hour before.`
  },
  {
    id: 'a4',
    title: 'Budgeting with Dyscalculia',
    description: 'Managing money when numbers are your enemy.',
    type: ContentType.ARTICLE,
    roles: [UserRole.ADULT],
    tags: ['Dyscalculia', 'Finance'],
    url: 'https://www.dyscalculia.org/math-learning-disabilities/math-anxiety/money-math',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop',
    content: `**Visual Budgeting:** Use apps that show your spending in pie charts rather than spreadsheets.

**Round Up:** When estimating costs, always round up to the nearest dollar to build a buffer.

**Cash Envelope System:** For discretionary spending (like dining out), use cash. When the envelope is empty, stop spending. This removes the abstract nature of card swipes.`
  }
];