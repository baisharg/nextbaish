/**
 * WebGL Renderer - High-performance GPU-accelerated rendering
 *
 * Features:
 * - Vertex/fragment shaders for line rendering with gradients
 * - Two-pass separable Gaussian blur for glow effect
 * - Works with OffscreenCanvas in worker
 * - Significantly faster than Canvas2D and SVG
 */

import type {
  Renderer,
  RendererConfig,
  FramePacket,
  ThreadFrame,
  ColorStop,
} from "../types/renderer";
import { BEZIER_CONTROL_FACTOR } from "../utils/thread-utils";

// ============================================================================
// CPU-SIDE UTILITIES
// ============================================================================

/**
 * Convert HSL to RGB on CPU (removes expensive per-fragment conversion)
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns RGB tuple (0-1 range)
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360.0;
  s = s / 100.0;
  l = l / 100.0;

  const c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
  const x = c * (1.0 - Math.abs(((h * 6.0) % 2.0) - 1.0));
  const m = l - c / 2.0;

  let rgb: [number, number, number];
  if (h < 1.0 / 6.0) rgb = [c, x, 0.0];
  else if (h < 2.0 / 6.0) rgb = [x, c, 0.0];
  else if (h < 3.0 / 6.0) rgb = [0.0, c, x];
  else if (h < 4.0 / 6.0) rgb = [0.0, x, c];
  else if (h < 5.0 / 6.0) rgb = [x, 0.0, c];
  else rgb = [c, 0.0, x];

  return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

/**
 * Compute 5-tap linear Gaussian weights and offsets
 * Uses bilinear filtering optimization: 5 taps instead of 9
 */
function computeLinearGaussianWeights(sigma: number): {
  weights: [number, number, number];
  offsets: [number, number];
} {
  // Gaussian function
  const gauss = (x: number, sigma: number) =>
    Math.exp(-(x * x) / (2.0 * sigma * sigma));

  // Sample 5 points: -2, -1, 0, +1, +2 (scaled by sigma)
  const w0 = gauss(0, sigma);
  const w1 = gauss(1, sigma);
  const w2 = gauss(2, sigma);

  // Paired weights (for linear sampling)
  // Note: We apply each weight to BOTH +offset and -offset samples in the shader,
  // so we use the individual weight (w1, w2) rather than the pair sum (w1+w1, w2+w2)
  const wCenter = w0;
  const wPair1 = w1; // Will be applied to both +offset and -offset
  const wPair2 = w2; // Will be applied to both +offset and -offset

  // Normalize (total includes both directions: w0 + 2*w1 + 2*w2)
  const total = wCenter + 2 * wPair1 + 2 * wPair2;
  const weights: [number, number, number] = [
    wCenter / total,
    wPair1 / total,
    wPair2 / total,
  ];

  // Offsets for sampling (in units of sigma for Gaussian spread)
  // We sample at ±1σ and ±2σ for a 5-tap blur approximation
  const offsets: [number, number] = [1.0 * sigma, 2.0 * sigma];

  return { weights, offsets };
}

// ============================================================================
// SHADER SOURCES
// ============================================================================

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute float a_gradientPos; // Normalized y position for gradient

  uniform vec2 u_resolution;

  varying float v_gradientPos;

  void main() {
    // Convert from pixel space to clip space
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_gradientPos = a_gradientPos;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec3 u_rgbStops[5];    // RGB color stops (precomputed on CPU)
  uniform float u_stopPos[5];    // Gradient stop positions
  uniform int u_stopCount;
  uniform float u_opacity;

  varying float v_gradientPos;

  vec4 shadeOutput(vec3 baseColor) {
    float clampedPos = clamp(v_gradientPos, 0.0, 1.0);
    float shade = smoothstep(0.93, 1.0, clampedPos) * 0.35;
    vec3 finalColor = mix(baseColor, vec3(0.0), shade);
    return vec4(finalColor, u_opacity);
  }

  void main() {
    vec3 color = u_rgbStops[0];

    // Manually unrolled gradient interpolation for WebGL 1.0 compatibility
    // WebGL 1.0 doesn't support dynamic array indexing

    // Segment 0-1
    if (u_stopCount >= 2 && v_gradientPos >= u_stopPos[0] && v_gradientPos <= u_stopPos[1]) {
      float t = (v_gradientPos - u_stopPos[0]) / (u_stopPos[1] - u_stopPos[0]);
      color = mix(u_rgbStops[0], u_rgbStops[1], clamp(t, 0.0, 1.0));
      gl_FragColor = shadeOutput(color);
      return;
    }

    // Segment 1-2
    if (u_stopCount >= 3 && v_gradientPos >= u_stopPos[1] && v_gradientPos <= u_stopPos[2]) {
      float t = (v_gradientPos - u_stopPos[1]) / (u_stopPos[2] - u_stopPos[1]);
      color = mix(u_rgbStops[1], u_rgbStops[2], clamp(t, 0.0, 1.0));
      gl_FragColor = shadeOutput(color);
      return;
    }

    // Segment 2-3
    if (u_stopCount >= 4 && v_gradientPos >= u_stopPos[2] && v_gradientPos <= u_stopPos[3]) {
      float t = (v_gradientPos - u_stopPos[2]) / (u_stopPos[3] - u_stopPos[2]);
      color = mix(u_rgbStops[2], u_rgbStops[3], clamp(t, 0.0, 1.0));
      gl_FragColor = shadeOutput(color);
      return;
    }

    // Segment 3-4
    if (u_stopCount >= 5 && v_gradientPos >= u_stopPos[3] && v_gradientPos <= u_stopPos[4]) {
      float t = (v_gradientPos - u_stopPos[3]) / (u_stopPos[4] - u_stopPos[3]);
      color = mix(u_rgbStops[3], u_rgbStops[4], clamp(t, 0.0, 1.0));
      gl_FragColor = shadeOutput(color);
      return;
    }

    // Fallback: use last color or clamp to edges
    if (v_gradientPos < u_stopPos[0]) {
      color = u_rgbStops[0];
    } else if (u_stopCount >= 5) {
      color = u_rgbStops[4];
    } else if (u_stopCount >= 4) {
      color = u_rgbStops[3];
    } else if (u_stopCount >= 3) {
      color = u_rgbStops[2];
    } else if (u_stopCount >= 2) {
      color = u_rgbStops[1];
    }

    gl_FragColor = shadeOutput(color);
  }
`;

// Blur shaders (horizontal and vertical passes) - 5-tap with linear filtering
const BLUR_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const BLUR_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform vec2 u_direction;    // (1,0) for horizontal, (0,1) for vertical
  uniform vec3 u_weights;      // [w0, w1, w2] - center + 2 pairs
  uniform vec2 u_offsets;      // [o1, o2] - offsets for paired samples

  varying vec2 v_texCoord;

  // 5-tap separable Gaussian blur with linear filtering optimization
  // Reduces texture fetches from 9 to 5 while maintaining quality
  void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec2 dir = u_direction * texelSize;

    // Center sample
    vec4 color = texture2D(u_texture, v_texCoord) * u_weights.x;

    // First pair (symmetric)
    color += texture2D(u_texture, v_texCoord + dir * u_offsets.x) * u_weights.y;
    color += texture2D(u_texture, v_texCoord - dir * u_offsets.x) * u_weights.y;

    // Second pair (symmetric)
    color += texture2D(u_texture, v_texCoord + dir * u_offsets.y) * u_weights.z;
    color += texture2D(u_texture, v_texCoord - dir * u_offsets.y) * u_weights.z;

    gl_FragColor = color;
  }
`;

// Passthrough shader for compositing (avoids unnecessary blur shader overhead)
const PASSTHROUGH_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const PASSTHROUGH_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform float u_opacity;

  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    gl_FragColor = vec4(color.rgb, color.a * u_opacity);
  }
