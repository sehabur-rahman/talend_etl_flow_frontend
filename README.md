# Talend Data Flow Visualizer

A React application to visualize Talend data flow pipelines as an interactive DAG (Directed Acyclic Graph).

## Features

- Interactive DAG visualization of hierarchical data structures
- Color-coded nodes by type (Plan, Task, Job)
- Expandable/collapsible nodes
- Node selection with detailed information panel
- Modern, responsive UI design

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/Node.jsx` - Node component for rendering DAG nodes
- `src/App.css` - Main application styles
- `src/components/Node.css` - Node component styles
- `data.json` - Data flow configuration

## Data Structure

The application expects a JSON array with the following structure:
- **Plan**: Top-level pipeline
- **Task**: Child of plan, represents a data extraction task
- **Job**: Child of task, represents a transformation job

