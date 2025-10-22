# Realtime Lens Distortion & Undistort Demo

This demo visualizes **radial and tangential lens distortion** in real time in the browser using WebGL.

<a href=https://klandermans.github.io/manualC/>https://klandermans.github.io/manualC/</a>

## Features
- Upload a local image (no CORS issues)
- Adjust lens distortion parameters in real time:
  - `k1`, `k2`, `k3` → radial distortion
  - `p1`, `p2` → tangential distortion
- Toggle **Undistort** to correct the image based on the parameters
- GPU-accelerated rendering via WebGL for smooth updates

## Usage
1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Upload an image using the file input.
4. Adjust sliders and toggle "Undistort" to see the effect.

## Camera Parameters
You can adjust the internal camera parameters in the script:

\`\`\`javascript
fx: image.width,
fy: image.height,
cx: image.width/2,
cy: image.height/2
\`\`\`

These values determine how pixels are mapped for distortion/undistortion.

## Technology
- HTML5 + WebGL
- GLSL fragment shader
- Vanilla JavaScript

## Applications
- Camera calibration demo
- Lens distortion visualization
- Educational experiments with computer vision
