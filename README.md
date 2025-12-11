# 🎯 MeetingAI - Intelligent Meeting Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.86.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Transform your meeting recordings into actionable insights with AI-powered transcription, smart summaries, and intelligent analysis.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

**MeetingAI** is a modern, full-stack web application designed to revolutionize how teams handle meeting recordings. Upload audio or video files, and let our AI-powered system automatically transcribe, summarize, and extract key insights including action items, participants, and critical decision points.

### 🌟 Why MeetingAI?

- **Save Time**: Automated transcription eliminates manual note-taking
- **Never Miss Details**: AI extracts key points and action items automatically
- **Interactive Intelligence**: Chat with AI about your meetings
- **Secure & Private**: Enterprise-grade security with Supabase
- **Beautiful UI**: Modern, responsive design with smooth animations

---

## 🚀 Key Features

### 🎙️ Core Functionality

- **🎵 Audio/Video Upload**: Support for multiple formats with drag-and-drop interface
- **✍️ AI Transcription**: Powered by Google Gemini 2.0 Flash for accurate speech-to-text
- **📊 Smart Summaries**: Automatic generation of executive summaries
- **✅ Action Items**: Extract and track tasks with automatic identification
- **👥 Participant Detection**: Identify meeting attendees from transcripts
- **💬 AI Chat**: Interactive Q&A about your meetings
- **📈 Dashboard Analytics**: Track meetings, completion rates, and statistics

### 🔐 Authentication & User Management

- **Email/Password Authentication**: Secure login with Supabase Auth
- **Email Verification**: OTP-based email confirmation (60-second expiry)
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent authentication with Redux
- **Profile Management**: User profiles with avatar upload
- **Password Reset**: Secure password change functionality

### 📱 User Interface

- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Dark/Light Mode**: (Coming soon)
- **Toast Notifications**: Real-time feedback with react-hot-toast
- **Loading States**: Smooth transitions and skeleton loaders
- **Form Validation**: Comprehensive validation with Zod schemas
- **Accessible**: WCAG 2.1 compliant components

### 📂 Meeting Management

- **Meeting History**: View all past meetings with search and filters
- **Meeting Details**: Comprehensive view with transcripts, summaries, and insights
- **Status Tracking**: Monitor processing status (pending, processing, completed, failed)
- **Delete Functionality**: Secure meeting deletion with confirmation
- **Export Options**: (Coming soon) Download transcripts and summaries

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **Tailwind CSS** | 4.0 | Utility-first CSS framework |
| **Redux Toolkit** | 2.11.0 | State management |
| **React Hook Form** | 7.68.0 | Form handling |
| **Zod** | 4.1.13 | Schema validation |
| **Lucide React** | 0.555.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Notifications |

### Backend & Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.86.0 | Backend-as-a-Service (Auth, DB, Storage) |
| **PostgreSQL** | - | Primary database (via Supabase) |
| **Edge Functions** | - | Serverless functions (Deno runtime) |
| **Google Gemini** | 2.0-flash | AI transcription & analysis |

### Development Tools

