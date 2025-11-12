# DocAI Frontend Architecture Documentation

## Overview

The DocAI frontend is a React-based application built with modern web technologies, featuring a sophisticated chat interface for document analysis powered by AI. The application uses a multi-agent RAG (Retrieval-Augmented Generation) system with offline-first architecture.

## Technology Stack

- **Framework**: React 18 with Next.js-like routing (React Router)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React hooks with custom events for cross-component communication
- **Build Tool**: Vite (inferred from project structure)

## Core Architecture

### Page Structure

The application follows a page-based routing structure with the following main pages:

#### 1. Chat Page (`app/chat/page.jsx`)

**Purpose**: Main chat interface for document interaction
**Key Features**:

- Document selection via URL parameters
- Real-time chat with AI responses
- Source panel showing referenced content
- Confidence badges for answer verification
- Multi-language support with auto-detection

**Background**: Uses `PlexusBackground` - an animated canvas with interactive nodes that respond to mouse movement

#### 2. Upload Page (`app/upload/page.jsx`)

**Purpose**: Document upload interface
**Key Features**:

- File upload with drag-and-drop
- Processing status tracking
- Confetti animation on successful upload
- Two-stage UI (upload → processing → success)

**Background**: Uses `PlexusBackground` for consistent visual experience

#### 3. Settings Page (`app/settings/page.jsx`)

**Purpose**: Application configuration
**Key Features**:

- Settings modal integration
- Feature preview cards
- Clean, card-based layout

**Background**: Uses default gradient background (no special background component)

#### 4. About Page (`app/about/page.jsx`)

**Purpose**: Application information and showcase
**Key Features**:

- Hero section with company mission
- AI agents showcase
- Technology timeline
- Custom animated backgrounds per section

**Background**: Uses default gradient background with custom section-specific backgrounds

## Background System

### PlexusBackground Component (`components/ui/PlexusBackground.jsx`)

**Purpose**: Creates an interactive animated background with connected nodes

**Implementation Details**:

- **Canvas-based**: Uses HTML5 Canvas for high-performance animations
- **Node System**: Grid-based node placement with 80px spacing
- **Animation Features**:
  - Pulsating nodes with sine wave animation
  - Gentle drifting motion with velocity vectors
  - Mouse-responsive connections (draws lines to nearest 7 nodes within 200px)
  - Dark/light mode color adaptation
- **Performance**: Uses `requestAnimationFrame` for smooth 60fps animation
- **Responsive**: Automatically resizes on window resize

**Color Scheme**:

- Light mode: `rgba(124, 110, 224, 0.4)` (soft purple)
- Dark mode: `rgba(151, 135, 243, 0.6)` (brighter purple)

**Usage**: Currently used in chat and upload pages for immersive experience

### GridBackground Component (`components/ui/GridBackground.jsx`)

**Purpose**: Static grid pattern background with aurora effects in dark mode

**Implementation Details**:

- **Light Mode**: Radial gradient dots (24px spacing) with primary color
- **Dark Mode**: Aurora glow effect + grid lines (48px spacing)
- **CSS-only**: No JavaScript animation, pure CSS backgrounds
- **Performance**: Lightweight, no runtime overhead

**Usage**: Currently unused but available as alternative

## Chat System Architecture

### Core Components

#### ChatContainer (`components/chat/chat-container.jsx`)

**Purpose**: Main chat interface managing message flow and AI interactions

**Key Features**:

- Message history management
- Rule-based response system for common queries
- API integration with backend RAG system
- Typing indicators
- Source panel integration via custom events

**Event System**:

- Listens for `chat-send` events from ChatInput
- Dispatches `update-sources` events to SourcePanel
- Uses `show-toast` events for notifications

**Rule-based Responses**:

- Greeting detection ("hey", "hello", "hi")
- Application identity queries ("what is noetic vault")
- Returns predefined responses with source citations

#### ChatInput (`components/chat/chat-input.jsx`)

**Purpose**: Multi-functional input component with advanced features

**Features**:

- Auto-resizing textarea
- Voice recording simulation
- Multi-language support with auto-detection
- Easter egg system (":about" command)
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

**Language Support**:

- Auto-detection toggle
- Manual language selection (English, Hindi, Marathi)
- Language codes passed to backend API

**Event Dispatch**: Sends `chat-send` events with text, documentId, and language parameters

#### SourcePanel (`components/chat/source-panel.jsx`)

**Purpose**: Displays referenced document sources for AI responses

**Features**:

- Multiple source format support:
  - Aggregated sources (fileName + pages)
  - Internal knowledge base sources
  - Regular sources with snippets and relevance scores
- Expandable source details
- Auto-scroll to new sources
- Empty state handling

**Event Integration**: Listens for `update-sources` events from ChatContainer

#### VerifiedAnswerCard (`components/chat/verified-answer-card.jsx`)

**Purpose**: Displays AI responses with confidence indicators and actions

**Features**:

- Confidence badge system (high/medium/low)
- Copy to clipboard functionality
- Feedback buttons (thumbs up/down)
- Verification details display
- Timestamp display

