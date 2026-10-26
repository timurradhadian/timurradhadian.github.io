"use client";

import React, { useEffect, useRef } from "react";

interface HalftoneShaderProps {
  className?: string;
  shape?: "square" | "circle";
  dotSpacing?: number;
  dotColor?: string; // hex, e.g. "#18181b"
  alpha?: number; // 0.0 to 1.0
  angleDeg?: number; // e.g. 0 or 45
  minRadius?: number; // relative to cell, 0.0 to 0.48
  maxRadius?: number; // relative to cell, 0.0 to 0.48
  speed?: number; // animation speed multiplier
  interactive?: boolean; // track mouse
  fadeBottom?: boolean; // smooth fade towards bottom edge
  invertGradient?: boolean; // false = thick at top, true = thick at bottom
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_color;
uniform float u_alpha;
uniform float u_spacing;
uniform float u_angle;
uniform float u_minRadius;
uniform float u_maxRadius;
uniform float u_fadeBottom;
uniform float u_shape; // 1.0 for square/squircle, 0.0 for circle
uniform float u_invertGradient; // 1.0 = thick at bottom, 0.0 = thick at top

// 2D Simplex Noise for silky smooth, organic wave motion
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

vec2 rotate(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// Signed distance to a rounded box (squircle)
float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
    vec2 coord = gl_FragCoord.xy;
    vec2 uv = coord / u_resolution;

    // Rotate coordinate system
    vec2 rotCoord = rotate(coord, u_angle);

    // Compute cell and local distance in grid
    vec2 gridPos = rotCoord / u_spacing;
    vec2 cellCoord = fract(gridPos) - 0.5;
    vec2 cellIndex = floor(gridPos);

    // Unrotated center coordinate of this cell
    vec2 centerRot = (cellIndex + 0.5) * u_spacing;
    vec2 centerUnrot = rotate(centerRot, -u_angle);
    vec2 centerUV = centerUnrot / u_resolution;

    // Vertical distribution: thick & opaque based on gradient direction
    float verticalRamp = mix(centerUV.y, 1.0 - centerUV.y, u_invertGradient);
    
    // Dynamic visible fluid wave animation rippling across the grid
    float n1 = snoise(vec2(centerUV.x * 3.5 + u_time * 0.55, centerUV.y * 2.2 - u_time * 0.4));
    float n2 = sin(centerUV.x * 6.5 + u_time * 1.1) * cos(centerUV.y * 4.5 - u_time * 0.85);
    float wave = n1 * 0.24 + n2 * 0.12;
    
    float density = clamp(verticalRamp + wave * (0.35 + 0.65 * verticalRamp), 0.0, 1.0);

    // Mouse proximity lens/swell (smooth tactile reaction)
    float mouseDist = length((centerUnrot - u_mouse) / u_resolution.y);
    float mouseInfluence = smoothstep(0.32, 0.0, mouseDist);

    // Target size: thick & bold at the top with clear pulsating wave ripples, dissolving down
    float targetSize = mix(u_minRadius, u_maxRadius, pow(density, 1.15));
    targetSize += mouseInfluence * 0.12;
    targetSize = clamp(targetSize, u_minRadius, 0.46);

    // Distance metrics:
    // Crisp modern square tile with micro-rounded corners (clean, tight, anti-aliased)
    float cornerRadius = targetSize * 0.20;
    float distSquircle = sdRoundedBox(cellCoord, vec2(targetSize), cornerRadius);
    float distCircle = length(cellCoord) - targetSize;
    float dist = mix(distCircle, distSquircle, u_shape);

    // Smooth antialiased shape edge
    float antialias = 1.0 / u_spacing;
    float shapeAlpha = 1.0 - smoothstep(-antialias, antialias, dist);

    // Transparency gradient: thick opacity at the top, fading to completely transparent at the bottom
    float verticalAlpha = smoothstep(0.06, 0.90, density);
    float finalAlpha = shapeAlpha * u_alpha * verticalAlpha;

    gl_FragColor = vec4(u_color, finalAlpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export function HalftoneShader({
  className = "",
  shape = "square",
  dotSpacing = 11,
  dotColor = "#52525b",
  alpha = 0.75,
  angleDeg = 0,
  minRadius = 0.04,
  maxRadius = 0.45,
  speed = 0.85,
  interactive = true,
  fadeBottom = true,
  invertGradient = false,
}: HalftoneShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isSquare = shape === "square";

    const gl =
      canvas.getContext("webgl2", { alpha: true, antialias: true }) ||
      (canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
      }) as WebGLRenderingContext | null);

    if (!gl) {
      // 2D Canvas Fallback
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animationFrameId: number;
      let time = 0;
      const rgb = hexToRgb(dotColor);

      const render2D = () => {
        time += 0.016 * speed;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const spacing = dotSpacing;
        for (let x = 0; x < width; x += spacing) {
          for (let y = 0; y < height; y += spacing) {
            const u = x / width;
            // If invertGradient is true, thick at bottom (y/height). Otherwise thick at top (1 - y/height).
            const v = invertGradient
              ? Math.max(0, Math.min(1, y / height))
              : Math.max(0, Math.min(1, 1 - y / height));
            const wave = Math.sin(u * 5.0 + time * 0.35) * 0.08;
            const density = Math.max(0, Math.min(1, v + wave));
            const r = (minRadius + Math.pow(density, 1.2) * (maxRadius - minRadius)) * spacing;
            const cellAlpha = alpha * Math.pow(density, 1.1);

            if (cellAlpha < 0.01 || r < 0.2) continue;

            ctx.fillStyle = `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(
              rgb[1] * 255
            )}, ${Math.round(rgb[2] * 255)}, ${cellAlpha})`;

            if (isSquare) {
              const half = Math.max(0.5, r);
              ctx.fillRect(
                x + spacing / 2 - half,
                y + spacing / 2 - half,
                half * 2,
                half * 2
              );
            } else {
              ctx.beginPath();
              ctx.arc(
                x + spacing / 2,
                y + spacing / 2,
                Math.max(0.5, r),
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
        }
        animationFrameId = requestAnimationFrame(render2D);
      };

      const handleResize2D = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      };

      handleResize2D();
      window.addEventListener("resize", handleResize2D);
      render2D();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize2D);
      };
    }

    // WebGL Shader Pipeline
    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.warn("[HalftoneShader] Compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[HalftoneShader] Link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posAttribLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttribLocation);
    gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uColor = gl.getUniformLocation(program, "u_color");
    const uAlpha = gl.getUniformLocation(program, "u_alpha");
    const uSpacing = gl.getUniformLocation(program, "u_spacing");
    const uAngle = gl.getUniformLocation(program, "u_angle");
    const uMinRadius = gl.getUniformLocation(program, "u_minRadius");
    const uMaxRadius = gl.getUniformLocation(program, "u_maxRadius");
    const uFadeBottom = gl.getUniformLocation(program, "u_fadeBottom");
    const uShape = gl.getUniformLocation(program, "u_shape");
    const uInvertGradient = gl.getUniformLocation(program, "u_invertGradient");

    const colorRgb = hexToRgb(dotColor);
    const angleRad = (angleDeg * Math.PI) / 180;

    let mousePos = { x: -9999, y: -9999 };
    let targetMousePos = { x: -9999, y: -9999 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (
        clientX >= 0 &&
        clientX <= rect.width &&
        clientY >= 0 &&
        clientY <= rect.height
      ) {
        targetMousePos = {
          x: clientX * dpr,
          // Convert DOM y (0 at top) to WebGL y (0 at bottom)
          y: (rect.height - clientY) * dpr,
        };
      } else {
        targetMousePos = { x: -9999, y: -9999 };
      }
    };

    const handleMouseLeave = () => {
      targetMousePos = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let animationFrameId: number;
    let startTime = performance.now();

    function resizeCanvas() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl?.viewport(0, 0, width, height);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);
    resizeCanvas();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function render(currentTime: number) {
      if (!gl || !program || !canvas) return;

      const elapsed = (currentTime - startTime) * 0.001 * speed;

      // Smooth mouse interpolation
      mousePos.x += (targetMousePos.x - mousePos.x) * 0.12;
      mousePos.y += (targetMousePos.y - mousePos.y) * 0.12;

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mousePos.x, mousePos.y);
      gl.uniform1f(uTime, elapsed);
      gl.uniform3f(uColor, colorRgb[0], colorRgb[1], colorRgb[2]);
      gl.uniform1f(uAlpha, alpha);
      gl.uniform1f(uSpacing, dotSpacing * (window.devicePixelRatio || 1));
      gl.uniform1f(uAngle, angleRad);
      gl.uniform1f(uMinRadius, minRadius);
      gl.uniform1f(uMaxRadius, maxRadius);
      gl.uniform1f(uFadeBottom, fadeBottom ? 1.0 : 0.0);
      gl.uniform1f(uShape, isSquare ? 1.0 : 0.0);
      gl.uniform1f(uInvertGradient, invertGradient ? 1.0 : 0.0);

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [
    shape,
    dotSpacing,
    dotColor,
    alpha,
    angleDeg,
    minRadius,
    maxRadius,
    speed,
    interactive,
    fadeBottom,
    invertGradient,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`size-full pointer-events-none block ${className}`}
      aria-hidden="true"
    />
  );
}