- **ESLint** | 9.0 | Code linting
- **Babel React Compiler** | 1.0.0 | React optimization
- **PostCSS** | 4.0 | CSS processing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js)                       │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────────────┐ │
│  │  Auth UI   │  │Dashboard │  │  Meeting Management    │ │
│  └────────────┘  └──────────┘  └─────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                        │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │    Auth    │  │PostgreSQL│  │  Storage │  │   Edge   │ │
│  │            │  │          │  │          │  │Functions │ │
│  └────────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API                         │
│         (Transcription & Analysis Engine)                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Upload**: User uploads audio/video → Supabase Storage
2. **Process**: Edge Function triggers → Downloads file → Sends to Gemini
3. **Transcribe**: Gemini processes file → Returns transcription
4. **Analyze**: Gemini analyzes transcript → Extracts summary, key points, action items
5. **Store**: Results saved to PostgreSQL
6. **Display**: Real-time updates to UI via Supabase subscriptions

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17.0 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**
- **Supabase Account** ([Sign up here](https://supabase.com))
- **Google AI Studio Account** ([Get API key](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder.git
cd meeting-recorder
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

1. **Create environment file**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Supabase Project Setup**

- Create a new project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key from **Settings** → **API**
- Add them to `.env.local`

3. **Configure Supabase Edge Function**

Navigate to **Edge Functions** in your Supabase dashboard and add the following environment variable:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Database Setup

#### 1. Create Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_name TEXT NOT NULL,
  video_title TEXT,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT CHECK (file_type IN ('audio', 'video')),
  duration INTEGER,
  transcript TEXT,
  summary TEXT,
  key_points JSONB,
  action_items JSONB,
  participants JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);
CREATE INDEX idx_profiles_email ON profiles(email);
```

#### 2. Set up Storage Buckets

In **Storage** section of Supabase dashboard:

**Bucket 1: ai_meetings** (for meeting recordings)
1. Create a new bucket named `ai_meetings`
2. Set bucket to **Public** (or configure RLS policies as needed)
3. Configure allowed MIME types: `audio/*`, `video/*`

**Bucket 2: avatars** (for profile pictures)
1. Create a new bucket named `avatars`
2. Set bucket to **Public**
3. Configure allowed MIME types: `image/*`
4. Add RLS policy:
```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### 3. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Meetings policies
CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. Configure Email Authentication

Follow instructions in `SUPABASE_OTP_CONFIG.md` to enable:
- Email confirmation
- OTP verification (60-second expiry)
- Custom email templates

### Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy edge function
supabase functions deploy generate-transcription

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💻 Usage

### 1. Sign Up / Login

- Navigate to `/auth/signup` to create an account
- Verify your email with the OTP code sent to your inbox
- Login at `/auth/login`

### 2. Upload a Meeting

1. Go to **Upload** page
2. Drag & drop or select an audio/video file
3. Add meeting details (name, description)
4. Click **Upload** - file is automatically processed

### 3. View Meetings

- **Dashboard**: Overview with statistics and recent meetings
- **History**: All meetings with search/filter capabilities
- **Meeting Details**: Click any meeting to view:
  - Full transcript
  - AI-generated summary
  - Key points
  - Action items
  - Participants
  - Interactive AI chat

### 4. Chat with AI

In the meeting details page:
1. Type your question in the chat input
2. AI responds based on the meeting transcript
3. Ask follow-up questions for deeper insights

---

## 📁 Project Structure

```
meeting-recorder/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (routes)/              # Route groups
│   │   │   ├── dashboard/         # Dashboard page
│   │   │   └── details/[id]/      # Meeting details (dynamic)
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── verify/
│   │   ├── pages/                 # Page components
│   │   │   ├── dashboard/         # Dashboard components
│   │   │   ├── history/           # History components
│   │   │   ├── home/              # Landing page components
│   │   │   ├── profile/           # Profile components
│   │   │   └── upload/            # Upload components
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home page
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable components
│   │   ├── auth/                  # Auth components
│   │   ├── layout/                # Layout components (Navbar, Footer)
│   │   └── ui/                    # UI components (FormInput, etc.)
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuthPersist.js
│   ├── lib/                       # Utilities & configs
│   │   ├── supabaseClient.js      # Supabase client
│   │   └── validationSchemas.js   # Zod schemas
│   ├── providers/                 # Context providers
│   │   ├── AuthInitializer.js     # Auth state initialization
│   │   └── ReduxProvider.js       # Redux store provider
│   ├── services/                  # API & service layers
│   │   ├── api/                   # API services
│   │   │   ├── meetingService.js
│   │   │   └── transcriptionService.js
│   │   └── storage/               # Storage services
│   │       └── fileUploadService.js
│   └── store/                     # Redux store
│       ├── authSlice.js           # Auth state management
│       └── store.js               # Store configuration
├── supabase/
│   ├── functions/                 # Edge Functions
│   │   └── generate-transcription/
│   │       ├── index.ts           # Main function
│   │       └── deno.json          # Deno config
│   └── config.toml                # Supabase config
├── public/                        # Static assets
│   ├── icons/
│   └── images/
├── .env.local                     # Environment variables (create this)
├── next.config.mjs                # Next.js config
├── tailwind.config.js             # Tailwind config
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 📡 API Documentation

### Edge Function: `generate-transcription`

**Endpoint**: `POST /functions/v1/generate-transcription`

**Purpose**: Process uploaded meeting files and generate transcripts with AI analysis

**Request Body**:
```json
{
  "filePath": "2024-12-09/username/audio/meeting.mp3",
  "fileType": "audio",
  "fileName": "meeting.mp3",
  "userId": "uuid",
  "meetingId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "meetingId": "uuid",
  "transcription": "Full meeting transcript...",
  "summary": "Executive summary...",
  "keyPoints": ["Point 1", "Point 2", ...],
  "actionItems": ["Task 1", "Task 2", ...],
  "participants": [
    { "name": "John Doe", "email": "john@example.com" }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing fields)
- `500`: Server error

### Service APIs

#### Meeting Service (`meetingService.js`)

```javascript
// Create a new meeting record
createMeeting(meetingData)

// Get all meetings for a user
getMeetingsByUserId(userId)

// Get single meeting by ID
getMeetingById(meetingId)

// Update meeting
updateMeeting(meetingId, updates)

// Delete meeting
deleteMeeting(meetingId)
```

#### File Upload Service (`fileUploadService.js`)

```javascript
// Upload file to Supabase Storage
uploadFileToStorage(file, userName, date, fileType)

// Get user's uploaded files
getUserFiles(userName, date, fileType)

// Delete file from storage
deleteFileFromStorage(filePath)
```

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy

3. **Configure Custom Domain** (Optional)

- Add your domain in Vercel dashboard
- Update DNS settings as instructed

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

In Supabase Edge Functions dashboard, set:
```env
GEMINI_API_KEY=your-production-gemini-key
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Style

- Follow existing code formatting
- Use meaningful variable/function names
- Add comments for complex logic
- Write unit tests for new features

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build/config changes

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Email OTP not received

**Solution**: Check `SUPABASE_OTP_CONFIG.md` for complete setup instructions. Ensure:
- Email confirmation is enabled in Supabase Auth settings
- SMTP is configured or using Supabase's default email service
- Check spam folder

#### Issue: Transcription fails

**Troubleshooting**:
1. Verify `GEMINI_API_KEY` is set in Edge Functions
2. Check Edge Function logs in Supabase dashboard
3. Ensure file format is supported (audio/video)
4. Verify file is accessible in Storage bucket

#### Issue: Authentication not persisting

**Solution**:
- Check browser console for errors
- Clear localStorage and cookies
- Verify `AuthInitializer` is properly wrapping your app
- Check Supabase Auth settings

#### Issue: Build errors

**Common fixes**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Debug Mode

Enable detailed logging:

```javascript
// In your .env.local
NEXT_PUBLIC_DEBUG=true
```

### Getting Help

- Check [existing issues](https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder/issues)
- Review [Supabase documentation](https://supabase.com/docs)
- Check [Next.js documentation](https://nextjs.org/docs)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for excellent backend infrastructure
- **Vercel** for Next.js and hosting platform
- **Tailwind CSS** for utility-first CSS framework
- All open-source contributors

---

## 📧 Contact

**Muhammad Abdullah**

- GitHub: [@Muhammad-Abdullah983](https://github.com/Muhammad-Abdullah983)
- Project Link: [https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder](https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder)

---

## 🗺️ Roadmap

### Current Version (v0.1.0)

- ✅ User authentication with email verification
- ✅ Audio/video file upload
- ✅ AI transcription with Gemini
- ✅ Smart summaries and insights extraction
- ✅ Meeting dashboard and history
- ✅ Interactive AI chat
- ✅ Responsive design

### Upcoming Features (v0.2.0)

- [ ] Real-time collaboration
- [ ] Meeting scheduling integration
- [ ] Export to PDF/DOCX
- [ ] Advanced search and filters
- [ ] Meeting templates
- [ ] Team workspaces
- [ ] Calendar integration (Google/Outlook)
- [ ] Mobile app (React Native)

### Future Enhancements (v1.0.0)

- [ ] Live transcription during meetings
- [ ] Multi-language support
- [ ] Custom AI training
- [ ] Analytics dashboard
- [ ] API for third-party integrations
- [ ] Enterprise SSO
- [ ] Advanced permissions and roles

---

<div align="center">

**Made with ❤️ by Muhammad Abdullah**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder/issues) · [Request Feature](https://github.com/Muhammad-Abdullah983/AI-Meating-Recorder/issues)

</div>
