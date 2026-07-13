# Mesjid-Digital 🕌

Comprehensive digital platform for modern mosques - Built with React, TypeScript, and Vite.

A progressive web and mobile application designed to help mosques manage operations, engage community members, and provide essential information in one unified platform.

## 🚀 Tech Stack

- **React** 19.2.6 - UI Library
- **TypeScript** 6.0.2 - Type Safety
- **Vite** 8.0.12 - Lightning-fast build tool
- **Capacitor** 8.4.0 - Cross-platform (Android/iOS support)
- **Lucide React** - Beautiful icon library
- **jsPDF** - PDF generation
- **Canvas Confetti** - Celebration animations
- **ESLint** - Code quality

## 📋 Features

- 📱 **Multi-platform Support** - Web, Android, and iOS via Capacitor
- 📅 **Prayer Schedules** - Manage and display prayer times
- 📢 **Announcements & News** - Community information sharing
- 🎉 **Event Management** - Create and promote mosque events
- 📄 **Document Generation** - Export reports to PDF
- ✨ **Modern UI** - Responsive and accessible design
- ⚡ **Fast Performance** - Optimized with Vite

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For Android development: Android SDK, Android Studio
- For iOS development: Xcode (macOS only)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rasyiqi-code/Mesjid-Digital.git
   cd Mesjid-Digital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 🔨 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 📱 Mobile Development

### Android
```bash
# Add Android platform
npx cap add android

# Build and sync
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

### iOS
```bash
# Add iOS platform
npx cap add ios

# Build and sync
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## 📁 Project Structure

```
Mesjid-Digital/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── styles/           # CSS stylesheets
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── dist/                 # Production build output
├── android/              # Android project (Capacitor)
├── ios/                  # iOS project (Capacitor)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── eslint.config.js      # ESLint rules
└── README.md            # This file
```

## 🔒 Code Quality

The project uses ESLint for code quality checks. Run the linter with:

```bash
npm run lint
```

To fix automatically fixable issues:

```bash
npm run lint -- --fix
```

## 📚 Dependencies Overview

### Production
- **react & react-dom** - Core UI framework
- **lucide-react** - Icon library with 400+ icons
- **jspdf** - PDF document generation
- **canvas-confetti** - Celebration effects
- **@capacitor/core** - Cross-platform runtime

### Development
- **typescript** - Language support
- **vite** - Build tool
- **eslint** - Code linting
- **@types/\*** - TypeScript definitions

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code passes the linter:
```bash
npm run lint -- --fix
```

## 📄 License

This project is currently without a specified license. See the repository for more information.

## 🆘 Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/rasyiqi-code/Mesjid-Digital/issues).

## 👨‍💻 Author

**RASYIQI** - [@rasyiqi-code](https://github.com/rasyiqi-code)

---

**Mesjid-Digital** - Empowering Modern Mosques with Digital Solutions 🌟
