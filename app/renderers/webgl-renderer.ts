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
  precision mediump float;

  uniform vec3 u_gradientColors[5]; // Up to 5 gradient stops
  uniform float u_gradientStops[5]; // Gradient stop positions
  uniform int u_gradientCount;
  uniform float u_opacity;

  varying float v_gradientPos;

  vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y / 100.0;
    float l = hsl.z / 100.0;

    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;

    vec3 rgb;
    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + m;
  }

  void main() {
    // Manually unrolled gradient interpolation for WebGL 1.0 compatibility
    // Check each gradient segment and interpolate

    vec3 color = u_gradientColors[0];

    // Segment 0-1
    if (u_gradientCount >= 2 && v_gradientPos >= u_gradientStops[0] && v_gradientPos <= u_gradientStops[1]) {
      float t = (v_gradientPos - u_gradientStops[0]) / (u_gradientStops[1] - u_gradientStops[0]);
      vec3 rgb0 = hslToRgb(u_gradientColors[0]);
      vec3 rgb1 = hslToRgb(u_gradientColors[1]);
      color = mix(rgb0, rgb1, t);
      gl_FragColor = vec4(color, u_opacity);
      return;
    }

    // Segment 1-2
    if (u_gradientCount >= 3 && v_gradientPos >= u_gradientStops[1] && v_gradientPos <= u_gradientStops[2]) {
      float t = (v_gradientPos - u_gradientStops[1]) / (u_gradientStops[2] - u_gradientStops[1]);
      vec3 rgb0 = hslToRgb(u_gradientColors[1]);
      vec3 rgb1 = hslToRgb(u_gradientColors[2]);
      color = mix(rgb0, rgb1, t);
      gl_FragColor = vec4(color, u_opacity);
      return;
    }

    // Segment 2-3
    if (u_gradientCount >= 4 && v_gradientPos >= u_gradientStops[2] && v_gradientPos <= u_gradientStops[3]) {
      float t = (v_gradientPos - u_gradientStops[2]) / (u_gradientStops[3] - u_gradientStops[2]);
      vec3 rgb0 = hslToRgb(u_gradientColors[2]);
      vec3 rgb1 = hslToRgb(u_gradientColors[3]);
      color = mix(rgb0, rgb1, t);
      gl_FragColor = vec4(color, u_opacity);
      return;
    }

    // Segment 3-4
    if (u_gradientCount >= 5 && v_gradientPos >= u_gradientStops[3] && v_gradientPos <= u_gradientStops[4]) {
      float t = (v_gradientPos - u_gradientStops[3]) / (u_gradientStops[4] - u_gradientStops[3]);
      vec3 rgb0 = hslToRgb(u_gradientColors[3]);
      vec3 rgb1 = hslToRgb(u_gradientColors[4]);
      color = mix(rgb0, rgb1, t);
      gl_FragColor = vec4(color, u_opacity);
      return;
    }

    // Fallback: use last color
    if (u_gradientCount >= 5) color = hslToRgb(u_gradientColors[4]);
    else if (u_gradientCount >= 4) color = hslToRgb(u_gradientColors[3]);
    else if (u_gradientCount >= 3) color = hslToRgb(u_gradientColors[2]);
    else if (u_gradientCount >= 2) color = hslToRgb(u_gradientColors[1]);
    else color = hslToRgb(u_gradientColors[0]);

    gl_FragColor = vec4(color, u_opacity);
  }
