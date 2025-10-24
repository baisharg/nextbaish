"use client";

import { useState } from "react";
import "./thread-control-panel.css";

export type ThreadControlParams = {
  // Positioning
  offsetYMultiplier: number; // 0.5 = center, 1.0 = bottom, 0.0 = top
  offsetXMultiplier: number;

  // Visual parameters
  threadCount: number;
  pivotX: number;
  pivotY: number;
  xStart: number;
  xEnd: number;

  // Animation timing
  flipInterval: number;
  upDurationMin: number;
  upDurationMax: number;
  downDurationMin: number;
  downDurationMax: number;

  // Rendering
  blurStdDeviation: number;
  enableBlur: boolean;
};

export const DEFAULT_PARAMS: ThreadControlParams = {
  offsetYMultiplier: -0.35, // negative = above top edge (threads positioned higher)
  offsetXMultiplier: 0.5, // 0.5 = center horizontally
  threadCount: 50,
  pivotX: 0.42,
  pivotY: 0.54,
  xStart: -0.18,
  xEnd: 1.15,
  flipInterval: 8000,
  upDurationMin: 10400,
  upDurationMax: 16400,
  downDurationMin: 6800,
  downDurationMax: 11600,
  blurStdDeviation: 5.9,
  enableBlur: true,
};

type ThreadControlPanelProps = {
  params: ThreadControlParams;
  onChange: (params: ThreadControlParams) => void;
};

export default function ThreadControlPanel({ params, onChange }: ThreadControlPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const updateParam = <K extends keyof ThreadControlParams>(
    key: K,
    value: ThreadControlParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  const resetToDefaults = () => {
    onChange(DEFAULT_PARAMS);
  };

  const copyToClipboard = () => {
    const code = `
// Thread animation parameters:
offsetYMultiplier: ${params.offsetYMultiplier},
offsetXMultiplier: ${params.offsetXMultiplier},
threadCount: ${params.threadCount},
pivotX: ${params.pivotX},
pivotY: ${params.pivotY},
xStart: ${params.xStart},
xEnd: ${params.xEnd},
flipInterval: ${params.flipInterval},
upDurationMin: ${params.upDurationMin},
upDurationMax: ${params.upDurationMax},
downDurationMin: ${params.downDurationMin},
downDurationMax: ${params.downDurationMax},
blurStdDeviation: ${params.blurStdDeviation},
enableBlur: ${params.enableBlur}
    `.trim();

    navigator.clipboard.writeText(code);
    alert("Parameters copied to clipboard!");
  };

  return (
    <div className={`thread-control-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="panel-header">
        <h3>Thread Animation Controls</h3>
        <button onClick={() => setCollapsed(!collapsed)} className="toggle-btn">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {!collapsed && (
        <div className="panel-content">
          {/* Positioning */}
          <fieldset>
            <legend>Positioning</legend>

            <label title="0=top, 0.5=center, 1.0=bottom, >1.0=below screen">
              <span>Vertical Offset (Y)</span>
              <input
                type="range"
                min="-0.5"
                max="2"
                step="0.05"
                value={params.offsetYMultiplier}
                onChange={(e) => updateParam("offsetYMultiplier", parseFloat(e.target.value))}
              />
              <span className="value">{params.offsetYMultiplier.toFixed(2)}</span>
            </label>

            <label title="0=left, 0.5=center, 1.0=right">
              <span>Horizontal Offset (X)</span>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.05"
                value={params.offsetXMultiplier}
                onChange={(e) => updateParam("offsetXMultiplier", parseFloat(e.target.value))}
              />
              <span className="value">{params.offsetXMultiplier.toFixed(2)}</span>
            </label>

            <label>
              <span>Pivot X</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={params.pivotX}
                onChange={(e) => updateParam("pivotX", parseFloat(e.target.value))}
              />
              <span className="value">{params.pivotX.toFixed(2)}</span>
            </label>

            <label>
              <span>Pivot Y</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={params.pivotY}
                onChange={(e) => updateParam("pivotY", parseFloat(e.target.value))}
              />
              <span className="value">{params.pivotY.toFixed(2)}</span>
            </label>
          </fieldset>

          {/* Visual */}
          <fieldset>
            <legend>Visual</legend>

            <label>
              <span>Thread Count</span>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={params.threadCount}
                onChange={(e) => updateParam("threadCount", parseInt(e.target.value))}
              />
              <span className="value">{params.threadCount}</span>
            </label>

            <label>
              <span>X Start</span>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={params.xStart}
                onChange={(e) => updateParam("xStart", parseFloat(e.target.value))}
              />
              <span className="value">{params.xStart.toFixed(2)}</span>
            </label>

            <label>
              <span>X End</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={params.xEnd}
                onChange={(e) => updateParam("xEnd", parseFloat(e.target.value))}
              />
              <span className="value">{params.xEnd.toFixed(2)}</span>
            </label>
          </fieldset>

          {/* Animation Timing */}
          <fieldset>
            <legend>Animation Timing</legend>

            <label>
              <span>Flip Interval (ms)</span>
              <input
                type="range"
                min="2000"
                max="20000"
                step="100"
                value={params.flipInterval}
                onChange={(e) => updateParam("flipInterval", parseInt(e.target.value))}
              />
              <span className="value">{params.flipInterval}ms</span>
            </label>

            <label>
              <span>Up Duration Min (ms)</span>
              <input
                type="range"
                min="5000"
                max="20000"
                step="100"
                value={params.upDurationMin}
                onChange={(e) => updateParam("upDurationMin", parseInt(e.target.value))}
              />
              <span className="value">{params.upDurationMin}ms</span>
            </label>

            <label>
              <span>Up Duration Max (ms)</span>
              <input
                type="range"
                min="5000"
                max="25000"
                step="100"
                value={params.upDurationMax}
                onChange={(e) => updateParam("upDurationMax", parseInt(e.target.value))}
              />
              <span className="value">{params.upDurationMax}ms</span>
            </label>

            <label>
              <span>Down Duration Min (ms)</span>
              <input
                type="range"
                min="3000"
                max="15000"
                step="100"
                value={params.downDurationMin}
                onChange={(e) => updateParam("downDurationMin", parseInt(e.target.value))}
              />
              <span className="value">{params.downDurationMin}ms</span>
            </label>

            <label>
              <span>Down Duration Max (ms)</span>
              <input
                type="range"
                min="5000"
                max="20000"
                step="100"
                value={params.downDurationMax}
                onChange={(e) => updateParam("downDurationMax", parseInt(e.target.value))}
              />
              <span className="value">{params.downDurationMax}ms</span>
            </label>
          </fieldset>

          {/* Rendering */}
          <fieldset>
            <legend>Rendering</legend>

            <label>
              <span>Blur</span>
              <input
                type="checkbox"
                checked={params.enableBlur}
                onChange={(e) => updateParam("enableBlur", e.target.checked)}
              />
            </label>

            <label>
              <span>Blur Std Deviation</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.blurStdDeviation}
                onChange={(e) => updateParam("blurStdDeviation", parseFloat(e.target.value))}
                disabled={!params.enableBlur}
              />
              <span className="value">{params.blurStdDeviation.toFixed(1)}</span>
            </label>
          </fieldset>

          {/* Actions */}
          <div className="panel-actions">
            <button onClick={resetToDefaults} className="btn-reset">
              Reset to Defaults
            </button>
            <button onClick={copyToClipboard} className="btn-copy">
              Copy Values
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
