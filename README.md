# 🚀 TalentFlow - Modern Hiring Management Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://talentflow-hiring.vercel.app)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> A comprehensive, modern hiring management platform built with React, TypeScript, and cutting-edge web technologies. Streamline your entire recruitment process from job posting to candidate assessment.

## 📋 Deliverables

### 🌐 Deployed App Link
**🔗 [TalentFlow Live Application](https://talentflow-hiring.vercel.app)**

### 💻 GitHub Repository Link
**📂 [GitHub Repository](https://github.com/tanmay982004/talentflow-hiring)**

### 📖 Documentation
This README includes comprehensive setup instructions, architecture details, technical decisions, and known issues.

---

## ✨ Key Features

### 🎯 **Job Management**
- ✅ Create and manage job postings
- ✅ Job categorization with tags and skills
- ✅ Active/Archived job status management
- ✅ Responsive job cards with detailed information

### 👥 **Candidate Pipeline**
- ✅ Interactive Kanban board for candidate tracking
- ✅ Drag-and-drop functionality between hiring stages
- ✅ Candidate profiles with skills and experience matching
- ✅ Timeline tracking for candidate progression
- ✅ Notes and feedback system

### 📊 **Assessment System**
- ✅ Comprehensive assessment builder with multiple question types:
  - 📝 Long-text responses
  - ☑️ Single and multiple choice questions
  - 🔢 Numeric range inputs
  - 📎 File upload capabilities
- ✅ Section-based assessment organization
- ✅ Real-time assessment preview
- ✅ Pre-built assessment templates for common roles

### 🎨 **User Experience**
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation and user flows
- ✅ Professional UI components
- ✅ Mobile-friendly interface

### 🔧 **Technical Excellence**
- ✅ Built with React 19 and TypeScript
- ✅ Real-time data management with TanStack Query
- ✅ Mock Service Worker (MSW) for realistic API simulation
- ✅ Local database with Dexie.js (IndexedDB)
- ✅ Professional routing with React Router
- ✅ Form handling with React Hook Form

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling

### **State Management & Data**
- **TanStack Query** - Powerful data fetching and caching
- **React Hook Form** - Performant form handling
- **Dexie.js** - IndexedDB wrapper for local storage

### **Development Tools**
- **Mock Service Worker (MSW)** - API mocking
- **ESLint** - Code linting
- **Heroicons** - Beautiful SVG icons
- **Nanoid** - Unique ID generation

### **Deployment**
- **Vercel** - Zero-config deployment
- **GitHub** - Version control and collaboration

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/tanmay982004/talentflow-hiring.git
cd talentflow-hiring
```

2. **Install dependencies**
```bash
npm install
# or if you prefer yarn
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### Automatic Data Seeding

The application will automatically seed with realistic data on first load:
- **30+ Professional Job Listings** across various tech roles
- **1000+ Realistic Candidate Profiles** with skills matching job requirements
- **3 Comprehensive Assessment Examples** for Frontend, Backend, and Product Manager roles

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment Setup Notes

- **No environment variables required** - the app uses Mock Service Worker (MSW) for API simulation
- **No external database setup needed** - uses IndexedDB through Dexie.js
- **HTTPS not required** for local development
- **Cross-origin requests handled** by MSW in both development and production

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎯 Use Cases

### **For Recruiters & HR Teams**
- Manage multiple job openings efficiently
- Track candidates through the hiring pipeline
- Create standardized assessments for different roles
- Collaborate on hiring decisions

### **For Portfolio & Demonstrations**
- Showcase full-stack development skills
- Demonstrate modern React and TypeScript proficiency
- Highlight UX/UI design capabilities
- Show complex state management implementation

### **For Learning & Development**
- Study modern React patterns and best practices
- Learn about data fetching and caching strategies
- Understand complex UI interactions and animations
- Explore TypeScript in a real-world application

## 🏗️ Architecture Overview

### Project Structure

```
talentflow-hiring/
├── public/                    # Static assets
│   ├── mockServiceWorker.js   # MSW service worker
│   └── vite.svg               # Favicon
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Basic UI elements (Modal, FeedbackPopup)
│   │   ├── AppLayout.tsx       # Main application layout
│   │   ├── JobCard.tsx         # Job listing component
│   │   ├── CandidateCard.tsx   # Candidate profile component
│   │   ├── AssessmentCard.tsx  # Assessment display component
│   │   ├── KanbanBoard.tsx     # Drag-and-drop candidate board
│   │   ├── FileUpload.tsx      # File upload component
│   │   └── NoteForm.tsx        # Rich text note editor
│   ├── pages/                 # Main application pages
│   │   ├── Jobs/              # Job management
│   │   │   ├── JobsList.tsx       # Job listings page
│   │   │   └── JobDetails.tsx     # Individual job details & candidate pipeline
│   │   ├── Candidates/        # Candidate management
│   │   │   ├── CandidatesList.tsx # All candidates view
│   │   │   └── CandidateProfilePage.tsx # Individual candidate details
│   │   └── Assessments/       # Assessment system
│   │       ├── AssessmentsPage.tsx   # Assessment management dashboard
│   │       ├── AssessmentBuilder.tsx # Assessment creation/editing
│   │       └── AssessmentPreview.tsx # Assessment preview mode
│   ├── hooks/                 # Custom React hooks
│   │   ├── useJobs.ts          # Job data management
│   │   ├── useCandidates.ts    # Candidate data management
│   │   └── useAssessments.tsx  # Assessment data management
│   ├── services/              # API service layers
│   │   ├── jobsService.ts      # Job-related API calls
│   │   └── candidatesService.ts # Candidate-related API calls
│   ├── api/                   # API configuration
│   │   ├── client.ts           # TanStack Query client setup
│   │   └── msw/                # Mock Service Worker setup
│   │       ├── browser.ts         # MSW browser configuration
│   │       └── handlers.ts        # API route handlers
│   ├── db/                    # Database layer
│   │   ├── dexie.ts            # IndexedDB setup with Dexie
│   │   └── seed.ts             # Database seeding logic
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts            # All type definitions
│   ├── utils/                 # Utility functions
│   │   ├── migrateDatabase.ts  # Database migration tools
│   │   └── resetDatabase.ts    # Database reset functionality
│   ├── App.tsx                # Main App component with routing
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles (Tailwind CSS)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── vercel.json                # Vercel deployment configuration
```

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────┐
│                    React Components                     │
│  (JobsList, CandidatesList, AssessmentBuilder, etc.)  │
└──────────────────────────────────────────────────────┘
                             │
                             │ (React Hooks: useJobs, useCandidates)
                             │
┌──────────────────────────────────────────────────────┐
│                   TanStack Query                       │
│      (Data fetching, caching, synchronization)        │
└──────────────────────────────────────────────────────┘
                             │
                             │ (HTTP requests to /api/*)
                             │
┌──────────────────────────────────────────────────────┐
│               Mock Service Worker (MSW)               │
│          (Intercepts HTTP calls, mocks API)           │
└──────────────────────────────────────────────────────┘
                             │
                             │ (CRUD operations)
                             │
┌──────────────────────────────────────────────────────┐
│               IndexedDB (via Dexie.js)                │
│         (Browser-based local database storage)        │
└──────────────────────────────────────────────────────┘
```

## 🌟 Highlights

### **Data-Driven Design**
- **1000+ Seeded Candidates** with realistic profiles matched to relevant job roles
- **30+ Professional Job Listings** across various tech disciplines
- **Intelligent Candidate-Job Matching** based on skills and experience

### **Assessment Excellence**
- **3 Pre-built Professional Assessments**:
  - Senior Frontend Engineer Technical Assessment
  - Backend Developer System Design Assessment
  - Product Manager Strategic Assessment
- **Multiple Question Types** with real-world examples
- **File Upload Support** for portfolios and code samples

### **Production-Ready Features**
- **Responsive Design** that works on all devices
- **Performance Optimized** with code splitting and lazy loading
- **Error Handling** with graceful fallbacks
- **Accessibility** considerations throughout

## 📝 Technical Decisions

### Frontend Architecture Decisions

#### **React 19 + TypeScript**
- **Decision**: Use React 19 with TypeScript for type safety and modern React features
- **Reasoning**: Provides compile-time error checking, better IDE support, and maintainable code
- **Trade-offs**: Longer build times, learning curve for TypeScript

#### **Vite Build Tool**
- **Decision**: Use Vite instead of Create React App
- **Reasoning**: Significantly faster development builds, native ES modules, better HMR
- **Trade-offs**: Newer ecosystem, some plugins might not be available

#### **Tailwind CSS for Styling**
- **Decision**: Utility-first CSS framework over styled-components
- **Reasoning**: Faster development, consistent design system, smaller bundle size
- **Trade-offs**: HTML can look cluttered with many classes

### State Management Decisions

#### **TanStack Query for Server State**
- **Decision**: Use TanStack Query instead of Redux for data fetching
- **Reasoning**: Built-in caching, background updates, optimistic updates, error handling
- **Trade-offs**: Additional learning curve, overkill for simple apps

#### **React Hook Form for Forms**
- **Decision**: Use React Hook Form over Formik
- **Reasoning**: Better performance (uncontrolled components), smaller bundle size, TypeScript support
- **Trade-offs**: Different mental model from controlled components

### Database Architecture Decisions

#### **Mock Service Worker (MSW) + IndexedDB**
- **Decision**: Use client-side database simulation instead of real backend
- **Reasoning**: No backend setup required, works offline, realistic API simulation
- **Trade-offs**: Limited to single user, data lost on browser reset

#### **Dexie.js for IndexedDB**
- **Decision**: Use Dexie.js wrapper instead of raw IndexedDB
- **Reasoning**: Promise-based API, TypeScript support, query capabilities
- **Trade-offs**: Additional dependency, learning curve

### Component Architecture Decisions

#### **Compound Components Pattern**
- **Decision**: Use compound components for complex UI elements (KanbanBoard, FileUpload)
- **Reasoning**: Better composition, reusability, and API design
- **Trade-offs**: More complex component structure

#### **Custom Hooks for Data Logic**
- **Decision**: Extract data fetching logic into custom hooks
- **Reasoning**: Separation of concerns, testability, reusability
- **Trade-offs**: More abstraction layers

### Deployment Decisions

#### **Vercel for Hosting**
- **Decision**: Use Vercel over Netlify or AWS
- **Reasoning**: Zero-config deployment, excellent developer experience, automatic HTTPS
- **Trade-offs**: Vendor lock-in, pricing at scale

#### **MSW in Production**
- **Decision**: Enable Mock Service Worker in production
- **Reasoning**: No backend required, demonstrates full functionality
- **Trade-offs**: Not suitable for real applications, performance overhead

## ⚠️ Known Issues

### Current Limitations

#### **Data Persistence**
- **Issue**: Data is stored in browser's IndexedDB and gets reset when browser data is cleared
- **Impact**: Users lose all their data when clearing browser cache
- **Workaround**: Application automatically re-seeds data on reload
- **Future Fix**: Implement data export/import functionality

#### **File Upload Simulation**
- **Issue**: File uploads are simulated and don't actually persist files
- **Impact**: Uploaded files are lost on page refresh
- **Workaround**: Files are stored in memory for the current session
- **Future Fix**: Integrate with cloud storage service (AWS S3, Cloudinary)

#### **Mobile Responsiveness**
- **Issue**: Kanban board drag-and-drop is not optimized for mobile touch
- **Impact**: Difficult to move candidates on mobile devices
- **Workaround**: Use desktop/tablet for best experience
- **Future Fix**: Implement touch-friendly drag-and-drop library

#### **Search Performance**
- **Issue**: Client-side search across 1000+ candidates can be slow
- **Impact**: Slight delay when searching through large candidate lists
- **Workaround**: Debounced search with 300ms delay
- **Future Fix**: Implement server-side search with indexing

### Browser Compatibility

#### **Modern Browser Required**
- **Issue**: Application uses modern JavaScript features (ES2020+)
- **Impact**: May not work on very old browsers (IE11, old Safari)
- **Workaround**: Use modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- **Future Fix**: Add polyfills if broader support needed

#### **IndexedDB Support**
- **Issue**: Requires IndexedDB support for data storage
- **Impact**: Won't work in browsers with IndexedDB disabled
- **Workaround**: Enable IndexedDB in browser settings
- **Future Fix**: Fallback to localStorage with reduced functionality

### Development Environment Issues

#### **TypeScript Strict Mode**
- **Issue**: Some unused variables cause build warnings in production
- **Impact**: Warnings in build output but doesn't break functionality
- **Workaround**: Created lenient tsconfig.prod.json for deployment
- **Future Fix**: Clean up all unused imports and variables

#### **MSW Service Worker**
- **Issue**: Service worker needs to be updated when MSW version changes
- **Impact**: API requests may fail after MSW updates
- **Workaround**: Run `npx msw init public` to update service worker
- **Future Fix**: Automate service worker updates in build process

## 🔮 Future Enhancements

### Short-term Improvements
- 📱 **Mobile Optimization**: Touch-friendly drag-and-drop for mobile devices
- 🔍 **Advanced Search**: Filters, sorting, and search across multiple fields
- 📥 **Data Export**: Export candidates and assessments as CSV/PDF
- 📄 **Assessment Templates**: Pre-built templates for common roles

### Medium-term Features
- 📧 **Email Integration**: Notifications for candidate status changes
- 📈 **Analytics Dashboard**: Hiring metrics, time-to-hire, conversion rates
- 👥 **Team Collaboration**: Multiple users, role-based permissions
- 🔐 **Authentication System**: User accounts, secure access

### Long-term Vision
- 🤖 **AI-Powered Matching**: Automatic candidate-job matching using ML
- 📱 **Native Mobile App**: React Native application for mobile hiring
- 🔗 **API Integrations**: Connect with ATS systems, job boards, email providers
- 🌐 **Multi-language Support**: Internationalization for global hiring teams

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Tanmay Kumar**
- 📧 Email: [tanmay982004@gmail.com](mailto:tanmay982004@gmail.com)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/tanmay-kumar)
- 🐱 GitHub: [@tanmay982004](https://github.com/tanmay982004)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vercel for seamless deployment
- TanStack for excellent data fetching tools
- Tailwind CSS for the utility-first approach
- The open-source community for inspiration

---

⭐ **Star this repository if you found it helpful!** ⭐

*Built with ❤️ by Tanmay Kumar*
