# CareStyles™ Patient Segment Identification App

A web application that identifies patient segments based on the CareStyles™ Patient Segment Identification Algorithm. This app uses Fisher's linear discriminant functions to classify patients into one of four segments with 85.3% accuracy.

## Features

- Interactive form to collect responses to 6 health-related questions
- Real-time segment identification using the proprietary algorithm
- Visual display of segment scores and predicted segment
- Modern, responsive UI design

## Patient Segments

1. **Proactive Skeptic** - Patients who are proactive about their health but may be skeptical of medical information
2. **Disengaged Health Risker** - Patients who are disengaged from their health management and may be at higher risk
3. **Uncertain Reliant** - Patients who are uncertain about health issues and rely heavily on their doctor
4. **Proactive Reliant** - Patients who are both proactive and work collaboratively with their doctor

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Algorithm

The app implements the six-variable version of the CareStyles™ algorithm using Fisher's linear discriminant functions. Each of the 6 questions (Q1C, Q1D, Q1E, Q1G, Q1H, Q1I) is rated on a scale of 1-7, where:
- 1 = Very strongly disagree
- 7 = Very strongly agree

The algorithm calculates a score for each of the 4 segments, and the segment with the highest score is the predicted segment.

## Technology Stack

- React 18
- Vite
- CSS3 (no external UI libraries)

## License

Proprietary & Confidential
© Fidelum Health 2025 All Rights Reserved
