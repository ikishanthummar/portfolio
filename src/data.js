export const profile = {
  name: 'Kishan Thummar',
  location: 'Surat, India',
  email: 'thummarkishan888@gmail.com',
  phone: '+91 78018 40040',
  phoneHref: 'tel:+917801840040',
  github: 'https://github.com/ikishanthummar',
  linkedin: 'https://linkedin.com/in/ikishanthummar',
  cv: '/Kishan_Thummar_CV.pdf',
  about:
    'Full Stack Developer with 6.2+ years of experience designing and delivering scalable enterprise applications across fintech, CRM, event management and media platforms.',
}

export const skillGroups = [
  {
    key: 'backend',
    title: 'Backend',
    blurb: 'Robust APIs and services on the .NET ecosystem.',
    items: ['.NET Core', 'ASP.NET Core', '.NET Framework', '.NET MVC', 'C#', 'Entity Framework Core', 'Dapper', 'LINQ', 'REST API', 'Hangfire', 'SignalR'],
  },
  {
    key: 'frontend',
    title: 'Frontend',
    blurb: 'Dynamic dashboards and polished UIs.',
    items: ['Angular (v15+)', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'jQuery'],
  },
  {
    key: 'database',
    title: 'Database',
    blurb: 'Fast, well-indexed data layers.',
    items: ['SQL Server', 'PostgreSQL', 'Stored Procedures', 'Views', 'Functions', 'Indexing', 'Query Optimization'],
  },
  {
    key: 'architecture',
    title: 'Architecture',
    blurb: 'Designs that scale with the business.',
    items: ['Clean Architecture', 'Microservices', 'JWT Auth', 'Dependency Injection', 'Async Programming', 'SOLID'],
  },
  {
    key: 'cloud',
    title: 'Cloud & DevOps',
    blurb: 'Shipping to production, reliably.',
    items: ['Azure App Services', 'Azure Functions', 'Blob Storage', 'AWS S3', 'EC2', 'RDS', 'IAM', 'Redis', 'Docker', 'GitHub Actions', 'IIS'],
  },
  {
    key: 'tools',
    title: 'Tools & AI',
    blurb: 'Daily drivers and AI copilots.',
    items: ['Git', 'Postman', 'Visual Studio', 'VS Code', 'Firebase', 'Stripe', 'ChatGPT', 'Claude', 'Google AI Studio'],
  },
]

export const techStack = [
  'C#', '.NET Core', 'ASP.NET Core', 'Angular', 'React', 'TypeScript', 'SQL Server', 'PostgreSQL',
  'Entity Framework', 'Dapper', 'Hangfire', 'SignalR', 'Docker', 'Azure', 'AWS', 'Redis', 'Stripe', 'GitHub Actions',
]

export const experience = [
  {
    company: 'VSI Infotech LLP',
    role: 'Full Stack Developer',
    period: 'Jan 2026 – Present',
    location: 'Surat, Gujarat',
    current: true,
    points: [
      'Designed and implemented end-to-end payment processing systems covering initiation, verification and reconciliation.',
      'Built scalable webhook processing systems to handle real-time payment events with high reliability.',
      'Developed background job services with retry mechanisms, improving failure recovery and transaction consistency.',
      'Integrated multiple third-party payment gateways and APIs with seamless communication and fault tolerance.',
      'Engineered callback handling to keep transaction state accurate across distributed systems.',
      'Reduced transaction failures through robust error handling and retry strategies.',
    ],
    tags: ['Payments', 'Webhooks', 'Background Jobs', 'Distributed Systems'],
  },
  {
    company: 'InfiAdd TechSolution',
    role: 'Full Stack Developer',
    period: 'Nov 2022 – Dec 2025',
    location: 'Surat, Gujarat',
    points: [
      'Spearheaded 10+ backend APIs with ASP.NET Core, reducing response times and improving application efficiency.',
      'Integrated Stripe, Firebase and Mailchimp for payments, notifications and marketing.',
      'Implemented role-based JWT authentication with structured permission models.',
      'Built a media management platform for images, videos, PDFs and PPTs with real-time previews and controls.',
      'Deployed and managed backend services on Azure App Services.',
    ],
    tags: ['ASP.NET Core', 'Stripe', 'Firebase', 'Azure'],
  },
  {
    company: 'Swicktech Solution',
    role: 'Backend Developer',
    period: 'Apr 2021 – Oct 2022',
    location: 'Surat, Gujarat',
    points: [
      'Refactored legacy ASP.NET MVC apps into modular, maintainable .NET Core projects with Angular frontends.',
      'Redesigned Angular components for dynamic user management and reporting dashboards.',
      'Tuned SQL Server procedures and indexing to speed up report generation.',
      'Delivered 15+ backend features through collaboration and code reviews.',
    ],
    tags: ['.NET Core', 'Angular', 'SQL Server', 'Refactoring'],
  },
  {
    company: 'Arqonics Infotech',
    role: 'Trainee Developer',
    period: 'Apr 2020 – Mar 2021',
    location: 'Surat, Gujarat',
    points: [
      'Developed admin panels with full CRUD using C# and .NET Framework.',
      'Automated repetitive manual workflows, saving 25+ hours per month and reducing human error.',
      'Built responsive UI pages with HTML, CSS and Angular for internal tools.',
      'Gained end-to-end feature experience, from database design to UI integration.',
    ],
    tags: ['C#', '.NET Framework', 'Automation'],
  },
]