`;

// Composite shader with screen blend mode
const COMPOSITE_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_sceneTexture;
  uniform sampler2D u_glowTexture;
  uniform float u_glowOpacity;

  varying vec2 v_texCoord;

  // Screen blend mode: 1 - (1 - a) * (1 - b)
  vec3 screenBlend(vec3 a, vec3 b) {
    return vec3(1.0) - (vec3(1.0) - a) * (vec3(1.0) - b);
  }

  void main() {
    vec4 scene = texture2D(u_sceneTexture, v_texCoord);
    vec4 glow = texture2D(u_glowTexture, v_texCoord);

    // Additive glow blend
    vec3 color = scene.rgb + glow.rgb * u_glowOpacity;

    gl_FragColor = vec4(color, scene.a);
  }
`;

// ============================================================================
// WEBGL RENDERER
// ============================================================================

export class WebGLRenderer implements Renderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private config: RendererConfig | null = null;

  // Shader programs
  private lineProgram: WebGLProgram | null = null;
  private blurProgram: WebGLProgram | null = null;
  private passthroughProgram: WebGLProgram | null = null;
  private compositeProgram: WebGLProgram | null = null;

  // Uniforms and attributes for line program
  private lineUniforms: {
    resolution: WebGLUniformLocation | null;
    rgbStops: WebGLUniformLocation | null;
    stopPos: WebGLUniformLocation | null;
    stopCount: WebGLUniformLocation | null;
    opacity: WebGLUniformLocation | null;
  } = {
    resolution: null,
    rgbStops: null,
    stopPos: null,
    stopCount: null,
    opacity: null,
  };
  private lineAttribs: {
    position: number;
    gradientPos: number;
  } = {
    position: -1,
    gradientPos: -1,
  };

  // Uniforms and attributes for blur program
  private blurUniforms: {
    texture: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    direction: WebGLUniformLocation | null;
    weights: WebGLUniformLocation | null;
    offsets: WebGLUniformLocation | null;
  } = {
    texture: null,
    resolution: null,
    direction: null,
    weights: null,
    offsets: null,
  };
  private blurAttribs: {
    position: number;
    texCoord: number;
  } = {
    position: -1,
    texCoord: -1,
  };

  // Uniforms and attributes for passthrough program
  private passthroughUniforms: {
    texture: WebGLUniformLocation | null;
    opacity: WebGLUniformLocation | null;
  } = {
    texture: null,
    opacity: null,
  };
  private passthroughAttribs: {
    position: number;
    texCoord: number;
  } = {
    position: -1,
    texCoord: -1,
  };

  // Uniforms and attributes for composite program
  private compositeUniforms: {
    sceneTexture: WebGLUniformLocation | null;
    glowTexture: WebGLUniformLocation | null;
    glowOpacity: WebGLUniformLocation | null;
  } = {
    sceneTexture: null,
    glowTexture: null,
    glowOpacity: null,
  };
  private compositeAttribs: {
    position: number;
    texCoord: number;
  } = {
    position: -1,
    texCoord: -1,
  };

  // Blur framebuffers and textures
  private blurFBO1: WebGLFramebuffer | null = null;
  private blurFBO2: WebGLFramebuffer | null = null;
  private blurTexture1: WebGLTexture | null = null;
  private blurTexture2: WebGLTexture | null = null;

  // Full-resolution scene framebuffer for composite pass
  private sceneFBO: WebGLFramebuffer | null = null;
  private sceneTexture: WebGLTexture | null = null;

  // Fullscreen quad buffer (for blur passes and overlay)
  private quadBuffer: WebGLBuffer | null = null;

  // Streaming VBO for line vertices (persistent buffer)
  private streamingVBO: WebGLBuffer | null = null;
  private streamingVBOSize: number = 0;

  // Scratch buffers for gradient uniforms (5 stops max → 15 rgb floats)
  private gradientRgbScratch = new Float32Array(15);
  private gradientPosScratch = new Float32Array(5);

  // Blur weights and offsets (precomputed)
  private blurWeights: [number, number, number] = [1, 0, 0];
  private blurOffsets: [number, number] = [1, 2];

  // Context loss tracking
  private contextLost: boolean = false;

  // Rectangular render target dimensions (actual framebuffer size)
  private rtWidth: number = 0;
  private rtHeight: number = 0;
  private blurRtWidth: number = 0;
  private blurRtHeight: number = 0;

  async init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    config: RendererConfig,
  ): Promise<void> {
    this.canvas = canvas;
    this.config = config;

    // Get WebGL context (use standard alpha, not premultiplied)
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    }) as WebGLRenderingContext | null;

    if (!gl) {
      throw new Error("Failed to get WebGL context");
    }

    this.gl = gl;
    this.contextLost = false;

    // Add context loss/restoration handlers (only for HTMLCanvasElement)
    if ("addEventListener" in canvas) {
      canvas.addEventListener(
        "webglcontextlost",
        this.handleContextLost,
        false,
      );
      canvas.addEventListener(
        "webglcontextrestored",
        this.handleContextRestored,
        false,
      );
    }

    // Compute blur weights and offsets
    this.updateBlurWeights(config.blurStdDeviation);

    // Setup canvas dimensions
    this.updateCanvasSize();

    // Compile shaders
    await this.compileShaders();

    // Create streaming VBO for line vertices
    this.createStreamingVBO();

    // Setup blur framebuffers
    if (config.enableBlur) {
      this.setupSceneFramebuffer();
      this.setupBlurFramebuffers();
    }

    // Enable blending for standard alpha
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    console.warn("[WebGLRenderer] Context lost");
  };

  private handleContextRestored = async () => {
    console.log("[WebGLRenderer] Context restored, reinitializing...");
    this.contextLost = false;

    if (this.canvas && this.config) {
      // Re-compile shaders and recreate resources
      await this.compileShaders();
      this.createStreamingVBO();
      if (this.config.enableBlur) {
        this.setupSceneFramebuffer();
        this.setupBlurFramebuffers();
      }
      // Re-enable blending
      if (this.gl) {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      }
    }
  };

  private updateBlurWeights(sigma: number): void {
    const { weights, offsets } = computeLinearGaussianWeights(sigma);
    this.blurWeights = weights;
    this.blurOffsets = offsets;
  }

  private ensureStreamingBufferCapacity(requiredBytes: number): void {
    if (!this.gl) return;

    if (!this.streamingVBO || this.streamingVBOSize === 0) {
      this.createStreamingVBO();
    }

    if (!this.streamingVBO) return;

    if (requiredBytes > this.streamingVBOSize) {
      while (this.streamingVBOSize < requiredBytes) {
        this.streamingVBOSize *= 2;
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.streamingVBO);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        this.streamingVBOSize,
        this.gl.DYNAMIC_DRAW,
      );
    } else {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.streamingVBO);
    }
  }

  private uploadLineGeometry(vertices: Float32Array): number {
    if (!this.gl) return 0;

    this.ensureStreamingBufferCapacity(vertices.byteLength);
    if (!this.streamingVBO) return 0;

    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, vertices);

    const stride = 3 * Float32Array.BYTES_PER_ELEMENT;
    const positionAttrib = this.lineAttribs.position;
    const gradientAttrib = this.lineAttribs.gradientPos;

    if (positionAttrib < 0 || gradientAttrib < 0) {
      return 0;
    }

    this.gl.enableVertexAttribArray(positionAttrib);
    this.gl.vertexAttribPointer(
      positionAttrib,
      2,
      this.gl.FLOAT,
      false,
      stride,
      0,
    );

    this.gl.enableVertexAttribArray(gradientAttrib);
    this.gl.vertexAttribPointer(
      gradientAttrib,
      1,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT,
    );

    return vertices.length / 3;
  }

  private applyGradientUniforms(
    colorStops: ColorStop[],
    rgbScale: number = 1,
  ): number {
    if (!this.gl || !colorStops.length) {
      return 0;
    }

    const stopCount = Math.min(colorStops.length, 5);
    const lastIndex = stopCount - 1;

    for (let i = 0; i < 5; i++) {
      const stop = colorStops[i <= lastIndex ? i : lastIndex];
      const [r, g, b] = hslToRgb(stop.hsl[0], stop.hsl[1], stop.hsl[2]);
      const base = i * 3;
      this.gradientRgbScratch[base] = r * rgbScale;
      this.gradientRgbScratch[base + 1] = g * rgbScale;
      this.gradientRgbScratch[base + 2] = b * rgbScale;
      this.gradientPosScratch[i] = stop.yPct;
    }

    if (this.lineUniforms.rgbStops) {
      this.gl.uniform3fv(this.lineUniforms.rgbStops, this.gradientRgbScratch);
    }
    if (this.lineUniforms.stopPos) {
      this.gl.uniform1fv(this.lineUniforms.stopPos, this.gradientPosScratch);
    }
    if (this.lineUniforms.stopCount) {
      this.gl.uniform1i(this.lineUniforms.stopCount, stopCount);
    }

    return stopCount;
  }

  private createStreamingVBO(): void {
    if (!this.gl) return;

    // Dispose prior buffer if we are rebuilding
    if (this.streamingVBO) {
      this.gl.deleteBuffer(this.streamingVBO);
    }

    // Create streaming VBO (initially 1MB, will grow as needed)
    this.streamingVBO = this.gl.createBuffer();
    this.streamingVBOSize = 1024 * 1024; // 1MB initial size

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.streamingVBO);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.streamingVBOSize,
      this.gl.DYNAMIC_DRAW,
    );
  }

  private updateCanvasSize(): void {
    if (!this.canvas || !this.config || !this.gl) return;

    const { dpr } = this.config;

    // For HTMLCanvasElement, get the actual rendered size
    let displayWidth = 1000;
    let displayHeight = 1000;

    if ("offsetWidth" in this.canvas && this.canvas.offsetWidth > 0) {
      displayWidth = this.canvas.offsetWidth;
      displayHeight = this.canvas.offsetHeight;
    }

    // Set canvas internal resolution (high DPI)
    this.canvas.width = Math.max(1, Math.floor(displayWidth * dpr));
    this.canvas.height = Math.max(1, Math.floor(displayHeight * dpr));

    // Track actual render target dimensions (rectangular, not square)
    this.rtWidth = this.canvas.width;
    this.rtHeight = this.canvas.height;

    // Update config with actual size (needed for coordinate scaling)
    // Keep viewSize for aesthetic "square world" coordinate system
    this.config.viewSize = Math.max(displayWidth, displayHeight);

    // Set viewport to match actual render target size
    this.gl.viewport(0, 0, this.rtWidth, this.rtHeight);
  }

  private async compileShaders(): Promise<void> {
    if (!this.gl) return;

    // Compile line program
    this.lineProgram = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    if (!this.lineProgram) {
      throw new Error("Failed to create line shader program");
    }

    // Get uniform and attribute locations for line program
    // CRITICAL: Use [0] suffix for array uniforms in WebGL 1.0
    this.lineUniforms = {
      resolution: this.gl.getUniformLocation(this.lineProgram, "u_resolution"),
      rgbStops: this.gl.getUniformLocation(this.lineProgram, "u_rgbStops[0]"),
      stopPos: this.gl.getUniformLocation(this.lineProgram, "u_stopPos[0]"),
      stopCount: this.gl.getUniformLocation(this.lineProgram, "u_stopCount"),
      opacity: this.gl.getUniformLocation(this.lineProgram, "u_opacity"),
    };

    this.lineAttribs = {
      position: this.gl.getAttribLocation(this.lineProgram, "a_position"),
      gradientPos: this.gl.getAttribLocation(this.lineProgram, "a_gradientPos"),
    };

    // Compile blur program
    if (this.config?.enableBlur) {
      this.blurProgram = this.createProgram(
        BLUR_VERTEX_SHADER,
        BLUR_FRAGMENT_SHADER,
      );

      if (this.blurProgram) {
        // Get uniform and attribute locations for blur program
        this.blurUniforms = {
          texture: this.gl.getUniformLocation(this.blurProgram, "u_texture"),
          resolution: this.gl.getUniformLocation(
            this.blurProgram,
            "u_resolution",
          ),
          direction: this.gl.getUniformLocation(
            this.blurProgram,
            "u_direction",
          ),
          weights: this.gl.getUniformLocation(this.blurProgram, "u_weights"),
          offsets: this.gl.getUniformLocation(this.blurProgram, "u_offsets"),
        };

        this.blurAttribs = {
          position: this.gl.getAttribLocation(this.blurProgram, "a_position"),
          texCoord: this.gl.getAttribLocation(this.blurProgram, "a_texCoord"),
        };
      }

      // Compile passthrough program
      this.passthroughProgram = this.createProgram(
        PASSTHROUGH_VERTEX_SHADER,
        PASSTHROUGH_FRAGMENT_SHADER,
      );

      if (this.passthroughProgram) {
        this.passthroughUniforms = {
          texture: this.gl.getUniformLocation(
            this.passthroughProgram,
            "u_texture",
          ),
          opacity: this.gl.getUniformLocation(
            this.passthroughProgram,
            "u_opacity",
          ),
        };

        this.passthroughAttribs = {
          position: this.gl.getAttribLocation(
            this.passthroughProgram,
            "a_position",
          ),
          texCoord: this.gl.getAttribLocation(
            this.passthroughProgram,
            "a_texCoord",
          ),
        };
      }

      // Compile composite program
      this.compositeProgram = this.createProgram(
        PASSTHROUGH_VERTEX_SHADER, // Reuse vertex shader
        COMPOSITE_FRAGMENT_SHADER,
      );

      if (this.compositeProgram) {
        this.compositeUniforms = {
          sceneTexture: this.gl.getUniformLocation(
            this.compositeProgram,
            "u_sceneTexture",
          ),
          glowTexture: this.gl.getUniformLocation(
            this.compositeProgram,
            "u_glowTexture",
          ),
          glowOpacity: this.gl.getUniformLocation(
            this.compositeProgram,
            "u_glowOpacity",
          ),
        };

        this.compositeAttribs = {
          position: this.gl.getAttribLocation(
            this.compositeProgram,
            "a_position",
          ),
          texCoord: this.gl.getAttribLocation(
            this.compositeProgram,
            "a_texCoord",
          ),
        };
      }
    }

    // Create fullscreen quad buffer
    this.createQuadBuffer();
  }

  private createQuadBuffer(): void {
    if (!this.gl) return;

    // Fullscreen quad with position and texcoord interleaved
    // Format: [x, y, u, v, ...]
    const quadVertices = new Float32Array([
      // Triangle 1
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1,
      // Triangle 2
      -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
    ]);

    this.quadBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);
  }

  private createProgram(
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram | null {
    if (!this.gl) return null;

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexSource,
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource,
    );

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(
        "Shader program link error:",
        this.gl.getProgramInfoLog(program),
      );
      this.gl.deleteProgram(program);
      return null;
    }

    // Detach and delete shaders (best practice - driver can free memory)
    this.gl.detachShader(program, vertexShader);
    this.gl.detachShader(program, fragmentShader);
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return program;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private destroyBlurTargets(): void {
    if (!this.gl) return;

    if (this.blurTexture1) {
      this.gl.deleteTexture(this.blurTexture1);
      this.blurTexture1 = null;
    }
    if (this.blurTexture2) {
      this.gl.deleteTexture(this.blurTexture2);
      this.blurTexture2 = null;
    }
    if (this.blurFBO1) {
      this.gl.deleteFramebuffer(this.blurFBO1);
      this.blurFBO1 = null;
    }
    if (this.blurFBO2) {
      this.gl.deleteFramebuffer(this.blurFBO2);
      this.blurFBO2 = null;
    }
  }

  private destroySceneFramebuffer(): void {
    if (!this.gl) return;

    if (this.sceneTexture) {
      this.gl.deleteTexture(this.sceneTexture);
      this.sceneTexture = null;
    }
    if (this.sceneFBO) {
      this.gl.deleteFramebuffer(this.sceneFBO);
      this.sceneFBO = null;
    }
  }

  private setupBlurFramebuffers(): void {
    if (!this.gl || !this.config) return;

    const blurScale = 0.5; // Render blur at half resolution for performance

    // Create rectangular blur targets matching canvas aspect ratio
    const blurW = Math.max(1, Math.floor(this.rtWidth * blurScale));
    const blurH = Math.max(1, Math.floor(this.rtHeight * blurScale));
    this.blurRtWidth = blurW;
    this.blurRtHeight = blurH;

    // Create framebuffer 1
    this.blurFBO1 = this.gl.createFramebuffer();
    this.blurTexture1 = this.createTexture(blurW, blurH);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.blurTexture1,
      0,
    );

    // Check FBO1 completeness
    const status1 = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status1 !== this.gl.FRAMEBUFFER_COMPLETE) {
      console.warn(
        `[WebGLRenderer] Blur FBO1 incomplete: 0x${status1.toString(16)}`,
      );
      this.destroyBlurTargets();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      return;
    }

    // Create framebuffer 2
    this.blurFBO2 = this.gl.createFramebuffer();
    this.blurTexture2 = this.createTexture(blurW, blurH);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO2);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.blurTexture2,
      0,
    );

    // Check FBO2 completeness
    const status2 = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status2 !== this.gl.FRAMEBUFFER_COMPLETE) {
      console.warn(
        `[WebGLRenderer] Blur FBO2 incomplete: 0x${status2.toString(16)}`,
      );
      this.destroyBlurTargets();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      return;
    }

    // Reset to default framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private setupSceneFramebuffer(): void {
    if (!this.gl) return;

    // Clean up any existing targets before recreating
    this.destroySceneFramebuffer();

    const width = Math.max(1, this.rtWidth);
    const height = Math.max(1, this.rtHeight);

    this.sceneFBO = this.gl.createFramebuffer();
    this.sceneTexture = this.createTexture(width, height);

    if (!this.sceneFBO || !this.sceneTexture) {
      console.warn(
        "[WebGLRenderer] Failed to create scene framebuffer/texture",
      );
      this.destroySceneFramebuffer();
      return;
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.sceneFBO);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.sceneTexture,
      0,
    );

    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      console.warn(
        `[WebGLRenderer] Scene FBO incomplete: 0x${status.toString(16)}`,
      );
      this.destroySceneFramebuffer();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      return;
    }

    // Reset back to default framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private createTexture(width: number, height: number): WebGLTexture | null {
    if (!this.gl) return null;

    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE,
    );

    return texture;
  }

  updateConfig(config: Partial<RendererConfig>): void {
    if (!this.config) return;

    const oldViewSize = this.config.viewSize;
    const oldDpr = this.config.dpr;
    const oldBlur = this.config.enableBlur;
    const oldBlurStdDev = this.config.blurStdDeviation;

    this.config = { ...this.config, ...config };

    // Update blur weights if sigma changed
    if (oldBlurStdDev !== this.config.blurStdDeviation) {
      this.updateBlurWeights(this.config.blurStdDeviation);
    }

    // Resize if needed
    if (oldViewSize !== this.config.viewSize || oldDpr !== this.config.dpr) {
      this.updateCanvasSize();
      if (this.config.enableBlur) {
        this.destroySceneFramebuffer();
        this.setupSceneFramebuffer();
        this.destroyBlurTargets();
        this.setupBlurFramebuffers();
      }
    }

    // Enable/disable blur
    if (oldBlur !== this.config.enableBlur) {
      if (this.config.enableBlur) {
        this.setupSceneFramebuffer();
        this.setupBlurFramebuffers();
      } else {
        this.destroySceneFramebuffer();
        this.destroyBlurTargets();
      }
    }
  }

  draw(frame: FramePacket): void {
    if (!this.gl || !this.config || !this.lineProgram) return;

    const { viewSize, dpr, enableBlur } = this.config;
    const targetW = this.rtWidth;
    const targetH = this.rtHeight;

    if (enableBlur && this.blurFBO1 && this.blurFBO2 && this.blurProgram) {
      // ============================================================================
      // BLUR PIPELINE (rectangular render targets matching canvas aspect ratio)
      // ============================================================================

      // Step 1: Render threads to blurFBO1 at half resolution
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
      this.gl.viewport(0, 0, this.blurRtWidth, this.blurRtHeight);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.useProgram(this.lineProgram);
      // Keep square coordinate system for aesthetic consistency
      const squareScaleHalf = viewSize * dpr * 0.5;
      this.gl.uniform2f(
        this.lineUniforms.resolution,
        squareScaleHalf,
        squareScaleHalf,
      );

      for (const thread of frame.threads) {
        this.drawThread(
          thread,
          viewSize,
          dpr * 0.5,
          this.blurRtWidth,
          this.blurRtHeight,
        );
      }

      // Step 2: Horizontal blur pass (FBO1 → FBO2)
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO2);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.applyBlurPass(
        this.blurTexture1,
        1,
        0,
        this.blurRtWidth,
        this.blurRtHeight,
      );

      // Step 3: Vertical blur pass (FBO2 → FBO1)
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.applyBlurPass(
        this.blurTexture2,
        0,
        1,
        this.blurRtWidth,
        this.blurRtHeight,
      );

      const canComposite = !!(
        this.sceneFBO &&
        this.sceneTexture &&
        this.blurTexture1 &&
        this.compositeProgram &&
        this.compositeUniforms.sceneTexture &&
        this.compositeUniforms.glowTexture &&
        this.compositeUniforms.glowOpacity
      );

      if (canComposite) {
        // Step 4: Render sharp threads to a full-resolution scene FBO
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.sceneFBO);
        this.gl.viewport(0, 0, targetW, targetH);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.lineProgram);
        const squareScale = viewSize * dpr;
        this.gl.uniform2f(
          this.lineUniforms.resolution,
          squareScale,
          squareScale,
        );

        for (const thread of frame.threads) {
          this.drawThread(thread, viewSize, dpr, targetW, targetH);
        }

        // Step 5: Composite scene + glow onto the main canvas
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, targetW, targetH);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Composite pass writes directly, so disable blending/depth
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);

        this.gl.useProgram(this.compositeProgram);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.sceneTexture);
        this.gl.uniform1i(this.compositeUniforms.sceneTexture, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.blurTexture1);
        this.gl.uniform1i(this.compositeUniforms.glowTexture, 1);

        this.gl.uniform1f(this.compositeUniforms.glowOpacity, 0.8);

        this.drawQuad(this.compositeAttribs);

        // Restore default state for subsequent overlay pass
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      } else {
        // Fallback: original two-pass composite path
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, targetW, targetH);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.drawTextureToScreen(this.blurTexture1, 0.8);

        this.gl.useProgram(this.lineProgram);
        const squareScale = viewSize * dpr;
        this.gl.uniform2f(
          this.lineUniforms.resolution,
          squareScale,
          squareScale,
        );

        for (const thread of frame.threads) {
          this.drawThread(thread, viewSize, dpr, targetW, targetH);
        }
      }
    } else {
      // ============================================================================
      // NO BLUR PIPELINE (direct rendering)
      // ============================================================================
      this.gl.viewport(0, 0, targetW, targetH);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.useProgram(this.lineProgram);
      // Keep square coordinate system for aesthetic consistency
      const squareScale = viewSize * dpr;
      this.gl.uniform2f(this.lineUniforms.resolution, squareScale, squareScale);

      for (const thread of frame.threads) {
        this.drawThread(thread, viewSize, dpr, targetW, targetH);
      }
    }

    // Step 5: Draw overlay gradient with screen blend mode (purple glow)
    this.drawOverlay(frame, viewSize, dpr);
  }

  /**
   * Apply a single blur pass (horizontal or vertical) using 5-tap optimization
   */
  private applyBlurPass(
    sourceTexture: WebGLTexture | null,
    dirX: number,
    dirY: number,
    resW: number,
    resH: number,
  ): void {
    if (!this.gl || !this.blurProgram || !sourceTexture || !this.quadBuffer)
      return;

    // Disable blending for blur pass - we're writing to empty FBO, blending only adds ROP cost
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.BLEND);

    this.gl.useProgram(this.blurProgram);

    // Bind source texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, sourceTexture);
    this.gl.uniform1i(this.blurUniforms.texture, 0);

    // Set uniforms (use precomputed weights and offsets, rectangular resolution)
    this.gl.uniform2f(this.blurUniforms.resolution, resW, resH);
    this.gl.uniform2f(this.blurUniforms.direction, dirX, dirY);
    this.gl.uniform3f(
      this.blurUniforms.weights,
      this.blurWeights[0],
      this.blurWeights[1],
      this.blurWeights[2],
    );
    this.gl.uniform2f(
      this.blurUniforms.offsets,
      this.blurOffsets[0],
      this.blurOffsets[1],
    );

    // Draw fullscreen quad
    this.drawQuad(this.blurAttribs);
  }

  /**
   * Draw a texture to the screen with optional opacity
   */
  private drawTextureToScreen(
    texture: WebGLTexture | null,
    opacity: number = 1.0,
  ): void {
    if (!this.gl || !texture || !this.quadBuffer || !this.passthroughProgram)
      return;
    if (!this.passthroughUniforms.texture || !this.passthroughUniforms.opacity)
      return;

    this.gl.useProgram(this.passthroughProgram);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.passthroughUniforms.texture, 0);
    this.gl.uniform1f(this.passthroughUniforms.opacity, opacity);

    this.drawQuad(this.passthroughAttribs);
  }

  /**
   * Draw fullscreen quad using the quad buffer
   */
  private drawQuad(attribs: { position: number; texCoord: number }): void {
    if (!this.gl || !this.quadBuffer) return;

    const { position, texCoord } = attribs;
    if (position < 0 || texCoord < 0) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT; // x, y, u, v

    this.gl.enableVertexAttribArray(position);
    this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, stride, 0);

    this.gl.enableVertexAttribArray(texCoord);
    this.gl.vertexAttribPointer(
      texCoord,
      2,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  /**
   * Draw overlay gradient with screen blend mode
   */
  private drawOverlay(frame: FramePacket, viewSize: number, dpr: number): void {
    if (!this.gl || !this.lineProgram || !frame.overlayGradient.length) return;
    if (!this.lineUniforms.resolution || !this.lineUniforms.opacity) return;

    // Use actual render target dimensions for overlay
    const canvasWidth = this.rtWidth;
    const canvasHeight = this.rtHeight;

    this.gl.useProgram(this.lineProgram);
    this.gl.uniform2f(this.lineUniforms.resolution, canvasWidth, canvasHeight);

    const vertices = new Float32Array([
      0,
      0,
      0,
      canvasWidth,
      0,
      0,
      0,
      canvasHeight,
      1,
      0,
      canvasHeight,
      1,
      canvasWidth,
      0,
      0,
      canvasWidth,
      canvasHeight,
      1,
    ]);

    const vertexCount = this.uploadLineGeometry(vertices);
    if (vertexCount === 0) return;

    if (this.applyGradientUniforms(frame.overlayGradient) === 0) return;
    // Slightly subdued overlay to reduce overall background glow
    this.gl.uniform1f(this.lineUniforms.opacity, 0.35);

    // Screen blend: S + D - S*D = src ONE, dest (1 - src)
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(
      this.gl.ONE,
      this.gl.ONE_MINUS_SRC_COLOR,
      this.gl.ONE,
      this.gl.ONE_MINUS_SRC_ALPHA,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount);

    // Restore standard alpha blending
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  private drawThread(
    thread: ThreadFrame,
    viewSize: number,
    dpr: number,
    targetW?: number,
    targetH?: number,
  ): void {
    if (!this.gl || !this.lineProgram) return;

    const { points, width, opacity, colorStops, gradientMinY, gradientMaxY } =
      thread;

    // Build vertex data with line expansion (convert line to triangles)
    const vertices = this.buildLineVertices(
      points,
      width,
      viewSize,
      dpr,
      gradientMinY,
      gradientMaxY,
      targetW,
      targetH,
    );

    if (vertices.length === 0) return;

    const vertexCount = this.uploadLineGeometry(new Float32Array(vertices));
    if (vertexCount === 0) return;

    if (this.applyGradientUniforms(colorStops) === 0) return;
    this.gl.uniform1f(this.lineUniforms.opacity, opacity);

    // Draw triangles
    this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount);
  }

  private buildLineVertices(
    points: Float32Array,
    width: number,
    viewSize: number,
    dpr: number,
    gradientMinY: number,
    gradientMaxY: number,
    targetW?: number,
    targetH?: number,
  ): number[] {
    // Build smooth Bezier curves matching SVG implementation
    const vertices: number[] = [];
    const n = points.length >>> 1;
    if (n === 0) return vertices;

    // Use target dimensions if provided (for blur FBO), otherwise use canvas dimensions
    const canvasWidth = targetW ?? (this.canvas?.width || viewSize * dpr);
    const canvasHeight = targetH ?? (this.canvas?.height || viewSize * dpr);

    // Scale normalized coordinates [0,1] to canvas pixel dimensions
    // Match SVG behavior: use the reference viewSize for both axes to maintain aspect ratio
    const scale = viewSize * dpr;
    const scaleX = scale;
    const scaleY = scale;

    // Apply configurable positioning offsets
    const offsetXMultiplier = this.config?.offsetXMultiplier ?? 0.5; // default: center horizontally
    const offsetYMultiplier = this.config?.offsetYMultiplier ?? -0.35; // default: 0.0 (centered, prevents gap when scrolling)
    const offsetX = (canvasWidth - scale) * offsetXMultiplier;
    const offsetY = (canvasHeight - scale) * offsetYMultiplier;

    // Scale up thread width for better visibility and contrast against background
    const WIDTH_SCALE = 2.4; // Increased from 2.0 for thicker, more prominent threads
    const halfWidth = (width * dpr * WIDTH_SCALE) / 2;

    // Use static gradient bounds (matches SVG gradientUnits="userSpaceOnUse")
    // Expand bounds by halfStroke so edges can reach deepest gradient stops
    const gradientMargin = halfWidth / scaleY;
    const adjustedMinY = gradientMinY - gradientMargin;
    const adjustedMaxY = gradientMaxY + gradientMargin;
    const yRange = adjustedMaxY - adjustedMinY;
    const normalizeGradPos = (y: number) => {
      if (yRange <= 0) return 0;
      const pos = (y - adjustedMinY) / yRange;
      return Math.max(0, Math.min(1, pos)); // Clamp to [0,1]
    };

    // Generate smooth curve points using cubic Bezier interpolation
    const curvePoints: {
      x: number;
      y: number;
      gradPos: number;
      normY: number;
    }[] = [];

    // First point (with centering offset)
    const firstNormY = points[1];
    curvePoints.push({
      x: points[0] * scaleX + offsetX,
      y: firstNormY * scaleY + offsetY,
      gradPos: normalizeGradPos(firstNormY),
      normY: firstNormY,
    });

    // Generate Bezier curves between points (matching SVG implementation)
    let prevPrevX = points[0] * scaleX + offsetX;
    let prevPrevY = points[1] * scaleY + offsetY;
    let prevX = prevPrevX;
    let prevY = prevPrevY;

    const segmentsPerCurve = 8; // Subdivide each curve for smoothness

    for (let i = 1; i < n; i++) {
      const currX = points[i * 2] * scaleX + offsetX;
      const currY = points[i * 2 + 1] * scaleY + offsetY;
      const currNormY = points[i * 2 + 1];

      const nextIdx = i < n - 1 ? i + 1 : i;
      const nextX = points[nextIdx * 2] * scaleX + offsetX;
      const nextY = points[nextIdx * 2 + 1] * scaleY + offsetY;

      // Calculate control points (same as SVG)
      const cp1x = prevX + (currX - prevPrevX) * BEZIER_CONTROL_FACTOR;
      const cp1y = prevY + (currY - prevPrevY) * BEZIER_CONTROL_FACTOR;
      const cp2x = currX - (nextX - prevX) * BEZIER_CONTROL_FACTOR;
      const cp2y = currY - (nextY - prevY) * BEZIER_CONTROL_FACTOR;

      // Tessellate cubic Bezier curve
      for (let t = 0; t <= segmentsPerCurve; t++) {
        const u = t / segmentsPerCurve;
        const u2 = u * u;
        const u3 = u2 * u;
        const omu = 1 - u;
        const omu2 = omu * omu;
        const omu3 = omu2 * omu;

        // Cubic Bezier formula
        const x =
          omu3 * prevX + 3 * omu2 * u * cp1x + 3 * omu * u2 * cp2x + u3 * currX;
        const y =
          omu3 * prevY + 3 * omu2 * u * cp1y + 3 * omu * u2 * cp2y + u3 * currY;

        // Interpolate gradient position (normalized to thread's vertical span)
        const prevNormY = points[(i - 1) * 2 + 1];
        const interpNormY = prevNormY + (currNormY - prevNormY) * u;
        const gradPos = normalizeGradPos(interpNormY);

        if (t > 0) {
          // Skip first point (already added)
          curvePoints.push({ x, y, gradPos, normY: interpNormY });
        }
      }

      prevPrevX = prevX;
      prevPrevY = prevY;
      prevX = currX;
      prevY = currY;
    }

    // Now expand the curve into triangles
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p0 = curvePoints[i];
      const p1 = curvePoints[i + 1];

      // Calculate perpendicular
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;

      const nx = (-dy / len) * halfWidth;
      const ny = (dx / len) * halfWidth;

      const nyNorm = ny / scaleY;
      const p0UpperGrad = normalizeGradPos(p0.normY + nyNorm);
      const p0LowerGrad = normalizeGradPos(p0.normY - nyNorm);
      const p1UpperGrad = normalizeGradPos(p1.normY + nyNorm);
      const p1LowerGrad = normalizeGradPos(p1.normY - nyNorm);

      // Two triangles per segment
      vertices.push(
        p0.x + nx,
        p0.y + ny,
        p0UpperGrad,
        p0.x - nx,
        p0.y - ny,
        p0LowerGrad,
        p1.x + nx,
        p1.y + ny,
        p1UpperGrad,

        p0.x - nx,
        p0.y - ny,
        p0LowerGrad,
        p1.x - nx,
        p1.y - ny,
        p1LowerGrad,
        p1.x + nx,
        p1.y + ny,
        p1UpperGrad,
      );
    }

    return vertices;
  }

  dispose(): void {
    // Remove context loss/restoration handlers
    if (this.canvas && "removeEventListener" in this.canvas) {
      this.canvas.removeEventListener(
        "webglcontextlost",
        this.handleContextLost,
      );
      this.canvas.removeEventListener(
        "webglcontextrestored",
        this.handleContextRestored,
      );
    }

    if (this.gl) {
      // Delete programs
      if (this.lineProgram) this.gl.deleteProgram(this.lineProgram);
      if (this.blurProgram) this.gl.deleteProgram(this.blurProgram);
      if (this.passthroughProgram)
        this.gl.deleteProgram(this.passthroughProgram);
      if (this.compositeProgram) this.gl.deleteProgram(this.compositeProgram);

      // Delete buffers
      if (this.quadBuffer) this.gl.deleteBuffer(this.quadBuffer);
      if (this.streamingVBO) this.gl.deleteBuffer(this.streamingVBO);

      // Destroy blur targets
      this.destroySceneFramebuffer();
      this.destroyBlurTargets();
    }

    // Clear all references
    this.gl = null;
    this.canvas = null;
    this.config = null;
    this.lineProgram = null;
    this.blurProgram = null;
    this.passthroughProgram = null;
    this.compositeProgram = null;
    this.quadBuffer = null;
    this.streamingVBO = null;
    this.streamingVBOSize = 0;
    this.contextLost = false;
  }
}
