# DocAI Frontend

[![DocAI V1](https://img.shields.io/badge/DocAI-V1.2-blueviolet)](https://github.com/your-username/docai-frontend)
[![Lavender Theme](https://img.shields.io/badge/Theme-Lavender-purple)](https://github.com/your-username/docai-frontend)
[![Offline-Ready](https://img.shields.io/badge/Offline-Ready-green)](https://github.com/your-username/docai-frontend)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)

A modular React + Vite + Tailwind CSS frontend for DocAI — an offline, multi-agent RAG pipeline system that extracts verified answers from uploaded PDFs.

## 📋 Project Overview

DocAI is a privacy-first application that allows users to chat with their documents without compromising sensitive information. All processing happens locally on the user's device, ensuring complete data privacy and security.

### Key Features

- **Offline-First Architecture**: No data leaves your device
- **Multi-Agent RAG Pipeline**: Advanced AI processing for accurate answers
- **Privacy-Focused**: Zero data collection or external processing
- **Responsive Design**: Works on all device sizes
- **Dark/Light Mode**: Lavender-themed UI with automatic system preference detection

## 🧰 Tech Stack

- [React 18](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Router DOM](https://reactrouter.com/) - Declarative routing for React
- [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library for React
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 📁 Folder Structure

```
docai-frontend/
├── app/                    # Page components
│   ├── about/              # About page
│   ├── chat/               # Chat interface
│   ├── settings/           # Settings panel
│   ├── upload/             # Document upload
│   ├── page.jsx            # Home page
│   ├── layout.jsx          # Root layout (Next.js style)
│   └── globals.css         # Global CSS styles
├── components/             # Reusable UI components
│   ├── about/              # About section components
│   ├── agents/             # Agent visualization components
│   ├── chat/               # Chat interface components
│   ├── empty-states/        # Empty state components
│   ├── landing/            # Landing page components
│   ├── metadata/           # Document metadata components
│   ├── settings/           # Settings components
│   ├── shared/             # Shared components
│   ├── upload/             # Upload components
│   └── widgets/            # Widget components
├── context/                # React context providers
│   └── ThemeContext.jsx    # Theme management
├── src/                    # Main application files
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Project dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.cjs     # PostCSS configuration
```

## ▶️ How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/your-username/docai-frontend.git
cd docai-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ How to Build for Production

To create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The build output will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## 🛠️ Extending and Contributing

### Adding New Components

1. Create a new component file in the appropriate subdirectory under `components/`
2. Follow the existing naming conventions and component structure
3. Use Tailwind CSS classes for styling
4. Import and export the component in the relevant index files

### Adding New Pages

1. Create a new page component in the `app/` directory
2. Add the route to `src/App.jsx` in the React Router configuration
3. Update the navigation in `components/shared/navigation.jsx` if needed

### Customizing the Theme

The application uses a lavender color palette defined in `tailwind.config.js`. You can customize colors, spacing, and other design tokens by modifying this file.

### Working with the Backend

The frontend is configured to proxy API requests to `http://127.0.0.1:8000` in development. Update the proxy settings in `vite.config.js` if your backend runs on a different port.

## 🎨 Design System

- **Color Palette**: Lavender-based with dark mode support
- **Typography**: Inter font family
- **Components**: Reusable, accessible components with proper ARIA attributes
- **Animations**: Smooth transitions using Framer Motion

## 🔐 Privacy & Security

DocAI is designed with privacy as a core principle:
- All processing happens locally on the user's device
- No data is sent to external servers
- No tracking or analytics
- Clear visual indicators for offline status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Vite](https://vitejs.dev/) for the amazing development experience
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React](https://reactjs.org/) for the UI library
- Contributor https://github.com/sezal20 for her invaluable contributions
