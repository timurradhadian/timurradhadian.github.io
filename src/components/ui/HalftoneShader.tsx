"use client";

import React, { useEffect, useRef } from "react";

interface HalftoneShaderProps {
  className?: string;
  dotSpacing?: number;
  dotColor?: string; // hex or rgb, e.g. "#18181b"
  alpha?: number; // 0.0 to 1.0
  angleDeg?: number; // e.g. 45 or 0
  minRadius?: number; // relative to cell, 0.0 to 0.5
  maxRadius?: number; // relative to cell, 0.0 to 0.5
  speed?: number; // animation speed multiplier
  interactive?: boolean; // track mouse
  fadeBottom?: boolean; // smooth fade towards bottom edge
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

vec2 rotate(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
    vec2 coord = gl_FragCoord.xy;
    vec2 uv = coord / u_resolution;

    // Rotate coordinate system for classic halftone screen angle
    vec2 rotCoord = rotate(coord, u_angle);

    // Compute cell and local distance in rotated grid
    vec2 gridPos = rotCoord / u_spacing;
    vec2 cellCoord = fract(gridPos) - 0.5;
    vec2 cellIndex = floor(gridPos);

    // Unrotated center coordinate of this cell
    vec2 centerRot = (cellIndex + 0.5) * u_spacing;
    vec2 centerUnrot = rotate(centerRot, -u_angle);
    vec2 centerUV = centerUnrot / u_resolution;

    // Ambient liquid wave fields (creates graceful organic swells)
    float wave1 = sin(centerUV.x * 6.28318 + u_time * 0.45) * 0.5 + 0.5;
    float wave2 = cos(centerUV.y * 5.0 - u_time * 0.35) * 0.5 + 0.5;
    float wave3 = sin((centerUV.x + centerUV.y) * 4.5 + u_time * 0.3) * 0.5 + 0.5;
    float ambientField = wave1 * 0.45 + wave2 * 0.3 + wave3 * 0.25;

    // Mouse proximity lens/swell
    float mouseDist = length((centerUnrot - u_mouse) / u_resolution.y);
    float mouseInfluence = exp(-mouseDist * 3.8);

    // Calculate dot radius for this cell
    float targetRadius = mix(u_minRadius, u_maxRadius, ambientField);
    targetRadius += mouseInfluence * 0.18;
    targetRadius = clamp(targetRadius, u_minRadius, u_maxRadius);

    // Distance to center of the dot
    float dist = length(cellCoord);

    // Smooth antialiased circular dot edge
    float antialias = 1.8 / u_spacing;
    float dotAlpha = 1.0 - smoothstep(targetRadius - antialias, targetRadius + antialias, dist);

    // Fade out towards bottom edge so it dissolves seamlessly into background
    float fade = 1.0;
    if (u_fadeBottom > 0.5) {
        fade = smoothstep(0.02, 0.55, centerUV.y);
    }

    float finalAlpha = dotAlpha * u_alpha * fade;
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
  dotSpacing = 16,
  dotColor = "#18181b",
  alpha = 0.22,
  angleDeg = 45,
  minRadius = 0.06,
  maxRadius = 0.42,
  speed = 1.0,
  interactive = true,
  fadeBottom = true,
}: HalftoneShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl2", { alpha: true, antialias: true }) ||
      (canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
      }) as WebGLRenderingContext | null);

    if (!gl) {
      // Fallback: simple 2D canvas if WebGL unavailable
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
            const v = y / height;
            const wave =
              Math.sin(u * 6.28 + time * 0.4) * 0.5 +
              0.5 +
              (Math.cos(v * 4.0 - time * 0.3) * 0.5 + 0.5);
            const r = (minRadius + wave * 0.15 * (maxRadius - minRadius)) * spacing;
            const fade = fadeBottom ? 1 - v : 1;

            ctx.beginPath();
            ctx.arc(x + spacing / 2, y + spacing / 2, Math.max(1, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(
              rgb[1] * 255
            )}, ${Math.round(rgb[2] * 255)}, ${alpha * fade})`;
            ctx.fill();
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

    // WebGL Implementation
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

    // Fullscreen quad
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
      mousePos.x += (targetMousePos.x - mousePos.x) * 0.1;
      mousePos.y += (targetMousePos.y - mousePos.y) * 0.1;

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
    dotSpacing,
    dotColor,
    alpha,
    angleDeg,
    minRadius,
    maxRadius,
    speed,
    interactive,
    fadeBottom,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`size-full pointer-events-none block ${className}`}
      aria-hidden="true"
    />
  );
}
