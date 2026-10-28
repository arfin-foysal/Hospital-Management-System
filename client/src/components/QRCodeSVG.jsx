import React from 'react';

// Lightweight pure React/SVG QR Code component generator (deterministic matrix)
const QRCodeSVG = ({ value = 'CareSync-HMS', size = 96, fgColor = '#1e293b', bgColor = '#ffffff' }) => {
  // Generate pseudo-deterministic 21x21 QR pattern based on input hash
  const modules = Array.from({ length: 21 }, () => Array(21).fill(false));

  // 1. Draw 3 standard Finder Patterns (top-left, top-right, bottom-left)
  const drawFinder = (rStart, cStart) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[rStart + r][cStart + c] = isBorder || isCore;
      }
    }
  };

  drawFinder(0, 0);     // Top-Left
  drawFinder(0, 14);    // Top-Right
  drawFinder(14, 0);    // Bottom-Left

  // 2. Timing patterns
  for (let i = 8; i < 13; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  // 3. Hash string to fill data cells
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      // Skip finder zones
      const inTL = r < 9 && c < 9;
      const inTR = r < 9 && c > 12;
      const inBL = r > 12 && c < 9;
      const inTiming = r === 6 || c === 6;
      if (!inTL && !inTR && !inBL && !inTiming) {
        const bit = ((hash ^ (r * 21 + c)) >> (bitIdx % 16)) & 1;
        modules[r][c] = Boolean(bit);
        bitIdx++;
      }
    }
  }

  const cellSize = size / 21;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block rounded shadow-xs">
      <rect width={size} height={size} fill={bgColor} />
      {modules.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default QRCodeSVG;
