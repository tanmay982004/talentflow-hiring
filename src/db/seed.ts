// src/db/seed.ts
import { db } from './dexie';
import { nanoid } from 'nanoid';

// --- NEW: Realistic Data Arrays ---

const FIRST_NAMES = [
  "Aarav", "Advait", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Kiran", "Meera", "Nikhil",
  "Priya", "Ravi", "Sahana", "Tanvi", "Vikram", "Aditi", "Aryan", "Bhavna", "Deepak", "Esha",
  "Gaurav", "Hiral", "Jai", "Komal", "Lakshmi", "Mohan", "Neha", "Om", "Pooja", "Rahul",
  "Shreya", "Tejas", "Uma", "Varun", "Yash", "Zara", "Aditya", "Bina", "Chetan", "Divya"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Agarwal", "Joshi", "Shah", "Mehta", "Reddy",
  "Iyer", "Nair", "Rao", "Verma", "Kulkarni", "Desai", "Pillai", "Banerjee", "Sinha", "Mishra",
  "Tiwari", "Pandey", "Malhotra", "Chopra", "Kapoor", "Saxena", "Jain", "Agnihotri", "Bhatt", "Chandra",
  "Dutta", "Goyal", "Khanna", "Mahajan", "Sethi", "Thakur", "Varma", "Yadav", "Bose", "Ghosh"
];

// This can be pasted directly into your seed.ts file

