'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './CtaBanner.css';

export default function CtaBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let animId: number;
    let startTime = Date.now();

    const resize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // Vertex shader
    const vsSource = `
      attribute vec2 pos;
      void main() {
        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

    // Fragment shader — organic aurora nebula
    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;

      // Simplex noise helpers
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * snoise(p); p *= 2.02;
        f += 0.2500 * snoise(p); p *= 2.03;
        f += 0.1250 * snoise(p); p *= 2.01;
        f += 0.0625 * snoise(p);
        return f;
      }

      void main() {
        // Zoom in to the noise field so it creates slow, massive clouds
        vec2 uv = (gl_FragCoord.xy / uRes.xy) * 0.4;
        float t = uTime * 0.15;

        // Warp the UV space for organic feel
        vec2 q = vec2(0.0);
        q.x = fbm(uv + vec2(0.0, t * 0.7));
        q.y = fbm(uv + vec2(5.2, t * 0.5));

        vec2 r = vec2(0.0);
        r.x = fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.3);
        r.y = fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.25);

        float f = fbm(uv + 3.0 * r);

        // Color mapping — strictly rich black and deep purple palette
        vec3 col = vec3(0.008, 0.004, 0.016); // Rich Black base (var(--color-bg-primary))

        // Layer 1: dark purple void
        col = mix(col, vec3(0.15, 0.05, 0.3), clamp(f * f * 2.0, 0.0, 1.0));

        // Layer 2: deep purple (#4c1d95)
        col = mix(col, vec3(0.298, 0.114, 0.584), clamp(length(q) * 1.2, 0.0, 1.0));

        // Layer 3: vivid deep purple (#7c3aed)
        col = mix(col, vec3(0.486, 0.227, 0.929), clamp(length(r.x) * 0.8, 0.0, 1.0));

        // Layer 4: striking bright purple highlights
        col = mix(col, vec3(0.655, 0.545, 0.98), clamp(pow(f + 0.3, 3.0) * 0.6, 0.0, 1.0));

        // Concentrate aurora toward upper-right
        float mask = smoothstep(0.0, 1.0, uv.x * 0.6 + uv.y * 0.5);
        col *= mix(0.3, 1.4, mask);

        // Vignette — darken edges for cinematic framing
        float vig = 1.0 - pow(distance(uv, vec2(0.5, 0.45)) * 1.3, 2.0);
        col *= smoothstep(0.0, 1.0, vig + 0.4);

        // Final gamma + tonemap
        col = pow(col, vec3(0.85));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Compile shaders
    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uRes = gl.getUniformLocation(program, 'uRes');

    resize();
    window.addEventListener('resize', resize);

    let isVisible = true;
    let isIntersecting = true;

    const observer = new IntersectionObserver((entries) => {
      isIntersecting = entries[0].isIntersecting;
      if (isIntersecting && isVisible) animId = requestAnimationFrame(render);
    }, { threshold: 0 });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting) animId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible || !isIntersecting) return;
      const elapsed = (Date.now() - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section className="cta-neb" ref={sectionRef} aria-label="Call to action">
      <div className="container">
        <motion.div
          className="cta-neb__card"
          style={{ y }}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-5%' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* WebGL Shader Background */}
          <canvas ref={canvasRef} className="cta-neb__canvas" />

          {/* Content */}
          <div className="cta-neb__content">
            <motion.h2
              className="cta-neb__heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              We turn bold ideas into<br />
              <strong>powerful digital realities.</strong>
            </motion.h2>

            <motion.a
              href="/contact"
              className="cta-neb__btn"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>Let&apos;s work together</span>
              <span className="cta-neb__arrow">
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