`;

// Blur shaders (horizontal and vertical passes)
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
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform vec2 u_direction; // (1,0) for horizontal, (0,1) for vertical
  uniform float u_sigma;

  varying vec2 v_texCoord;

  // 9-tap Gaussian blur (manually unrolled for WebGL 1.0 compatibility)
  void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec4 color = vec4(0.0);

    // Sample offsets and weights (9-tap Gaussian kernel)
    // Note: Loop unrolled because WebGL 1.0 doesn't support dynamic array indexing

    color += texture2D(u_texture, v_texCoord + u_direction * texelSize * -4.0 * u_sigma) * 0.05;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize * -3.0 * u_sigma) * 0.09;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize * -2.0 * u_sigma) * 0.12;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize * -1.0 * u_sigma) * 0.15;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize *  0.0 * u_sigma) * 0.18;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize *  1.0 * u_sigma) * 0.15;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize *  2.0 * u_sigma) * 0.12;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize *  3.0 * u_sigma) * 0.09;
    color += texture2D(u_texture, v_texCoord + u_direction * texelSize *  4.0 * u_sigma) * 0.05;

    gl_FragColor = color;
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

  // Uniforms and attributes for line program
  private lineUniforms: Record<string, WebGLUniformLocation | null> = {};
  private lineAttribs: Record<string, number> = {};

  // Uniforms and attributes for blur program
  private blurUniforms: Record<string, WebGLUniformLocation | null> = {};
  private blurAttribs: Record<string, number> = {};

  // Blur framebuffers and textures
  private blurFBO1: WebGLFramebuffer | null = null;
  private blurFBO2: WebGLFramebuffer | null = null;
  private blurTexture1: WebGLTexture | null = null;
  private blurTexture2: WebGLTexture | null = null;

  // Fullscreen quad buffer (for blur passes and overlay)
  private quadBuffer: WebGLBuffer | null = null;

  async init(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    config: RendererConfig
  ): Promise<void> {
    this.canvas = canvas;
    this.config = config;

    // Get WebGL context
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    }) as WebGLRenderingContext | null;

    if (!gl) {
      throw new Error("Failed to get WebGL context");
    }

    this.gl = gl;

    // Setup canvas dimensions
    this.updateCanvasSize();

    // Compile shaders
    await this.compileShaders();

    // Setup blur framebuffers
    if (config.enableBlur) {
      this.setupBlurFramebuffers();
    }

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private updateCanvasSize(): void {
    if (!this.canvas || !this.config || !this.gl) return;

    const { dpr } = this.config;

    // For HTMLCanvasElement, get the actual rendered size
    let displayWidth = 1000;
    let displayHeight = 1000;

    if ('offsetWidth' in this.canvas && this.canvas.offsetWidth > 0) {
      displayWidth = this.canvas.offsetWidth;
      displayHeight = this.canvas.offsetHeight;
    }

    // Set canvas internal resolution (high DPI)
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    // Update config with actual size (needed for coordinate scaling)
    this.config.viewSize = Math.max(displayWidth, displayHeight);

    // Set viewport to match canvas size
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private async compileShaders(): Promise<void> {
    if (!this.gl) return;

    // Compile line program
    this.lineProgram = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    if (!this.lineProgram) {
      throw new Error("Failed to create line shader program");
    }

    // Get uniform and attribute locations for line program
    this.lineUniforms = {
      resolution: this.gl.getUniformLocation(this.lineProgram, "u_resolution"),
      gradientColors: this.gl.getUniformLocation(this.lineProgram, "u_gradientColors"),
      gradientStops: this.gl.getUniformLocation(this.lineProgram, "u_gradientStops"),
      gradientCount: this.gl.getUniformLocation(this.lineProgram, "u_gradientCount"),
      opacity: this.gl.getUniformLocation(this.lineProgram, "u_opacity"),
    };

    this.lineAttribs = {
      position: this.gl.getAttribLocation(this.lineProgram, "a_position"),
      gradientPos: this.gl.getAttribLocation(this.lineProgram, "a_gradientPos"),
    };

    // Compile blur program
    if (this.config?.enableBlur) {
      this.blurProgram = this.createProgram(BLUR_VERTEX_SHADER, BLUR_FRAGMENT_SHADER);

      if (this.blurProgram) {
        // Get uniform and attribute locations for blur program
        this.blurUniforms = {
          texture: this.gl.getUniformLocation(this.blurProgram, "u_texture"),
          resolution: this.gl.getUniformLocation(this.blurProgram, "u_resolution"),
          direction: this.gl.getUniformLocation(this.blurProgram, "u_direction"),
          sigma: this.gl.getUniformLocation(this.blurProgram, "u_sigma"),
        };

        this.blurAttribs = {
          position: this.gl.getAttribLocation(this.blurProgram, "a_position"),
          texCoord: this.gl.getAttribLocation(this.blurProgram, "a_texCoord"),
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
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
      // Triangle 2
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1,
    ]);

    this.quadBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null;

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Shader program link error:", this.gl.getProgramInfoLog(program));
      return null;
    }

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

  private setupBlurFramebuffers(): void {
    if (!this.gl || !this.config) return;

    const { viewSize, dpr } = this.config;
    const blurScale = 0.5; // Render blur at half resolution for performance
    const blurSize = viewSize * dpr * blurScale;

    // Create framebuffer 1
    this.blurFBO1 = this.gl.createFramebuffer();
    this.blurTexture1 = this.createTexture(blurSize, blurSize);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.blurTexture1,
      0
    );

    // Create framebuffer 2
    this.blurFBO2 = this.gl.createFramebuffer();
    this.blurTexture2 = this.createTexture(blurSize, blurSize);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO2);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.blurTexture2,
      0
    );

    // Reset to default framebuffer
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
      null
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    return texture;
  }

  updateConfig(config: Partial<RendererConfig>): void {
    if (!this.config) return;

    const oldViewSize = this.config.viewSize;
    const oldDpr = this.config.dpr;

    this.config = { ...this.config, ...config };

    // Resize if needed
    if (oldViewSize !== this.config.viewSize || oldDpr !== this.config.dpr) {
      this.updateCanvasSize();
      if (this.config.enableBlur) {
        this.setupBlurFramebuffers();
      }
    }
  }

  draw(frame: FramePacket): void {
    if (!this.gl || !this.config || !this.lineProgram) return;

    const { viewSize, dpr, enableBlur, blurStdDeviation } = this.config;
    const pixelSize = viewSize * dpr;

    if (enableBlur && this.blurFBO1 && this.blurFBO2 && this.blurProgram) {
      // ============================================================================
      // BLUR PIPELINE
      // ============================================================================

      // Step 1: Render threads to blurFBO1
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
      this.gl.viewport(0, 0, pixelSize * 0.5, pixelSize * 0.5); // Blur at half resolution
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.useProgram(this.lineProgram);
      this.gl.uniform2f(this.lineUniforms.resolution, pixelSize * 0.5, pixelSize * 0.5);

      for (const thread of frame.threads) {
        this.drawThread(thread, viewSize, dpr * 0.5);
      }

      // Step 2: Horizontal blur pass (FBO1 → FBO2)
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO2);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.applyBlurPass(this.blurTexture1, 1, 0, blurStdDeviation, pixelSize * 0.5);

      // Step 3: Vertical blur pass (FBO2 → FBO1)
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurFBO1);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.applyBlurPass(this.blurTexture2, 0, 1, blurStdDeviation, pixelSize * 0.5);

      // Step 4: Composite to main canvas
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.viewport(0, 0, pixelSize, pixelSize);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      // Draw blurred layer (glow) with reduced opacity
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.drawTextureToScreen(this.blurTexture1, 0.5); // Match feColorMatrix opacity

      // Draw sharp layer on top
      this.gl.useProgram(this.lineProgram);
      this.gl.uniform2f(this.lineUniforms.resolution, pixelSize, pixelSize);

      for (const thread of frame.threads) {
        this.drawThread(thread, viewSize, dpr);
      }
    } else {
      // ============================================================================
      // NO BLUR PIPELINE (direct rendering)
      // ============================================================================
      this.gl.viewport(0, 0, pixelSize, pixelSize);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.useProgram(this.lineProgram);
      this.gl.uniform2f(this.lineUniforms.resolution, pixelSize, pixelSize);

      for (const thread of frame.threads) {
        this.drawThread(thread, viewSize, dpr);
      }
    }

    // Step 5: Draw overlay with screen blend mode
    this.drawOverlay(frame, viewSize, dpr);
  }

  /**
   * Apply a single blur pass (horizontal or vertical)
   */
  private applyBlurPass(
    sourceTexture: WebGLTexture | null,
    dirX: number,
    dirY: number,
    sigma: number,
    resolution: number
  ): void {
    if (!this.gl || !this.blurProgram || !sourceTexture || !this.quadBuffer) return;

    this.gl.useProgram(this.blurProgram);

    // Bind source texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, sourceTexture);
    this.gl.uniform1i(this.blurUniforms.texture, 0);

    // Set uniforms
    this.gl.uniform2f(this.blurUniforms.resolution, resolution, resolution);
    this.gl.uniform2f(this.blurUniforms.direction, dirX, dirY);
    this.gl.uniform1f(this.blurUniforms.sigma, sigma);

    // Draw fullscreen quad
    this.drawQuad();
  }

  /**
   * Draw a texture to the screen with optional opacity
   */
  private drawTextureToScreen(texture: WebGLTexture | null, opacity: number = 1.0): void {
    if (!this.gl || !this.blurProgram || !texture || !this.quadBuffer) return;

    this.gl.useProgram(this.blurProgram);

    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.blurUniforms.texture, 0);

    // Set uniforms for passthrough (no blur)
    this.gl.uniform2f(this.blurUniforms.resolution, 1, 1);
    this.gl.uniform2f(this.blurUniforms.direction, 0, 0);
    this.gl.uniform1f(this.blurUniforms.sigma, 0);

    // Set opacity via blend mode
    const prevBlendFunc = this.gl.getParameter(this.gl.BLEND_SRC_ALPHA);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Note: Opacity should be baked into the shader for proper control
    // For now, we rely on the blur texture's alpha channel
    this.drawQuad();

    this.gl.blendFunc(prevBlendFunc, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  /**
   * Draw fullscreen quad using the quad buffer
   */
  private drawQuad(): void {
    if (!this.gl || !this.quadBuffer) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT; // x, y, u, v

    // Position attribute
    this.gl.enableVertexAttribArray(this.blurAttribs.position);
    this.gl.vertexAttribPointer(
      this.blurAttribs.position,
      2,
      this.gl.FLOAT,
      false,
      stride,
      0
    );

    // TexCoord attribute
    this.gl.enableVertexAttribArray(this.blurAttribs.texCoord);
    this.gl.vertexAttribPointer(
      this.blurAttribs.texCoord,
      2,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    // Draw 6 vertices (2 triangles)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  /**
   * Draw overlay gradient with screen blend mode
   */
  private drawOverlay(frame: FramePacket, viewSize: number, dpr: number): void {
    // TODO: Implement overlay rendering
    // For now, WebGL renderer doesn't draw the overlay
    // This would require a separate shader for gradient rendering with screen blend
  }

  private drawThread(thread: ThreadFrame, viewSize: number, dpr: number): void {
    if (!this.gl || !this.lineProgram) return;

    const { points, width, opacity, colorStops } = thread;

    // Build vertex data with line expansion (convert line to triangles)
    const vertices = this.buildLineVertices(points, width, viewSize, dpr);

    if (vertices.length === 0) return;

    // Create and bind buffer
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    // Set up attributes (position + gradientPos interleaved: x, y, gradPos)
    const stride = 3 * Float32Array.BYTES_PER_ELEMENT;
    this.gl.enableVertexAttribArray(this.lineAttribs.position);
    this.gl.vertexAttribPointer(
      this.lineAttribs.position,
      2,
      this.gl.FLOAT,
      false,
      stride,
      0
    );
    this.gl.enableVertexAttribArray(this.lineAttribs.gradientPos);
    this.gl.vertexAttribPointer(
      this.lineAttribs.gradientPos,
      1,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    // Set gradient uniforms
    const colors = colorStops.map((s) => s.hsl).flat();
    const stops = colorStops.map((s) => s.yPct);

    this.gl.uniform3fv(this.lineUniforms.gradientColors, colors);
    this.gl.uniform1fv(this.lineUniforms.gradientStops, stops);
    this.gl.uniform1i(this.lineUniforms.gradientCount, colorStops.length);
    this.gl.uniform1f(this.lineUniforms.opacity, opacity);

    // Draw triangles
    this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length / 3);

    // Clean up
    this.gl.deleteBuffer(buffer);
  }

  private buildLineVertices(
    points: Float32Array,
    width: number,
    viewSize: number,
    dpr: number
  ): number[] {
    // Build smooth Bezier curves matching SVG implementation
    const vertices: number[] = [];
    const n = points.length >>> 1;
    if (n === 0) return vertices;

    // Use actual canvas dimensions for scaling
    const canvasWidth = this.canvas?.width || viewSize * dpr;
    const canvasHeight = this.canvas?.height || viewSize * dpr;

    // Scale normalized coordinates [0,1] to canvas pixel dimensions
    // Match SVG behavior: use the reference viewSize for both axes to maintain aspect ratio
    const scale = viewSize * dpr;
    const scaleX = scale;
    const scaleY = scale;

    // Center horizontally, but shift down vertically (50% further down from center)
    const offsetX = (canvasWidth - scale) / 2;
    const offsetY = (canvasHeight - scale) * 0.25;  // 25% from top (moves threads down from center)

    const halfWidth = (width * dpr) / 2;

    // Generate smooth curve points using cubic Bezier interpolation
    const curvePoints: { x: number; y: number; gradPos: number }[] = [];

    // First point (with centering offset)
    curvePoints.push({
      x: points[0] * scaleX + offsetX,
      y: points[1] * scaleY + offsetY,
      gradPos: points[1],
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
      const currGradPos = points[i * 2 + 1];

      const nextIdx = i < n - 1 ? (i + 1) : i;
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
        const x = omu3 * prevX + 3 * omu2 * u * cp1x + 3 * omu * u2 * cp2x + u3 * currX;
        const y = omu3 * prevY + 3 * omu2 * u * cp1y + 3 * omu * u2 * cp2y + u3 * currY;

        // Interpolate gradient position
        const prevGradPos = points[(i - 1) * 2 + 1];
        const gradPos = prevGradPos + (currGradPos - prevGradPos) * u;

        if (t > 0) { // Skip first point (already added)
          curvePoints.push({ x, y, gradPos });
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

      // Two triangles per segment
      vertices.push(
        p0.x + nx, p0.y + ny, p0.gradPos,
        p0.x - nx, p0.y - ny, p0.gradPos,
        p1.x + nx, p1.y + ny, p1.gradPos,

        p0.x - nx, p0.y - ny, p0.gradPos,
        p1.x - nx, p1.y - ny, p1.gradPos,
        p1.x + nx, p1.y + ny, p1.gradPos
      );
    }

    return vertices;
  }

  dispose(): void {
    if (this.gl) {
      if (this.lineProgram) this.gl.deleteProgram(this.lineProgram);
      if (this.blurProgram) this.gl.deleteProgram(this.blurProgram);
      if (this.blurFBO1) this.gl.deleteFramebuffer(this.blurFBO1);
      if (this.blurFBO2) this.gl.deleteFramebuffer(this.blurFBO2);
      if (this.blurTexture1) this.gl.deleteTexture(this.blurTexture1);
      if (this.blurTexture2) this.gl.deleteTexture(this.blurTexture2);
      if (this.quadBuffer) this.gl.deleteBuffer(this.quadBuffer);
    }

    this.gl = null;
    this.canvas = null;
    this.config = null;
    this.lineProgram = null;
    this.blurProgram = null;
    this.quadBuffer = null;
  }
}