const JOB_DATA = [
    { title: "Principal Frontend Architect (React/Next.js)", tags: ['frontend', 'react'], summary: "Architect and lead the development of our next-generation fintech platform using React 18, Next.js 14, and modern state management. Drive technical excellence across multiple product teams while establishing frontend standards and best practices." },
    { title: "Staff Backend Engineer (Golang/Microservices)", tags: ['backend', 'golang'], summary: "Build high-performance, distributed systems using Go, gRPC, and event-driven architecture. Lead the design of scalable APIs serving 100M+ requests daily while ensuring reliability and security across our payment processing infrastructure." },
    { title: "Senior Product Designer (AI/ML Interfaces)", tags: ['design'], summary: "Design innovative user experiences for AI-powered features in our healthcare platform. Collaborate with ML engineers to make complex algorithms accessible through intuitive interfaces, focusing on accessibility and inclusive design principles." },
    { title: "VP of Product Strategy", tags: ['management', 'product'], summary: "Define and execute product vision for our B2B SaaS platform serving enterprise clients. Lead cross-functional teams to drive product-market fit, analyze user behavior, and establish data-driven decision making processes across the organization." },
    { title: "Senior Platform Engineer (Kubernetes/Service Mesh)", tags: ['devops', 'cloud'], summary: "Build and maintain our cloud-native infrastructure using Kubernetes, Istio service mesh, and GitOps practices. Drive platform reliability and developer experience through automation, monitoring, and zero-downtime deployment strategies." },
    { title: "Principal QA Engineer (Test Automation)", tags: ['qa'], summary: "Lead our quality engineering transformation by building comprehensive test automation frameworks using Playwright, K6, and custom testing tools. Establish quality gates and metrics that ensure exceptional user experience across all touchpoints." },
    { title: "Mid-Level Full Stack Engineer (TypeScript)", tags: ['frontend', 'backend'], summary: "Develop end-to-end features using TypeScript, React, Node.js, and PostgreSQL in our edtech platform. Collaborate with product and design teams to build engaging learning experiences for students and educators worldwide." },
    { title: "Senior ML Engineer (Computer Vision)", tags: ['data'], summary: "Design and deploy computer vision models for our autonomous vehicle platform. Work with massive datasets, implement real-time inference pipelines, and collaborate with robotics engineers to bring cutting-edge AI solutions to production." },
    { title: "Director of Engineering (Growth Team)", tags: ['management'], summary: "Lead a cross-functional engineering team focused on user acquisition, conversion, and retention. Drive technical strategy for A/B testing infrastructure, recommendation systems, and personalization features that impact millions of users daily." },
    { title: "Senior Cloud Security Architect", tags: ['cloud', 'security'], summary: "Design and implement comprehensive security controls across our multi-cloud infrastructure. Lead zero-trust architecture initiatives, compliance programs (SOC 2, PCI DSS), and security incident response for our financial services platform." },
    { title: "Native Mobile Developer (Flutter)", tags: ['mobile', 'flutter'], summary: "Build beautiful, performant mobile applications using Flutter and Dart. Focus on creating seamless offline experiences, implementing biometric authentication, and optimizing for emerging mobile platforms and foldable devices." },
    { title: "Senior Program Manager (AI Platform)", tags: ['management'], summary: "Drive strategic initiatives across our AI/ML platform team. Coordinate between research, engineering, and product teams to bring cutting-edge machine learning capabilities to market while ensuring ethical AI practices." },
    { title: "Lead Security Engineer (Zero Trust)", tags: ['security'], summary: "Implement zero-trust security architecture across our cloud infrastructure. Lead threat modeling, security code reviews, and incident response while building security automation tools that protect our global user base of 50M+ customers." },
    { title: "Senior Blockchain Developer (Go/Solidity)", tags: ['backend', 'blockchain'], summary: "Develop secure, high-performance blockchain applications using Go and Solidity. Build DeFi protocols, smart contract auditing tools, and Layer 2 scaling solutions for our next-generation cryptocurrency exchange platform." },
    { title: "Frontend Engineer (Vue.js/Nuxt.js)", tags: ['frontend', 'vuejs'], summary: "Create responsive, accessible web applications using Vue 3, Nuxt.js, and TypeScript. Focus on server-side rendering, performance optimization, and building reusable component libraries for our content management platform." },
    { title: "Head of Product Design", tags: ['design', 'management'], summary: "Lead design strategy for our multi-product ecosystem. Establish design systems, manage a team of 15+ designers, and drive user-centered design practices that have increased user satisfaction scores by 40% year-over-year." },
    { title: "Staff Site Reliability Engineer (Observability)", tags: ['devops', 'sre'], summary: "Build world-class observability and reliability practices for our 99.99% uptime SaaS platform. Lead incident response, chaos engineering, and capacity planning while mentoring junior SREs across multiple product teams." },
    { title: "Senior Database Engineer (Distributed Systems)", tags: ['backend', 'data'], summary: "Architect and optimize distributed database systems handling petabytes of data. Focus on sharding strategies, replication, and performance optimization for our real-time analytics platform serving Fortune 500 companies." },
    { title: "Senior Android Engineer (Jetpack Compose)", tags: ['mobile', 'android'], summary: "Lead Android development using Kotlin, Jetpack Compose, and modern Android architecture. Build innovative social features, implement advanced camera capabilities, and optimize for battery life and performance across diverse device ecosystems." },
    { title: "Principal Data Engineer (Real-time Streaming)", tags: ['data', 'streaming'], summary: "Design and implement real-time data processing systems using Apache Kafka, Flink, and ClickHouse. Build data infrastructure supporting ML model training and real-time personalization for our recommendation engine." },
    { title: "Enterprise Solutions Architect", tags: ['cloud', 'enterprise'], summary: "Partner with Fortune 1000 clients to architect scalable solutions on our platform. Lead technical sales engagements, design custom integrations, and ensure successful enterprise deployments across complex multi-cloud environments." },
    { title: "Senior UX Researcher (Behavioral Analytics)", tags: ['design', 'research'], summary: "Lead user research initiatives combining qualitative methods with advanced analytics. Design and execute research studies that inform product strategy, using tools like Hotjar, FullStory, and custom data analysis to drive user-centered decisions." },
    { title: "Developer Experience Engineer", tags: ['documentation', 'developer'], summary: "Build exceptional developer experiences through comprehensive documentation, interactive tutorials, and developer tools. Create SDKs, code samples, and onboarding flows that help developers integrate with our APIs successfully." },
    { title: "QA Engineering Manager", tags: ['qa', 'management'], summary: "Lead a team of 12+ QA engineers while establishing testing excellence across our organization. Drive automation strategies, quality metrics, and cross-team collaboration to ensure product quality at scale." },
    { title: "Senior IT Infrastructure Engineer", tags: ['it', 'infrastructure'], summary: "Manage enterprise IT infrastructure for our 500+ person organization. Lead migrations to cloud-based solutions, implement zero-trust networking, and ensure 99.9% uptime for critical business systems and developer tools." },
    { title: "Growth Marketing Lead (Performance)", tags: ['marketing', 'growth'], summary: "Drive user acquisition and revenue growth through data-driven marketing campaigns. Own our marketing funnel optimization, A/B testing strategy, and paid acquisition channels with $2M+ monthly ad spend." },
    { title: "Technical Content Strategist", tags: ['marketing', 'technical'], summary: "Create technical content that educates and engages our developer community. Write in-depth tutorials, case studies, and thought leadership pieces that showcase our platform capabilities and drive developer adoption." },
    { title: "Principal Security Researcher", tags: ['security', 'research'], summary: "Lead advanced threat research and vulnerability discovery initiatives. Develop novel security testing methodologies, contribute to open-source security tools, and represent the company at major security conferences and research publications." },
    { title: "Senior ML Platform Engineer", tags: ['data', 'platform'], summary: "Build and scale our machine learning infrastructure supporting 100+ ML models in production. Develop MLOps pipelines, model versioning systems, and automated retraining workflows using Kubeflow and MLflow." },
    { title: "Engineering Excellence Coach", tags: ['management', 'coaching'], summary: "Drive engineering excellence across our organization through coaching, process improvement, and cultural transformation. Lead initiatives in code quality, testing practices, and developer productivity metrics." }
];

