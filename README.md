# Mesjid-Digital 🕌

A comprehensive digital platform designed for modern mosques to streamline operations, enhance community engagement, and manage religious activities efficiently.

## Overview

Mesjid-Digital is a full-featured mosque management system that combines prayer schedules, community announcements, event management, and administrative tools in one unified platform. Built with modern web technologies, it provides a seamless experience for both administrators and community members.

## Features

- 📅 **Prayer Schedule Management** - Automatic prayer time calculations and schedule management
- 📢 **Community Announcements** - Post and manage mosque announcements and news
- 🎉 **Event Management** - Create, schedule, and promote mosque events
- 👥 **Member Management** - Manage mosque community members and their information
- 📊 **Dashboard & Analytics** - Track attendance and community engagement
- 🔐 **Secure Authentication** - Role-based access control for different user types
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌍 **Multi-language Support** - Support for multiple languages

## Tech Stack

- **Frontend**: TypeScript (84.5%), React, Vite
- **Styling**: CSS (9.1%), modern responsive design
- **Build Tool**: Vite with HMR (Hot Module Replacement)
- **Tooling**: JavaScript (5.9%), ESLint for code quality
- **Package Manager**: npm/yarn

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rasyiqi-code/Mesjid-Digital.git
   cd Mesjid-Digital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
Mesjid-Digital/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── styles/         # CSS styles
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── App.tsx         # Main app component
├── public/             # Static assets
├─��� package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md          # This file
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint checks

## Development

### ESLint Configuration

For production applications, we recommend enabling type-aware lint rules. Refer to the project's ESLint configuration in `eslint.config.js` for more details.

### React Compiler

The React Compiler is not enabled by default due to its impact on build performance. To enable it, see the [React Compiler documentation](https://react.dev/learn/react-compiler/installation).

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/rasyiqi-code/Mesjid-Digital/issues).

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Vite](https://vite.dev)
- TypeScript for type safety
- Community contributions and feedback

---

**Mesjid-Digital** - Empowering Modern Mosques with Digital Solutions 🌟
