"use client";
// import React, { useRef, useEffect, useCallback, useMemo } from "react";
// import { gsap } from "gsap";
// import { InertiaPlugin } from "gsap/InertiaPlugin";

// gsap.registerPlugin(InertiaPlugin);

// const throttle = (func: (...args: any[]) => void, limit: number) => {
//   let lastCall = 0;
//   return function (this: any, ...args: any[]) {
//     const now = performance.now();
//     if (now - lastCall >= limit) {
//       lastCall = now;
//       func.apply(this, args);
//     }
//   };
// };

// interface Dot {
//   cx: number;
//   cy: number;
//   xOffset: number;
//   yOffset: number;
//   _inertiaApplied: boolean;
// }

// export interface DotGridProps {
//   dotSize?: number;
//   gap?: number;
//   baseColor?: string;
//   activeColor?: string;
//   proximity?: number;
//   speedTrigger?: number;
//   shockRadius?: number;
//   shockStrength?: number;
//   maxSpeed?: number;
//   resistance?: number;
//   returnDuration?: number;
//   className?: string;
//   style?: React.CSSProperties;
// }

// function hexToRgb(hex: string) {
//   const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
//   if (!m) return { r: 0, g: 0, b: 0 };
//   return {
//     r: parseInt(m[1], 16),
//     g: parseInt(m[2], 16),
//     b: parseInt(m[3], 16),
//   };
// }

// const DotGrid: React.FC<DotGridProps> = ({
//   dotSize = 16,
//   gap = 32,
//   baseColor = "#5227FF",
//   activeColor = "#5227FF",
//   proximity = 150,
//   speedTrigger = 100,
//   shockRadius = 250,
//   shockStrength = 5,
//   maxSpeed = 5000,
//   resistance = 750,
//   returnDuration = 1.5,
//   className = "",
//   style,
// }) => {
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const dotsRef = useRef<Dot[]>([]);
//   const pointerRef = useRef({
//     x: 0,
//     y: 0,
//     vx: 0,
//     vy: 0,
//     speed: 0,
//     lastTime: 0,
//     lastX: 0,
//     lastY: 0,
//   });

//   const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
//   const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

//   const circlePath = useMemo(() => {
//     if (typeof window === "undefined" || !window.Path2D) return null;

//     const p = new Path2D();
//     p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
//     return p;
//   }, [dotSize]);

//   const buildGrid = useCallback(() => {
//     const wrap = wrapperRef.current;
//     const canvas = canvasRef.current;
//     if (!wrap || !canvas) return;

//     const { width, height } = wrap.getBoundingClientRect();
//     const dpr = window.devicePixelRatio || 1;

//     canvas.width = width * dpr;
//     canvas.height = height * dpr;
//     canvas.style.width = `${width}px`;
//     canvas.style.height = `${height}px`;
//     const ctx = canvas.getContext("2d");
//     if (ctx) ctx.scale(dpr, dpr);

//     const cols = Math.floor((width + gap) / (dotSize + gap));
//     const rows = Math.floor((height + gap) / (dotSize + gap));
//     const cell = dotSize + gap;

//     const gridW = cell * cols - gap;
//     const gridH = cell * rows - gap;

//     const extraX = width - gridW;
//     const extraY = height - gridH;

//     const startX = extraX / 2 + dotSize / 2;
//     const startY = extraY / 2 + dotSize / 2;

//     const dots: Dot[] = [];
//     for (let y = 0; y < rows; y++) {
//       for (let x = 0; x < cols; x++) {
//         const cx = startX + x * cell;
//         const cy = startY + y * cell;
//         dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
//       }
//     }
//     dotsRef.current = dots;
//   }, [dotSize, gap]);

//   useEffect(() => {
//     if (!circlePath) return;

//     let rafId: number;
//     const proxSq = proximity * proximity;

//     const draw = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const { x: px, y: py } = pointerRef.current;

//       for (const dot of dotsRef.current) {
//         const ox = dot.cx + dot.xOffset;
//         const oy = dot.cy + dot.yOffset;
//         const dx = dot.cx - px;
//         const dy = dot.cy - py;
//         const dsq = dx * dx + dy * dy;

//         let style = baseColor;
//         if (dsq <= proxSq) {
//           const dist = Math.sqrt(dsq);
//           const t = 1 - dist / proximity;
//           const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
//           const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
//           const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
//           style = `rgb(${r},${g},${b})`;
//         }

//         ctx.save();
//         ctx.translate(ox, oy);
//         ctx.fillStyle = style;
//         ctx.fill(circlePath);
//         ctx.restore();
//       }

//       rafId = requestAnimationFrame(draw);
//     };

//     draw();
//     return () => cancelAnimationFrame(rafId);
//   }, [proximity, baseColor, activeRgb, baseRgb, circlePath]);