const CANDIDATE_PROFILES = {
  frontend: [
    "Seasoned React.js developer with 6+ years crafting immersive user interfaces for fintech platforms. Expert in Next.js, Redux Toolkit, and micro-frontend architecture with a focus on accessibility standards.", 
    "Angular specialist with deep expertise in RxJS and NgRx state management. Successfully migrated legacy systems to modern Angular versions while maintaining backward compatibility.", 
    "Vue 3 Composition API expert with strong background in Nuxt.js and headless CMS integration. Passionate about creating delightful user experiences with smooth animations and transitions.",
    "Full-stack frontend engineer specializing in React Native and PWA development. Built cross-platform applications serving millions of users across e-commerce and healthcare domains."
  ],
  backend: [
    "Senior backend architect with 9+ years in Node.js, Golang, and Python. Designed event-driven microservices handling 10M+ requests/day with expertise in Apache Kafka, Redis, and MongoDB.", 
    "Cloud-native backend engineer specializing in serverless architecture on AWS Lambda and Azure Functions. Expert in GraphQL federation and gRPC services with strong DevSecOps practices.", 
    "Python Django expert with 5 years building robust APIs for fintech applications. Experienced in implementing OAuth2, JWT authentication, and PCI-compliant payment processing systems.",
    "Java Spring Boot specialist focused on enterprise-grade applications. Built scalable banking systems with strong emphasis on transaction integrity and regulatory compliance."
  ],
  design: [
    "Senior UX researcher and designer with 7+ years creating intuitive interfaces for healthcare and educational technology. Expert in design systems, user journey mapping, and inclusive design principles.", 
    "Product designer specializing in B2B SaaS platforms with focus on data visualization and complex workflows. Proficient in Figma, Adobe Creative Suite, and prototyping with Framer.", 
    "Visual designer with expertise in motion graphics and brand identity for startups. Successfully designed and launched design systems for 15+ companies across various industries."
  ],
  qa: [
    "QA automation expert with 6+ years specializing in test-driven development using Jest, Selenium, and Appium. Built comprehensive testing strategies for mobile-first applications.", 
    "Senior QA engineer with expertise in performance testing using K6 and JMeter. Led quality assurance for high-traffic e-commerce platforms serving 5M+ users daily.", 
    "Test architect focused on API testing and service virtualization. Implemented shift-left testing practices reducing bug leakage by 80% in agile development cycles."
  ],
  devops: [
    "DevOps architect with 8+ years implementing Infrastructure as Code using Terraform, Ansible, and Pulumi across multi-cloud environments. Expert in zero-downtime deployments.", 
    "Site Reliability Engineer specializing in Kubernetes orchestration and service mesh technologies. Reduced system downtime by 99.5% through proactive monitoring and chaos engineering.", 
    "Cloud security engineer focused on implementing DevSecOps practices. Built secure CI/CD pipelines with automated vulnerability scanning and compliance reporting."
  ],
  management: [
    "Product leader with 10+ years building AI-powered SaaS platforms. Successfully launched 5 products from concept to $10M+ ARR with focus on user acquisition and retention strategies.", 
    "Engineering manager passionate about building high-performing teams. Led distributed teams of 25+ engineers across multiple time zones while maintaining 95% team satisfaction scores.",
    "Agile coach and program manager with expertise in scaling engineering organizations. Implemented OKR frameworks and improved delivery velocity by 40% across multiple product teams."
  ],
  mobile: [
    "Native iOS developer with 6+ years expertise in Swift, SwiftUI, and Core Data. Published 12 apps on App Store with combined 2M+ downloads and 4.8-star average rating.", 
    "Flutter specialist with deep knowledge of Dart programming and state management using Bloc pattern. Built fintech mobile apps with biometric authentication and offline capabilities."
  ],
  data: [
    "Senior data scientist with PhD in Computer Science specializing in NLP and computer vision. Built recommendation engines and fraud detection systems using TensorFlow and PyTorch.", 
    "Data engineer with expertise in building real-time data pipelines using Apache Spark, Airflow, and Snowflake. Processed petabytes of data for machine learning workflows."
  ],
  cloud: [
    "Multi-cloud architect with AWS Solutions Architect Professional and Azure Expert certifications. Designed hybrid cloud solutions reducing infrastructure costs by 35%.", 
    "Cloud migration specialist with expertise in containerization and serverless architectures. Successfully migrated 50+ legacy applications to cloud-native solutions."
  ],
  security: [
      "Cybersecurity specialist with CISSP certification and 7+ years in threat hunting and incident response. Expert in SIEM platforms and zero-trust architecture implementation.",
      "Application security engineer focused on secure code review and vulnerability assessment. Built security automation tools reducing manual security testing by 70%."
  ]
};

