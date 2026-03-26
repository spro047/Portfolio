# Retro macOS Portfolio 

A unique, retro-styled portfolio inspired by the classic macOS interface and pixel-art aesthetics. This project features a simulated boot sequence through a CRT monitor and transitions into a fully interactive desktop environment.

## Description

This portfolio application serves as an interactive showcase of personal projects and skills, wrapped in a nostalgic 90s-era Apple Macintosh GUI. Users are greeted with a mock terminal boot sequence that opens into a fully functional desktop environment complete with draggable windows, a bottom icon dock, and a functional top menu bar.

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

## How to Use and Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spro047/Portfolio.git
   cd Portfolio
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

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla CSS3 (Modern features like backdrop-filter, animations, and custom properties).
- **Logic**: TypeScript (Type-safe DOM manipulation and window management).
- **Build Tool**: Vite (Fast development and bundling).

## 📂 Project Structure

- `index.html`: Main entry point and structural layout.
- `src/main.ts`: TypeScript logic for the boot sequence, clock, and window system.
- `src/style.css`: Comprehensive styling for the monitor, terminal, and desktop.
- `img/`: Contains retro icons and reference images used in the project.

## Challenges Faced

Building a highly interactive, retro UI from scratch presented several technical hurdles:

1. **Authentic CRT Simulation**: Recreating the distinct look of a 90s CRT monitor using purely CSS was challenging. It required combining multiple CSS techniques: repeating linear gradients for scanlines, text-shadows for a bloomed phosphorescent glow, border-radius mimicking curved glass, and keyframe animations for localized screen flicker.
2. **Window Management System**: Implementing a draggable window system (`Draggable` mechanics) in vanilla TypeScript without a heavy UI library. Managing the z-index stacking order so the active window is always on top, and calculating bounding boxes so users couldn't drag windows off-screen, required precise DOM coordinate math.
3. **Mac-style Dock Magnification**: The iconic macOS dock hover animation (where adjacent icons scale up smoothly) necessitated complex CSS transitions and JavaScript mouse-proximity calculations to perfectly simulate the fluid physics.
4. **Boot Sequence Timing**: Orchestrating the timing of the faux terminal boot sequence and the transition into the desktop UI, ensuring it feels organic but isn't overly long or repetitive for returning users.