export const projects = [
  {
    name: 'NexivoPay',
    role: 'Full Stack Developer',
    category: 'Fintech',
    featured: true,
    color: '#8b6cff',
    highlight: 'Built from scratch',
    summary:
      'A scalable payment platform built from scratch: merchant onboarding, checkout, deposits, payouts and multiple payment gateways.',
    stack: ['.NET 10', 'ASP.NET Core', 'React', 'PostgreSQL', 'Dapper', 'EF Core', 'Hangfire', 'Docker', 'AWS S3', 'Redis'],
    points: [
      'Architected and developed from scratch a scalable payment platform covering merchant onboarding, customer management, checkout, transaction processing and gateway integrations.',
      'Designed the complete transaction lifecycle for deposit and payout flows, including charges, gateway responses, callbacks/webhooks, status history, reconciliation and expiry.',
      'Built a secure, resilient architecture: API Key/Secret auth, JWT authorization, role/permission management, IP whitelisting, rate limiting, centralized exception handling and CorrelationId-based distributed logging.',
      'Developed Hangfire-based background processing and retries for transaction expiry and scheduled operations.',
      'Established Docker deployments and GitHub Actions CI/CD with self-hosted runners, applying Clean Architecture and SOLID throughout.',
    ],
  },
  {
    name: 'NaguPay',
    role: 'Full Stack Developer',
    category: 'Fintech',
    featured: true,
    color: '#2dd4a7',
    highlight: 'Hosted checkout + settlements',
    summary: 'Hosted checkout and transaction management with automated, scheduled settlement reporting.',
    stack: ['ASP.NET Core', 'ASP.NET MVC', 'C#', 'jQuery', 'SQL Server', 'Hangfire'],
    points: [
      'Designed and implemented a secure hosted checkout flow for payment processing and transaction management.',
      'Built automated settlement summaries that generate reports and email them on configurable Hangfire schedules.',
      'Integrated payment gateway APIs with webhook and callback handling for accurate transaction processing.',
      'Optimized code, SQL queries and stored procedures for performance and maintainability.',
    ],
  },
  {
    name: 'LogicueCRM',
    role: 'Full Stack Developer',
    category: 'Enterprise',
    color: '#ff8a3d',
    highlight: 'Solo end-to-end build',
    summary: 'A full-featured CRM I built on my own, with accounts, contacts, products and multi-currency quotations.',
    stack: ['ASP.NET Core', 'Angular', 'SQL Server', 'Dapper', 'Stored Procedures'],
    points: [
      'Designed and developed the entire CRM independently, frontend and backend.',
      'Used Dapper ORM and stored procedures for high-performance, secure data operations.',
      'Engineered Account Management, Contact CRUD, Product & Category Management and Quotation Generation modules.',
      'Added multi-currency support with dynamic pricing logic for quotations.',
      'Built secure middleware and modular, reusable services.',
    ],
  },
  {
    name: 'ArtCircle',
    role: 'Backend Developer',
    category: 'Enterprise',
    color: '#ff5c8a',
    highlight: 'Full KYC workflows',
    summary: 'User and company platform with complete KYC verification workflows and secure role-based access.',
    stack: ['ASP.NET Core', 'SQL Server', 'Dapper', 'Stored Procedures'],
    points: [
      'Built user and company modules with a Database-First approach using Dapper ORM.',
      'Implemented custom middleware for secure, role-based authentication.',
      'Designed complete KYC workflows for users and companies with verification APIs.',
      'Followed Clean Architecture for scalable, maintainable code.',
    ],
  },
  {
    name: 'GridWall',
    role: 'Backend Developer · Team',
    category: 'Real-time',
    color: '#3d9bff',
    highlight: 'Real-time with SignalR',
    summary: 'Desktop + web video wall system with multi-screen streaming and real-time sync across devices.',
    stack: ['.NET Core', 'WinForms', 'React', 'SignalR', 'SQLite', 'MySQL'],
    points: [
      'Contributed to a Windows Forms desktop app and a React web interface sharing backend APIs.',
      'Developed APIs for multi-screen video streaming with dynamic window mapping.',
      'Integrated SignalR for real-time screen updates across devices.',
      'Implemented role-based access, controller/screen CRUD and a custom database sync service.',
    ],
  },
  {
    name: 'EventPrix',
    role: 'Backend Developer',
    category: 'Events',
    color: '#b07cff',
    highlight: 'Stripe + coupon engine',
    summary: 'Scalable event management platform with ticket types, dynamic pricing, coupons and Stripe payments.',
    stack: ['ASP.NET Core', 'SQL Server', 'Stripe'],
    points: [
      'Built RESTful APIs on a robust 4-layer architecture for a scalable event platform.',
      'Implemented multiple ticket types, event-specific pricing and a coupon code system.',
      'Integrated Stripe for secure online payments.',
      'Used SQL Views to improve query performance; built role-based access for organizers and attendees.',
    ],
  },
  {
    name: 'TwoTixx',
    role: 'Backend Developer · Team',
    category: 'Events',
    color: '#22d3ee',
    highlight: 'Fair seat-hold logic',
    summary: 'High-demand ticketing platform with OTP login, temporary seat holds and transactional bookings.',
    stack: ['ASP.NET Core', 'SQL Server', 'Stripe'],
    points: [
      'Developed secure APIs supporting OTP-based user login.',
      'Integrated Stripe for reliable transaction handling.',
      'Built temporary seat-booking logic for fair allocation during high demand.',
      'Created endpoints for listings, ticket selection and booking flows with transactional integrity.',
    ],
  },
]

export const education = {
  degree: 'Bachelor of Computer Applications (BCA)',
  period: '2016 – 2019',
  grade: 'First Class',
}
