# Retro macOS Portfolio 

A unique, retro-styled portfolio inspired by the classic macOS interface and pixel-art aesthetics. This project features a simulated boot sequence through a CRT monitor and transitions into a fully interactive desktop environment.

## ✨ Features

- **Boot Sequence**: Simulated Mac Terminal CLI booting process.
- **Loading Bar**: A 5-second loading animation in the terminal theme.
- **CRT Monitor Effect**: Authentic screen curvature, scanlines, flickering, and bezel design.
- **Desktop Environment**: 
  - **Top Menu Bar**: With system clock and Apple menu.
  - **Interactive Icons**: Classic icons like "This PC", "Resume", and "Research".
  - **Window System**: Draggable and closable windows for content display.
  - **Interactive Dock**: macOS-style bottom dock with hover magnification.
- **Responsive Design**: Adapts to various screen sizes while maintaining the monitor aspect ratio.

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla CSS3 (Modern features like backdrop-filter, animations, and custom properties).
- **Logic**: TypeScript (Type-safe DOM manipulation and window management).
- **Build Tool**: Vite (Fast development and bundling).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (or navigate to the project folder):
   ```bash
   cd portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in your browser**:
   Navigate to `http://localhost:5173/` to view the boot sequence.

## 📂 Project Structure

- `index.html`: Main entry point and structural layout.
- `src/main.ts`: TypeScript logic for the boot sequence, clock, and window system.
- `src/style.css`: Comprehensive styling for the monitor, terminal, and desktop.
- `img/`: Contains retro icons and reference images used in the project.

## 📝 Customization

- To update the content in the windows, modify the `createWindow` calls in `src/main.ts`.
- To change the boot messages, edit the `bootMessages` array in `src/main.ts`.

---
Built with ❤️ by Antigravity
