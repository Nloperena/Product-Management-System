# Forza Products Frontend

A modern React + TypeScript frontend for the Forza Products database, built with Vite and Tailwind CSS.

## Features

- 🏠 **Dashboard**: Overview of all products with statistics and quick access
- 🔍 **Smart Search**: Global search across all product fields with real-time filtering
- 📱 **Responsive Design**: Mobile-first approach with touch-friendly interface
- 🎨 **Modern UI**: Clean, professional design with Tailwind CSS
- ⚡ **Fast Performance**: Optimized with Vite and React Query for caching
- 🔧 **Type Safety**: Full TypeScript support for better development experience

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state management
- **Lucide React** for icons
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Flask backend running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173` (or the port shown in terminal)

### Backend Integration

The frontend connects to the Flask backend via proxy configuration. Make sure the Flask app is running on `http://localhost:5000`.

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, etc.)
│   ├── product/         # Product-related components
│   └── filters/         # Filter and search components
├── pages/               # Main pages (Dashboard, etc.)
├── services/            # API services
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Development

- [ ] Product detail pages
- [ ] Product comparison tool
- [ ] Advanced search with autocomplete
- [ ] Export functionality
- [ ] Analytics dashboard
- [ ] PWA capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private - Forza Built Products