// --- NEW: Categorized Candidate Profiles ---

const generateSlug = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

export async function seedDB() {
  const jobsCount = await db.jobs.count();
  const assessmentsCount = await db.assessments.count();
  
  if (jobsCount > 0 && assessmentsCount >= 3) {
    console.log('DB already seeded with professional data and assessments (unique email format)');
    return;
  }
  
  // Clear existing data to ensure fresh seeding with assessments
  if (jobsCount > 0) {
    console.log('Clearing existing data to add assessments...');
    await db.assessments.clear();
    await db.candidates.clear();
    await db.jobs.clear();
  }

  const stages = ['applied','screen','tech','offer','hired','rejected'] as const;

  const jobs = JOB_DATA.map((jobData, i) => ({
    id: nanoid(),
    title: jobData.title,
    slug: generateSlug(jobData.title),
    status: i % 5 === 0 ? 'archived' as const : 'active' as const,
    tags: jobData.tags,
    order: i + 1,
    createdAt: Date.now() - i * 1000 * 3600,
    summary: jobData.summary,
  }));
  await db.jobs.bulkAdd(jobs);

  const candidates = [];
  const generatedEmails = new Set<string>();

  // --- THIS IS THE DEFINITIVE SMART SEEDING LOGIC ---
  for (let i = 0; i < 1000; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    // 1. Pick a random job. This will be our context.
    const targetJob = jobs[Math.floor(Math.random() * jobs.length)];
    // 2. Get the primary tag of that job (e.g., 'frontend').
    const primaryTag = targetJob.tags[0] as keyof typeof CANDIDATE_PROFILES;
    
    // 3. Get the list of candidate profiles that are relevant to that tag.
    const relevantProfiles = CANDIDATE_PROFILES[primaryTag] || ["Generalist with experience in multiple areas."];
    
    // 4. Pick a random profile from the relevant list.
    const profileText = relevantProfiles[Math.floor(Math.random() * relevantProfiles.length)];
    
    // 5. Generate a unique email without dots.
    let email = `${firstName.toLowerCase()}${lastName.toLowerCase()}@techcorp.in`;
    let counter = 1;
    while (generatedEmails.has(email)) {
      email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${counter++}@techcorp.in`;
    }
    generatedEmails.add(email);

    candidates.push({
      id: nanoid(),
      name: `${firstName} ${lastName}`,
      email: email,
      jobId: targetJob.id, // Assign to the relevant job
      stage: stages[Math.floor(Math.random() * stages.length)],
      timeline: [],
      profile: profileText,
    });
  }
  await db.candidates.bulkAdd(candidates);
  
  // Create three comprehensive seeded assessments
  const assessments = [];
  
  // Find specific jobs for our assessments
  const frontendJob = jobs.find(job => job.title === 'Principal Frontend Architect (React/Next.js)');
  const backendJob = jobs.find(job => job.title === 'Staff Backend Engineer (Golang/Microservices)');
  const productJob = jobs.find(job => job.title === 'VP of Product Strategy');
  
  if (frontendJob) {
    assessments.push({
      id: nanoid(),
      jobId: frontendJob.id,
      title: 'Principal Frontend Architect Technical Assessment',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      sections: [
        {
          id: nanoid(),
          title: 'React & JavaScript Fundamentals',
          questions: [
            {
              id: nanoid(),
              label: 'Explain the difference between useState and useEffect hooks in React.',
              type: 'long-text' as const,
              required: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'What are React keys and why are they important?',
              type: 'single-choice' as const,
              required: true,
              options: [
                { value: 'Keys help React identify which items have changed, are added, or are removed' },
                { value: 'Keys are used for styling components' },
                { value: 'Keys are only needed for forms' },
                { value: 'Keys are deprecated in modern React' }
              ]
            },
            {
              id: nanoid(),
              label: 'Which of the following are valid ways to handle state in React? (Select all that apply)',
              type: 'multi-choice' as const,
              required: true,
              options: [
                { value: 'useState hook' },
                { value: 'useReducer hook' },
                { value: 'Context API' },
                { value: 'Redux' },
                { value: 'Direct DOM manipulation' }
              ]
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Performance & Optimization',
          questions: [
            {
              id: nanoid(),
              label: 'How would you optimize a React application for better performance?',
              type: 'long-text' as const,
              required: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'Rate your experience with TypeScript (1-10)',
              type: 'numeric' as const,
              required: true,
              min: 1,
              max: 10,
              options: []
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Code Portfolio',
          questions: [
            {
              id: nanoid(),
              label: 'Upload your resume or portfolio (PDF format preferred)',
              type: 'file' as const,
              required: true,
              fileTypes: '.pdf,.doc,.docx',
              maxFileSize: 5,
              allowMultiple: false,
              options: []
            }
          ]
        }
      ]
    });
  }
  
  if (backendJob) {
    assessments.push({
      id: nanoid(),
      jobId: backendJob.id,
      title: 'Staff Backend Engineer System Design Assessment',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      sections: [
        {
          id: nanoid(),
          title: 'Node.js & API Design',
          questions: [
            {
              id: nanoid(),
              label: 'Describe the event loop in Node.js and how it handles asynchronous operations.',
              type: 'long-text' as const,
              required: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'What is the difference between REST and GraphQL?',
              type: 'single-choice' as const,
              required: true,
              options: [
                { value: 'REST uses multiple endpoints, GraphQL uses a single endpoint' },
                { value: 'REST is faster than GraphQL' },
                { value: 'GraphQL only works with databases' },
                { value: 'There is no difference' }
              ]
            },
            {
              id: nanoid(),
              label: 'How many years of experience do you have with Node.js?',
              type: 'numeric' as const,
              required: true,
              min: 0,
              max: 20,
              options: []
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Database & System Design',
          questions: [
            {
              id: nanoid(),
              label: 'Which database types have you worked with? (Select all that apply)',
              type: 'multi-choice' as const,
              required: true,
              options: [
                { value: 'PostgreSQL' },
                { value: 'MongoDB' },
                { value: 'Redis' },
                { value: 'MySQL' },
                { value: 'Elasticsearch' },
                { value: 'DynamoDB' }
              ]
            },
            {
              id: nanoid(),
              label: 'Design a system that can handle 1 million users. Describe your architecture choices.',
              type: 'long-text' as const,
              required: true,
              options: []
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Technical Documentation',
          questions: [
            {
              id: nanoid(),
              label: 'Upload a code sample or technical documentation you\'ve written',
              type: 'file' as const,
              required: false,
              fileTypes: '.pdf,.md,.txt,.js,.ts,.py',
              maxFileSize: 10,
              allowMultiple: true,
              options: []
            }
          ]
        }
      ]
    });
  }
  
  if (productJob) {
    assessments.push({
      id: nanoid(),
      jobId: productJob.id,
      title: 'VP Product Strategy Executive Assessment',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      sections: [
        {
          id: nanoid(),
          title: 'Product Strategy',
          questions: [
            {
              id: nanoid(),
              label: 'How do you prioritize feature requests from different stakeholders?',
              type: 'long-text' as const,
              required: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'What is your preferred product management methodology?',
              type: 'single-choice' as const,
              required: true,
              options: [
                { value: 'Agile/Scrum' },
                { value: 'Lean Startup' },
                { value: 'Design Thinking' },
                { value: 'OKRs (Objectives and Key Results)' },
                { value: 'Shape Up (Basecamp)' }
              ]
            },
            {
              id: nanoid(),
              label: 'Rate your experience level (1-10) in these areas:',
              type: 'multi-choice' as const,
              required: true,
              options: [
                { value: 'User Research & Analytics' },
                { value: 'A/B Testing & Experimentation' },
                { value: 'Roadmap Planning' },
                { value: 'Stakeholder Management' },
                { value: 'Technical Understanding' }
              ]
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Market Analysis',
          questions: [
            {
              id: nanoid(),
              label: 'Describe a time when you had to pivot a product strategy. What was your approach?',
              type: 'long-text' as const,
              required: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'How many years of product management experience do you have?',
              type: 'numeric' as const,
              required: true,
              min: 0,
              max: 25,
              options: []
            }
          ]
        },
        {
          id: nanoid(),
          title: 'Portfolio & Case Studies',
          questions: [
            {
              id: nanoid(),
              label: 'Upload your product portfolio or case study examples',
              type: 'file' as const,
              required: true,
              fileTypes: '.pdf,.ppt,.pptx,.doc,.docx',
              maxFileSize: 15,
              allowMultiple: true,
              options: []
            },
            {
              id: nanoid(),
              label: 'What type of products have you managed? (Select all that apply)',
              type: 'multi-choice' as const,
              required: true,
              options: [
                { value: 'B2B SaaS' },
                { value: 'Consumer Mobile Apps' },
                { value: 'E-commerce Platforms' },
                { value: 'Enterprise Software' },
                { value: 'APIs & Developer Tools' },
                { value: 'Hardware Products' }
              ]
            }
          ]
        }
      ]
    });
  }
  
  // Add the assessments to the database
  if (assessments.length > 0) {
    await db.assessments.bulkAdd(assessments);
    console.log(`Added ${assessments.length} comprehensive seeded assessments`);
  }
  
  console.log('🎉 Final intelligent seeding complete with assessments!');
  console.log('📅 Seeded with Indian names: Aarav, Ananya, Arjun, Kavya, Meera, Priya, Rahul, Shreya, etc.');
  console.log('📧 Unique email format: firstnamelastname@techcorp.in (no dots!)');
  console.log('💼 Added unique job roles: Principal Frontend Architect, Staff Backend Engineer, VP Product Strategy, etc.');
  console.log('✨ Your seed data is now completely unique and different from your friend\'s!');
}