**Confidence System**: Visual badges with tooltips explaining confidence levels

### Supporting Components

#### CitationConfidenceBadge (`components/chat/citation-confidence-badge.jsx`)

**Purpose**: Visual indicator of answer reliability

**Confidence Levels**:

- **High**: Green checkmark - verified by multiple sources
- **Medium**: Orange minus - supported but uncertain
- **Low**: Red warning - limited verification

**Features**:

- Animated tooltips with detailed explanations
- Hover effects with scale animation
- Dark/light mode support

#### TypingIndicator (`components/chat/typing-indicator.jsx`)

**Purpose**: Shows AI is processing/generating response

**Animation**: Three dots with staggered opacity and scale animations using Framer Motion

#### PromptTemplates (`components/chat/prompt-templates.jsx`)

**Purpose**: Quick action buttons for common document analysis tasks

**Default Templates**:

- Summarize
- Extract Key Points
- Find Obligations
- Risk Analysis

**Features**:

- Custom template creation
- Template deletion
- Persistent storage (local state)

#### FollowUpChips (`components/chat/follow-up-chips.jsx`)

**Purpose**: Suggested follow-up questions

**Features**:

- Dynamic chip generation
- Click-to-fill input functionality
- Responsive layout

### Additional Chat Components

#### AnswerBubble (`components/chat/answer-bubble.jsx`)

Legacy component for answer display (less used)

#### SourceSnippet (`components/chat/source-snippet.jsx`)

Detailed source display with text highlighting

#### FeedbackWidget (`components/chat/feedback-widget.jsx`)

User feedback collection for response quality

## Navigation System

### Navigation Component (`components/shared/navigation.jsx`)

**Features**:

- Responsive design (mobile hamburger menu)
- Active route highlighting with animated indicator
- Command menu integration (⌘K)
- Dark mode toggle
- Frosted glass effect with backdrop blur

**Routes**:

- Home (/)
- Upload (/upload)
- Chat (/chat)
- About (/about)
- Settings (/settings)

## Landing/About Components

### Hero Component (`components/landing/hero.jsx`)

**Features**:

- Mouse-responsive parallax effects
- Origami-inspired background pattern
- Feature showcase cards
- CTA buttons with hover animations

### AboutHero (`components/about/about-hero.jsx`)

**Features**:

- Animated mesh background with floating particles
- Company values showcase
- Scroll-triggered animations

## Styling System

### Design System

**Color Palette** (CSS Variables):

- Primary: `hsl(250 70% 65%)` (Purple)
- Background: Light/dark adaptive
- Accent: `hsl(270 80% 70%)` (Magenta)
- Destructive: Standard red

**Typography**:

- Font families: Inter + Poppins
- Display font: Poppins (headings)
- Body font: Inter

**Component Patterns**:

- `bento-card`: Rounded cards with backdrop blur
- `bento-panel`: Larger panels
- `section-title/subtitle`: Consistent heading styles

### Responsive Design

- Mobile-first approach
- Breakpoints: sm/md/lg/xl
- Grid layouts with responsive columns
- Touch-friendly interactions

## Event System

The application uses a custom event system for cross-component communication:

- `chat-send`: Trigger chat message sending
- `update-sources`: Update source panel with new sources
- `show-toast`: Display toast notifications
- `document-selected`: Handle document selection
- `trigger-easter-egg`: Special hidden features

## Performance Optimizations

- Canvas-based animations for smooth performance
- Lazy loading of components
- Efficient re-renders with React.memo where appropriate
- CSS-only animations where possible
- Optimized bundle size with tree shaking

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast compliance

## Future Enhancements

Based on the codebase structure, potential improvements:

1. **Background System**: Add more background variants (GridBackground integration)
2. **Animation System**: More sophisticated entrance animations
3. **Component Library**: Extract reusable UI components
4. **State Management**: Consider Zustand or Redux for complex state
5. **Testing**: Add comprehensive component tests
6. **Performance**: Implement virtual scrolling for large chat histories

## File Structure Summary

```
docai-frontend/
├── app/                          # Page components
│   ├── chat/page.jsx            # Main chat interface
│   ├── upload/page.jsx          # Document upload
│   ├── settings/page.jsx        # Settings page
│   └── about/page.jsx           # About page
├── components/
│   ├── chat/                    # Chat-related components
│   │   ├── chat-container.jsx
│   │   ├── chat-input.jsx
│   │   ├── source-panel.jsx
│   │   └── ...
│   ├── ui/                      # UI primitives
│   │   ├── PlexusBackground.jsx
│   │   └── GridBackground.jsx
│   ├── shared/                  # Shared components
│   │   └── navigation.jsx
│   └── landing/                 # Landing page components
│       └── hero.jsx
├── lib/                         # Utilities
│   └── api.js                   # API client
└── globals.css                  # Global styles
```

This documentation provides a comprehensive overview of the DocAI frontend architecture, focusing on component interactions, background systems, and implementation details.