//   useEffect(() => {
//     buildGrid();
//     let ro: ResizeObserver | null = null;
//     if ("ResizeObserver" in window) {
//       ro = new ResizeObserver(buildGrid);
//       wrapperRef.current && ro.observe(wrapperRef.current);
//     } else {
//       (window as Window).addEventListener("resize", buildGrid);
//     }
//     return () => {
//       if (ro) ro.disconnect();
//       else window.removeEventListener("resize", buildGrid);
//     };
//   }, [buildGrid]);

//   useEffect(() => {
//     const onMove = (e: MouseEvent) => {
//       const now = performance.now();
//       const pr = pointerRef.current;
//       const dt = pr.lastTime ? now - pr.lastTime : 16;
//       const dx = e.clientX - pr.lastX;
//       const dy = e.clientY - pr.lastY;
//       let vx = (dx / dt) * 1000;
//       let vy = (dy / dt) * 1000;
//       let speed = Math.hypot(vx, vy);
//       if (speed > maxSpeed) {
//         const scale = maxSpeed / speed;
//         vx *= scale;
//         vy *= scale;
//         speed = maxSpeed;
//       }
//       pr.lastTime = now;
//       pr.lastX = e.clientX;
//       pr.lastY = e.clientY;
//       pr.vx = vx;
//       pr.vy = vy;
//       pr.speed = speed;

//       const rect = canvasRef.current!.getBoundingClientRect();
//       pr.x = e.clientX - rect.left;
//       pr.y = e.clientY - rect.top;

//       for (const dot of dotsRef.current) {
//         const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
//         if (speed > speedTrigger && dist < proximity && !dot._inertiaApplied) {
//           dot._inertiaApplied = true;
//           gsap.killTweensOf(dot);
//           const pushX = dot.cx - pr.x + vx * 0.005;
//           const pushY = dot.cy - pr.y + vy * 0.005;
//           gsap.to(dot, {
//             inertia: { xOffset: pushX, yOffset: pushY, resistance },
//             onComplete: () => {
//               gsap.to(dot, {
//                 xOffset: 0,
//                 yOffset: 0,
//                 duration: returnDuration,
//                 ease: "elastic.out(1,0.75)",
//               });
//               dot._inertiaApplied = false;
//             },
//           });
//         }
//       }
//     };

//     const onClick = (e: MouseEvent) => {
//       const rect = canvasRef.current!.getBoundingClientRect();
//       const cx = e.clientX - rect.left;
//       const cy = e.clientY - rect.top;
//       for (const dot of dotsRef.current) {
//         const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
//         if (dist < shockRadius && !dot._inertiaApplied) {
//           dot._inertiaApplied = true;
//           gsap.killTweensOf(dot);
//           const falloff = Math.max(0, 1 - dist / shockRadius);
//           const pushX = (dot.cx - cx) * shockStrength * falloff;
//           const pushY = (dot.cy - cy) * shockStrength * falloff;
//           gsap.to(dot, {
//             inertia: { xOffset: pushX, yOffset: pushY, resistance },
//             onComplete: () => {
//               gsap.to(dot, {
//                 xOffset: 0,
//                 yOffset: 0,
//                 duration: returnDuration,
//                 ease: "elastic.out(1,0.75)",
//               });
//               dot._inertiaApplied = false;
//             },
//           });
//         }
//       }
//     };

//     const throttledMove = throttle(onMove, 50);
//     window.addEventListener("mousemove", throttledMove, { passive: true });
//     window.addEventListener("click", onClick);

//     return () => {
//       window.removeEventListener("mousemove", throttledMove);
//       window.removeEventListener("click", onClick);
//     };
//   }, [
//     maxSpeed,
//     speedTrigger,
//     proximity,
//     resistance,
//     returnDuration,
//     shockRadius,
//     shockStrength,
//   ]);

//   return (
//     <section
//       className={`p-4 flex items-center justify-center h-full w-full relative ${className}`}
//       style={style}
//     >
//       <div ref={wrapperRef} className="w-full h-full relative">
//         <canvas
//           ref={canvasRef}
//           className="absolute inset-0 w-full h-full pointer-events-none"
//         />
//       </div>
//     </section>
//   );
// };

// export default DotGrid;

// /* eslint-disable react/no-unknown-property */
// import React, { forwardRef, useMemo, useRef, useLayoutEffect } from "react";
// import { Canvas, useFrame, useThree, RootState } from "@react-three/fiber";
// import { Color, Mesh, ShaderMaterial } from "three";
// import { IUniform } from "three";

// type NormalizedRGB = [number, number, number];

// const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
//   const clean = hex.replace("#", "");
//   const r = parseInt(clean.slice(0, 2), 16) / 255;
//   const g = parseInt(clean.slice(2, 4), 16) / 255;
//   const b = parseInt(clean.slice(4, 6), 16) / 255;
//   return [r, g, b];
// };

// interface UniformValue<T = number | Color> {
//   value: T;
// }

// interface SilkUniforms {
//   uSpeed: UniformValue<number>;
//   uScale: UniformValue<number>;
//   uNoiseIntensity: UniformValue<number>;
//   uColor: UniformValue<Color>;
//   uRotation: UniformValue<number>;
//   uTime: UniformValue<number>;
//   [uniform: string]: IUniform;
// }

// const vertexShader = `
// varying vec2 vUv;
// varying vec3 vPosition;

// void main() {
//   vPosition = position;
//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }
// `;

// const fragmentShader = `
// varying vec2 vUv;
// varying vec3 vPosition;

// uniform float uTime;
// uniform vec3  uColor;
// uniform float uSpeed;
// uniform float uScale;
// uniform float uRotation;
// uniform float uNoiseIntensity;

// const float e = 2.71828182845904523536;

// float noise(vec2 texCoord) {
//   float G = e;
//   vec2  r = (G * sin(G * texCoord));
//   return fract(r.x * r.y * (1.0 + texCoord.x));
// }

// vec2 rotateUvs(vec2 uv, float angle) {
//   float c = cos(angle);
//   float s = sin(angle);
//   mat2  rot = mat2(c, -s, s, c);
//   return rot * uv;
// }

// void main() {
//   float rnd        = noise(gl_FragCoord.xy);
//   vec2  uv         = rotateUvs(vUv * uScale, uRotation);
//   vec2  tex        = uv * uScale;
//   float tOffset    = uSpeed * uTime;

//   tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

//   float pattern = 0.6 +
//                   0.4 * sin(5.0 * (tex.x + tex.y +
//                                    cos(3.0 * tex.x + 5.0 * tex.y) +
//                                    0.02 * tOffset) +
//                            sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

//   vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
//   col.a = 1.0;
//   gl_FragColor = col;
// }
// `;

// interface SilkPlaneProps {
//   uniforms: SilkUniforms;
// }

// const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane(
//   { uniforms },
//   ref,
// ) {
//   const { viewport } = useThree();

//   useLayoutEffect(() => {
//     const mesh = ref as React.MutableRefObject<Mesh | null>;
//     if (mesh.current) {
//       mesh.current.scale.set(viewport.width, viewport.height, 1);
//     }
//   }, [ref, viewport]);

//   useFrame((_state: RootState, delta: number) => {
//     const mesh = ref as React.MutableRefObject<Mesh | null>;
//     if (mesh.current) {
//       const material = mesh.current.material as ShaderMaterial & {
//         uniforms: SilkUniforms;
//       };
//       material.uniforms.uTime.value += 0.1 * delta;
//     }
//   });

//   return (
//     <mesh ref={ref}>
//       <planeGeometry args={[1, 1, 1, 1]} />
//       <shaderMaterial
//         uniforms={uniforms}
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//       />
//     </mesh>
//   );
// });
// SilkPlane.displayName = "SilkPlane";

// export interface SilkProps {
//   speed?: number;
//   scale?: number;
//   color?: string;
//   noiseIntensity?: number;
//   rotation?: number;
// }

// const Silk: React.FC<SilkProps> = ({
//   speed = 5,
//   scale = 1,
//   color = "#7B7481",
//   noiseIntensity = 1.5,
//   rotation = 0,
// }) => {
//   const meshRef = useRef<Mesh>(null);

//   const uniforms = useMemo<SilkUniforms>(
//     () => ({
//       uSpeed: { value: speed },
//       uScale: { value: scale },
//       uNoiseIntensity: { value: noiseIntensity },
//       uColor: { value: new Color(...hexToNormalizedRGB(color)) },
//       uRotation: { value: rotation },
//       uTime: { value: 0 },
//     }),
//     [speed, scale, noiseIntensity, color, rotation],
//   );

//   return (
//     <Canvas dpr={[1, 2]} frameloop="always">
//       <SilkPlane ref={meshRef} uniforms={uniforms} />
//     </Canvas>
//   );
// };

// export default Silk;

import { useEffect, useRef, FC } from "react";
import { gsap } from "gsap";

interface GridMotionProps {
  items?: React.JSX.Element[];
  gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = "#171717",
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef<number>(window.innerWidth / 2);

  const totalItems = 28;
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`,
  );
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
              maxMoveAmount / 2) *
            direction;

          gsap.to(row, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-screen overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center z-[2]">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-7"
              style={{ willChange: "transform, filter" }}
              ref={(el) => {
                if (el) rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                      {typeof content === "string" &&
                      content.startsWith("http") ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default GridMotion;
