"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-expect-error cannon lacks TypeScript declarations
import CANNON_PKG from "cannon";

const CANNON = (CANNON_PKG as any).default || CANNON_PKG;

interface Bottle3DProps {
  className?: string;
  size?: string;
  volumeMl?: number;
}

// Traced silhouette profile from real bottle photo
const META = {
  profile: [
    [0.519, 0.0],
    [0.5443, 0.0316],
    [0.5791, 0.0633],
    [0.6234, 0.0949],
    [0.6835, 0.1266],
    [0.7405, 0.1582],
    [0.7816, 0.1899],
    [0.8133, 0.2215],
    [0.8418, 0.2532],
    [0.8703, 0.2848],
    [0.8797, 0.3165],
    [0.8924, 0.3481],
    [0.9241, 0.3797],
    [0.9335, 0.4114],
    [0.943, 0.443],
    [0.9525, 0.4747],
    [0.9652, 0.5063],
    [0.9557, 0.538],
    [0.962, 0.5696],
    [0.9652, 0.6013],
    [0.9684, 0.6329],
    [0.9652, 0.6646],
    [0.9652, 0.6962],
    [0.9652, 0.7278],
    [0.9652, 0.7595],
    [0.9684, 0.7911],
    [0.9715, 0.8228],
    [0.9715, 0.8544],
    [0.9715, 0.8861],
    [0.9715, 0.9177],
    [0.9684, 0.9494],
    [0.9652, 0.981],
    [0.9652, 1.0127],
    [0.9652, 1.0443],
    [0.9652, 1.0759],
    [0.9684, 1.1076],
    [0.9715, 1.1392],
    [0.9747, 1.1709],
    [0.9778, 1.2025],
    [0.981, 1.2342],
    [0.981, 1.2658],
    [0.981, 1.2975],
    [0.981, 1.3291],
    [0.981, 1.3608],
    [0.981, 1.3924],
    [0.981, 1.4241],
    [0.981, 1.4557],
    [0.981, 1.4873],
    [0.981, 1.519],
    [0.981, 1.5506],
    [0.981, 1.5823],
    [0.981, 1.6139],
    [0.981, 1.6456],
    [0.981, 1.6772],
    [0.981, 1.7089],
    [0.981, 1.7405],
    [0.981, 1.7722],
    [0.981, 1.8038],
    [0.981, 1.8354],
    [0.981, 1.8671],
    [0.981, 1.8987],
    [0.981, 1.9304],
    [0.981, 1.962],
    [0.981, 1.9937],
    [0.981, 2.0253],
    [0.981, 2.057],
    [0.981, 2.0886],
    [0.981, 2.1203],
    [0.981, 2.1519],
    [0.981, 2.1835],
    [0.981, 2.2152],
    [0.981, 2.2468],
    [0.981, 2.2785],
    [0.981, 2.3101],
    [0.981, 2.3418],
    [0.981, 2.3734],
    [0.981, 2.4051],
    [0.981, 2.4367],
    [0.9842, 2.4684],
    [0.9873, 2.5],
    [0.9905, 2.5316],
    [0.9937, 2.5633],
    [0.9968, 2.5949],
    [0.9968, 2.6266],
    [0.9968, 2.6582],
    [0.9968, 2.6899],
    [0.9968, 2.7215],
    [0.9968, 2.7532],
    [0.9968, 2.7848],
    [0.9968, 2.8165],
    [0.9968, 2.8481],
    [1.0, 2.8797],
    [1.0032, 2.9114],
    [1.0032, 2.943],
    [1.0032, 2.9747],
    [1.0032, 3.0063],
    [1.0, 3.038],
    [1.0, 3.0696],
    [1.0, 3.1013],
    [1.0, 3.1329],
    [1.0032, 3.1646],
    [1.0032, 3.1962],
    [1.0, 3.2278],
    [1.0032, 3.2595],
    [1.0063, 3.2911],
    [1.0032, 3.3228],
    [1.0032, 3.3544],
    [1.0032, 3.3861],
    [1.0032, 3.4177],
    [1.0, 3.4494],
    [1.0, 3.481],
    [1.0, 3.5127],
    [1.0, 3.5443],
    [0.9905, 3.5759],
    [0.9842, 3.6076],
    [0.9778, 3.6392],
    [0.9652, 3.6709],
    [0.9589, 3.7025],
    [0.9462, 3.7342],
    [0.9304, 3.7658],
    [0.9082, 3.7975],
    [0.8861, 3.8291],
    [0.8481, 3.8608],
    [0.8196, 3.8924],
    [0.788, 3.9241],
    [0.7468, 3.9557],
    [0.7025, 3.9873],
    [0.6551, 4.019],
    [0.5981, 4.0506],
    [0.5696, 4.0823],
    [0.5316, 4.1139],
    [0.4905, 4.1456],
    [0.4557, 4.1772],
    [0.4335, 4.2089],
    [0.3892, 4.2405],
    [0.3703, 4.2722],
    [0.3639, 4.3038],
    [0.3639, 4.3354],
    [0.3639, 4.3671],
    [0.3829, 4.3987],
    [0.3987, 4.4304],
    [0.4146, 4.462],
  ],
  topY: 4.462,
  capCenter: 4.6835,
  capR: 0.4433,
  capH: 0.443,
};

export function Bottle3D({
  className = "w-full h-[400px] sm:h-[440px]",
  size = "500 ml",
  volumeMl = 500,
}: Bottle3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const redrawRef = useRef<(() => void) | null>(null);
  const scaleRef = useRef<{ setScale: (s: number) => void } | null>(null);

  const displaySize = size || (volumeMl ? `${volumeMl}ml` : "500 ml");

  // Update label and bottle scale when product size changes
  useEffect(() => {
    if (redrawRef.current) {
      redrawRef.current();
    }
    if (scaleRef.current) {
      const isLarge =
        (volumeMl && volumeMl >= 1000) ||
        /1000|1\s*l|2\s*l|family/i.test(size || "");
      scaleRef.current.setScale(isLarge ? 1.08 : 0.98);
    }
  }, [displaySize, volumeMl, size]);

  // Initialize Three.js + Cannon simulation
  useEffect(() => {
    if (!containerRef.current) return;

    const box = containerRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ================= Scene Setup ================= */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    box.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 4.6, 13.5);
    camera.lookAt(0, 2.5, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe8dcc0, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.65);
    key.position.set(3, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe2b0, 0.45);
    rim.position.set(-6, 3, -4);
    scene.add(rim);

    const bottle = new THREE.Group();
    scene.add(bottle);

    // Initial scale adjustment for size
    const isLarge =
      (volumeMl && volumeMl >= 1000) ||
      /1000|1\s*l|2\s*l|family/i.test(size || "");
    const baseScale = isLarge ? 1.08 : 0.98;
    bottle.scale.set(baseScale, baseScale, baseScale);

    scaleRef.current = {
      setScale: (s: number) => {
        bottle.scale.set(s, s, s);
      },
    };

    /* ================= Clear Glass Shell ================= */
    const pts = [new THREE.Vector2(0, 0)].concat(
      META.profile.map((p) => new THREE.Vector2(p[0], p[1]))
    );
    const rTop = META.profile[META.profile.length - 1][0];
    pts.push(
      new THREE.Vector2(rTop * 0.8, META.topY),
      new THREE.Vector2(rTop * 0.8, META.topY - 0.12)
    );
    const glass = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 96),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.18,
        shininess: 240,
        specular: 0xffffff,
        depthWrite: false,
      })
    );
    glass.renderOrder = 3;
    bottle.add(glass);

    /* ================= Liquid Vinegar ================= */
    const LEVEL = 4.34;
    const step = META.topY / (META.profile.length - 1);
    const Rat = (y: number) =>
      META.profile[
        Math.min(META.profile.length - 1, Math.max(0, Math.round(y / step)))
      ][0];
    const lp = [new THREE.Vector2(0, 0.05)];
    META.profile.forEach((p) => {
      if (p[1] > 0.05 && p[1] < LEVEL)
        lp.push(new THREE.Vector2(Math.max(p[0] - 0.045, 0.02), p[1]));
    });
    lp.push(
      new THREE.Vector2(lp[lp.length - 1].x, LEVEL),
      new THREE.Vector2(0, LEVEL)
    );
    const liquid = new THREE.Mesh(
      new THREE.LatheGeometry(lp, 64),
      new THREE.MeshPhongMaterial({
        color: 0xe3a11d,
        emissive: 0x8a4a00,
        emissiveIntensity: 0.65,
        shininess: 120,
        specular: 0xfff0b8,
        side: THREE.DoubleSide,
      })
    );
    liquid.renderOrder = 1;
    bottle.add(liquid);

    /* ================= Bubbles in Vinegar ================= */
    const bc = document.createElement("canvas");
    bc.width = bc.height = 64;
    const bg2 = bc.getContext("2d");
    if (bg2) {
      const bgr = bg2.createRadialGradient(32, 32, 2, 32, 32, 30);
      bgr.addColorStop(0, "rgba(255,255,255,.15)");
      bgr.addColorStop(0.75, "rgba(255,248,215,.35)");
      bgr.addColorStop(0.9, "rgba(255,255,255,.95)");
      bgr.addColorStop(1, "rgba(255,255,255,0)");
      bg2.fillStyle = bgr;
      bg2.fillRect(0, 0, 64, 64);
    }
    const NB = 42;
    const bArr = new Float32Array(NB * 3);
    const bData: { y: number; f: number; a: number; sp: number }[] = [];
    for (let i = 0; i < NB; i++) {
      bData.push({
        y: 3.3 + Math.random() * 1.0,
        f: Math.random(),
        a: Math.random() * 6.28,
        sp: 0.12 + Math.random() * 0.22,
      });
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute("position", new THREE.BufferAttribute(bArr, 3));
    const bubbles = new THREE.Points(
      bGeo,
      new THREE.PointsMaterial({
        size: 0.075,
        map: new THREE.CanvasTexture(bc),
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    bubbles.renderOrder = 2;
    bubbles.frustumCulled = false;
    bottle.add(bubbles);

    function updateBubbles(dt: number) {
      for (let i = 0; i < NB; i++) {
        const b = bData[i];
        b.y += b.sp * dt;
        b.a += 0.6 * dt;
        if (b.y > LEVEL - 0.05) {
          b.y = 3.3 + Math.random() * 0.15;
          b.f = Math.random();
          b.a = Math.random() * 6.28;
        }
        const r = b.f * Math.max(Rat(b.y) - 0.12, 0.02);
        bArr[i * 3] = Math.sin(b.a) * r;
        bArr[i * 3 + 1] = b.y;
        bArr[i * 3 + 2] = Math.cos(b.a) * r;
      }
      bGeo.attributes.position.needsUpdate = true;
    }

    /* ================= Crisp Authentic Label ================= */
    const LW = 576;
    const LH = 275;
    const K = 3072 / LW;
    const lc = document.createElement("canvas");
    lc.width = 3072;
    lc.height = Math.round(LH * K);
    const F1 = '"Baloo 2","Arial Rounded MT Bold","Trebuchet MS",sans-serif';
    const F2 = 'Montserrat,"Arial Black",Arial,sans-serif';

    function applePath(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      c.beginPath();
      c.moveTo(x, y - r * 0.62);
      c.bezierCurveTo(x + r * 0.25, y - r * 1.0, x + r * 1.05, y - r * 0.85, x + r * 1.0, y - r * 0.05);
      c.bezierCurveTo(x + r * 0.95, y + r * 0.75, x + r * 0.45, y + r * 1.1, x, y + r * 0.95);
      c.bezierCurveTo(x - r * 0.45, y + r * 1.1, x - r * 0.95, y + r * 0.75, x - r * 1.0, y - r * 0.05);
      c.bezierCurveTo(x - r * 1.05, y - r * 0.85, x - r * 0.25, y - r * 1.0, x, y - r * 0.62);
      c.closePath();
    }

    function stemLeaf(c: CanvasRenderingContext2D, r: number) {
      c.strokeStyle = "#4a2a14";
      c.lineWidth = r * 0.09;
      c.beginPath();
      c.moveTo(0, -r * 0.6);
      c.quadraticCurveTo(r * 0.05, -r * 0.9, r * 0.2, -r * 1.1);
      c.stroke();
      const lg = c.createLinearGradient(0, -r * 1.2, r, -r * 0.8);
      lg.addColorStop(0, "#53b84a");
      lg.addColorStop(1, "#1f7a2a");
      c.fillStyle = lg;
      c.beginPath();
      c.moveTo(r * 0.12, -r * 0.85);
      c.quadraticCurveTo(r * 0.6, -r * 1.3, r * 0.98, -r * 0.95);
      c.quadraticCurveTo(r * 0.55, -r * 0.7, r * 0.12, -r * 0.85);
      c.fill();
    }

    function drawApple(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      c.save();
      c.translate(x, y);
      applePath(c, 0, 0, r);
      const gr = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
      gr.addColorStop(0, "#ff7a6b");
      gr.addColorStop(0.45, "#d9262e");
      gr.addColorStop(1, "#7f0f1c");
      c.fillStyle = gr;
      c.fill();
      c.fillStyle = "rgba(255,255,255,.35)";
      c.beginPath();
      c.ellipse(-r * 0.45, -r * 0.35, r * 0.16, r * 0.28, -0.5, 0, 7);
      c.fill();
      stemLeaf(c, r);
      c.restore();
    }

    function drawHalf(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      c.save();
      c.translate(x, y);
      applePath(c, 0, 0, r);
      const rg = c.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
      rg.addColorStop(0, "#f2564a");
      rg.addColorStop(0.5, "#cf222b");
      rg.addColorStop(1, "#6f0c18");
      c.fillStyle = rg;
      c.fill();
      applePath(c, 0, r * 0.015, r * 0.87);
      const fg = c.createRadialGradient(0, r * 0.05, r * 0.1, 0, 0, r * 0.95);
      fg.addColorStop(0, "#fffef7");
      fg.addColorStop(0.7, "#fbf0cf");
      fg.addColorStop(1, "#ecd9a0");
      c.fillStyle = fg;
      c.fill();
      c.strokeStyle = "rgba(190,150,90,.45)";
      c.lineWidth = r * 0.03;
      c.stroke();
      c.fillStyle = "#efdca2";
      c.beginPath();
      c.ellipse(0, r * 0.08, r * 0.2, r * 0.34, 0, 0, 7);
      c.fill();
      c.strokeStyle = "rgba(160,120,60,.65)";
      c.lineWidth = r * 0.03;
      c.stroke();
      c.fillStyle = "#4b2a14";
      [-1, 1].forEach((s) => {
        c.beginPath();
        c.ellipse(s * r * 0.07, r * 0.13, r * 0.045, r * 0.095, s * 0.25, 0, 7);
        c.fill();
      });
      c.fillStyle = "rgba(255,255,255,.55)";
      c.beginPath();
      c.ellipse(-r * 0.5, -r * 0.3, r * 0.1, r * 0.22, -0.6, 0, 7);
      c.fill();
      stemLeaf(c, r);
      c.restore();
    }

    function drop(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      const d = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      d.addColorStop(0, "rgba(255,255,255,.95)");
      d.addColorStop(0.6, "rgba(255,230,230,.45)");
      d.addColorStop(1, "rgba(255,255,255,.1)");
      c.fillStyle = d;
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
    }

    function spaced(
      c: CanvasRenderingContext2D,
      txt: string,
      cx: number,
      y: number,
      sp: number,
      mode: "stroke" | "fill"
    ) {
      const ws = txt.split("").map((ch) => c.measureText(ch).width);
      const total = ws.reduce((a, b) => a + b, 0) + sp * (txt.length - 1);
      let x = cx - total / 2;
      c.textAlign = "left";
      txt.split("").forEach((ch, i) => {
        if (mode === "stroke") c.strokeText(ch, x, y);
        else c.fillText(ch, x, y);
        x += ws[i] + sp;
      });
      c.textAlign = "center";
    }

    function drawLabel() {
      const g = lc.getContext("2d");
      if (!g) return;

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, lc.width, lc.height);
      g.scale(K, K);
      g.lineJoin = "round";
      g.lineCap = "round";
      g.textAlign = "center";
      g.textBaseline = "alphabetic";

      const bgG = g.createLinearGradient(0, 0, 0, LH);
      bgG.addColorStop(0, "#3a0a15");
      bgG.addColorStop(0.38, "#6e1322");
      bgG.addColorStop(1, "#b52433");
      g.fillStyle = bgG;
      g.fillRect(0, 0, LW, LH);

      g.globalAlpha = 0.1; // faint apple watermark pattern on sides
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 16; col++) {
          const x = col * 38 + (row % 2 ? 19 : 0);
          const y = 22 + row * 34;
          if (Math.abs(x - 288) > 120 && x < LW) drawApple(g, x, y, 9);
        }
      }
      g.globalAlpha = 1;

      const vg = g.createLinearGradient(0, 0, LW, 0);
      vg.addColorStop(0, "rgba(0,0,0,.35)");
      vg.addColorStop(0.16, "rgba(0,0,0,0)");
      vg.addColorStop(0.84, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,.35)");
      g.fillStyle = vg;
      g.fillRect(0, 0, LW, LH);

      const gl = g.createRadialGradient(288, 215, 5, 288, 215, 120);
      gl.addColorStop(0, "rgba(255,130,120,.45)");
      gl.addColorStop(1, "rgba(255,130,120,0)");
      g.fillStyle = gl;
      g.fillRect(160, 100, 256, 175);

      // Logo
      drawApple(g, 236, 44, 17);
      g.font = "800 46px " + F1;
      g.lineWidth = 10;
      g.strokeStyle = "rgba(0,0,0,.4)";
      g.strokeText("Gid's", 291.5, 67.5);
      g.lineWidth = 8;
      g.strokeStyle = "#ffffff";
      g.strokeText("Gid's", 290, 66);
      const gg = g.createLinearGradient(0, 30, 0, 70);
      gg.addColorStop(0, "#6fcf55");
      gg.addColorStop(1, "#1f7a2a");
      g.fillStyle = gg;
      g.fillText("Gid's", 290, 66);
      g.fillStyle = "#2f8a34";
      g.strokeStyle = "#fff";
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(236, 75);
      g.quadraticCurveTo(290, 88, 346, 72);
      g.quadraticCurveTo(292, 80, 236, 75);
      g.fill();
      g.stroke();

      // Product Name
      g.font = "800 16px " + F2;
      g.lineWidth = 3.4;
      g.strokeStyle = "#4a0a14";
      spaced(g, "APPLE CIDER", 288, 101, 1.4, "stroke");
      g.fillStyle = "#fff6dc";
      spaced(g, "APPLE CIDER", 288, 101, 1.4, "fill");

      g.font = "800 29px " + F2;
      g.lineWidth = 4.6;
      g.strokeStyle = "#4a0a14";
      spaced(g, "VINEGAR", 288, 129, 2, "stroke");
      const vgg = g.createLinearGradient(0, 106, 0, 130);
      vgg.addColorStop(0, "#ffffff");
      vgg.addColorStop(1, "#f6d27a");
      g.fillStyle = vgg;
      spaced(g, "VINEGAR", 288, 129, 2, "fill");

      // Dynamic Size Tagline
      const sizeTag = `${displaySize.toUpperCase()} · RAW WITH THE MOTHER`;
      g.font = "italic 800 7px " + F2;
      g.fillStyle = "#ffb347";
      spaced(g, sizeTag, 288, 142, 1.1, "fill");
      g.strokeStyle = "rgba(246,196,83,.75)";
      g.lineWidth = 0.7;
      g.beginPath();
      g.moveTo(220, 150);
      g.lineTo(356, 150);
      g.stroke();

      // Apples & droplets
      drawApple(g, 256, 214, 34);
      drawHalf(g, 318, 210, 42);
      drop(g, 232, 190, 3.2);
      drop(g, 352, 172, 2.6);
      drop(g, 340, 250, 3);
      drop(g, 238, 242, 2.2);

      // Back panels
      g.fillStyle = "rgba(255,240,210,.85)";
      g.font = "800 17px " + F1;
      g.fillText("Gid's", 62, 118);
      g.font = "800 6px " + F2;
      g.fillText("APPLE CIDER VINEGAR", 62, 130);
      g.font = "700 6px " + F2;
      g.fillText("Shake well before use.", 514, 118);
      g.fillText("Cape Coast, Ghana.", 514, 128);

      // Top and bottom gold bands
      g.fillStyle = "#f8ecc7";
      g.fillRect(0, 0, LW, 5);
      g.fillRect(0, LH - 5, LW, 5);
      g.fillStyle = "#e0a93b";
      g.fillRect(0, 5, LW, 1.2);
      g.fillRect(0, LH - 6.2, LW, 1.2);
    }

    drawLabel();
    const labelTex = new THREE.CanvasTexture(lc);
    labelTex.anisotropy = 8;

    redrawRef.current = () => {
      drawLabel();
      labelTex.needsUpdate = true;
    };

    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('800 40px "Baloo 2"'),
        document.fonts.load("800 20px Montserrat"),
      ])
        .then(() => {
          drawLabel();
          labelTex.needsUpdate = true;
        })
        .catch(() => {});
    }

    const ARC = (330 * Math.PI) / 180;
    const LABEL_H = 2.75;
    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.988, 0.988, LABEL_H, 160, 1, true, -ARC / 2, ARC),
      new THREE.MeshPhongMaterial({
        map: labelTex,
        shininess: 45,
        specular: 0x2a2a2a,
      })
    );
    label.position.y = (0.54 + 3.29) / 2;
    bottle.add(label);

    /* ================= Ribbed Black Cap ================= */
    const rc = document.createElement("canvas");
    rc.width = 512;
    rc.height = 64;
    const rg = rc.getContext("2d");
    if (rg) {
      rg.fillStyle = "#161616";
      rg.fillRect(0, 0, 512, 64);
      rg.fillStyle = "#333";
      for (let i = 0; i < 96; i++) {
        rg.fillRect((i * 512) / 96, 0, 2.2, 64);
      }
    }
    const ribTex = new THREE.CanvasTexture(rc);
    const capDark = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 50,
      specular: 0x444444,
    });
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(
        META.capR,
        META.capR,
        META.capH,
        64,
        1,
        false,
        -Math.PI,
        Math.PI * 2
      ),
      [
        new THREE.MeshPhongMaterial({
          map: ribTex,
          bumpMap: ribTex,
          bumpScale: 1.2,
          shininess: 60,
          specular: 0x555555,
        }),
        capDark,
        capDark,
      ]
    );
    scene.add(cap);

    /* ================= Glass Specular Highlights ================= */
    const sc2 = document.createElement("canvas");
    sc2.width = 64;
    sc2.height = 256;
    const s2 = sc2.getContext("2d");
    if (s2) {
      const sh = s2.createLinearGradient(0, 0, 64, 0);
      sh.addColorStop(0, "rgba(255,255,255,0)");
      sh.addColorStop(0.5, "rgba(255,255,255,.9)");
      sh.addColorStop(1, "rgba(255,255,255,0)");
      s2.fillStyle = sh;
      s2.fillRect(0, 0, 64, 256);
      s2.globalCompositeOperation = "destination-in";
      const sv = s2.createLinearGradient(0, 0, 0, 256);
      sv.addColorStop(0, "rgba(0,0,0,0)");
      sv.addColorStop(0.1, "#000");
      sv.addColorStop(0.9, "#000");
      sv.addColorStop(1, "rgba(0,0,0,0)");
      s2.fillStyle = sv;
      s2.fillRect(0, 0, 64, 256);
    }
    const streakTex = new THREE.CanvasTexture(sc2);
    const gloss = new THREE.Group();
    scene.add(gloss);
    [
      [-0.78, 0.24, 2.9, 0.5],
      [0.62, 0.08, 2.6, 0.35],
    ].forEach(([th, w, h, op]) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.996, 0.996, h, 24, 1, true, th - w / 2, w),
        new THREE.MeshBasicMaterial({
          map: streakTex,
          transparent: true,
          opacity: op,
          depthWrite: false,
        })
      );
      m.position.y = 1.9;
      m.renderOrder = 6;
      gloss.add(m);
    });

    /* ================= Floor Shadow ================= */
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sg = sc.getContext("2d");
    if (sg) {
      const gr = sg.createRadialGradient(64, 64, 4, 64, 64, 62);
      gr.addColorStop(0, "rgba(60,40,10,.45)");
      gr.addColorStop(1, "rgba(60,40,10,0)");
      sg.fillStyle = gr;
      sg.fillRect(0, 0, 128, 128);
    }
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(sc),
        transparent: true,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.02;
    scene.add(shadow);

    /* ================= Physics World (Cannon.js) ================= */
    const world = new CANNON.World();
    world.gravity.set(0, -30, 0);
    world.allowSleep = false;
    world.solver.iterations = 14;

    const mGround = new CANNON.Material();
    const mBottle = new CANNON.Material();
    const mCap = new CANNON.Material();

    world.addContactMaterial(
      new CANNON.ContactMaterial(mGround, mBottle, { friction: 0.06, restitution: 0.05 })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(mGround, mCap, { friction: 0.5, restitution: 0.45 })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(mBottle, mCap, { friction: 0.3, restitution: 0.3 })
    );

    const G = 1,
      GB = 2,
      GC = 4;
    function plane(pos: number[], axis: number[], ang: number) {
      const b = new CANNON.Body({ mass: 0, material: mGround });
      b.addShape(new CANNON.Plane());
      b.quaternion.setFromAxisAngle(
        new CANNON.Vec3(axis[0], axis[1], axis[2]),
        ang
      );
      b.position.set(pos[0], pos[1], pos[2]);
      b.collisionFilterGroup = G;
      b.collisionFilterMask = 0xffff;
      world.addBody(b);
    }
    plane([0, 0, 0], [1, 0, 0], -Math.PI / 2);
    plane([-3.4, 0, 0], [0, 1, 0], Math.PI / 2);
    plane([3.4, 0, 0], [0, 1, 0], -Math.PI / 2);
    plane([0, 0, -2.6], [0, 1, 0], 0);
    plane([0, 0, 2.6], [0, 1, 0], Math.PI);

    const ZtoY = new CANNON.Quaternion();
    ZtoY.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    const cyl = (r: number, h: number) => new CANNON.Cylinder(r, r, h, 20);

    const bBody = new CANNON.Body({
      mass: 1.2,
      material: mBottle,
      linearDamping: 0.2,
      angularDamping: 0.35,
    });
    bBody.addShape(cyl(0.97, 3.45), new CANNON.Vec3(0, 1.82, 0), ZtoY);
    bBody.addShape(cyl(0.6, 0.56), new CANNON.Vec3(0, 3.83, 0), ZtoY);
    bBody.addShape(cyl(0.36, 0.35), new CANNON.Vec3(0, 4.28, 0), ZtoY);
    bBody.collisionFilterGroup = GB;
    bBody.collisionFilterMask = G | GC;
    bBody.position.set(0, 0.01, 0);
    world.addBody(bBody);

    const CAP_Y = META.capCenter;
    const cBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      material: mCap,
      linearDamping: 0.1,
      angularDamping: 0.2,
    });
    cBody.addShape(
      new CANNON.Cylinder(META.capR, META.capR, META.capH, 16),
      new CANNON.Vec3(0, 0, 0),
      ZtoY
    );
    cBody.collisionFilterGroup = GC;
    cBody.collisionFilterMask = 0;
    world.addBody(cBody);

    let capState = "attached";
    let capT = 0;
    let phase = "up";
    const tmp = new CANNON.Vec3();

    function neck(out: any, lift: number) {
      tmp.set(0, CAP_Y + lift, 0);
      bBody.quaternion.vmult(tmp, out);
      out.vadd(bBody.position, out);
      return out;
    }

    function setCapKinematic() {
      cBody.type = CANNON.Body.KINEMATIC;
      cBody.mass = 0;
      cBody.updateMassProperties();
      cBody.collisionFilterMask = 0;
      cBody.velocity.set(0, 0, 0);
      cBody.angularVelocity.set(0, 0, 0);
    }

    function pop() {
      capState = "free";
      capT = 0;
      cBody.type = CANNON.Body.DYNAMIC;
      cBody.mass = 0.08;
      cBody.updateMassProperties();
      cBody.collisionFilterMask = G;
      const side = Math.random() < 0.5 ? -1 : 1;
      const aspect = Math.min(1, camera.aspect);
      cBody.velocity.set(
        bBody.velocity.x + side * (2.8 + Math.random() * 0.6) * aspect,
        8,
        (Math.random() - 0.5) * 2
      );
      cBody.angularVelocity.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
    }

    function recall() {
      capState = "returning";
      phase = "up";
      setCapKinematic();
    }

    let hover = false;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;

    function setHover(v: boolean) {
      if (v === hover) return;
      hover = v;
      if (v) {
        if (capState !== "free") pop();
      } else if (capState !== "attached") {
        recall();
      }
    }

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHover(true);
    };
    const onPointerLeave = () => {
      dragging = false;
      setHover(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastT = e.timeStamp;
      try {
        box.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      if (e.pointerType !== "mouse") setHover(!hover);
    };
    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dt = Math.max((e.timeStamp - lastT) / 1000, 0.008);
      lastX = e.clientX;
      lastT = e.timeStamp;
      if (dragging) {
        bBody.angularVelocity.y = Math.max(-14, Math.min(14, (dx * 0.012) / dt));
      } else if (hover) {
        bBody.angularVelocity.z = Math.max(
          -1.5,
          Math.min(1.5, bBody.angularVelocity.z - dx * 0.03)
        );
      }
    };

    box.addEventListener("pointerenter", onPointerEnter);
    box.addEventListener("pointerleave", onPointerLeave);
    box.addEventListener("pointerdown", onPointerDown);
    box.addEventListener("pointerup", onPointerUp);
    box.addEventListener("pointermove", onPointerMove);

    function resetBottle() {
      bBody.position.set(0, 0.01, 0);
      bBody.quaternion.set(0, 0, 0, 1);
      bBody.velocity.set(0, 0, 0);
      bBody.angularVelocity.set(0, 0, 0);
      if (capState !== "attached") {
        capState = "attached";
        setCapKinematic();
      }
    }

    function resize() {
      const w = box.clientWidth || 340;
      const h = box.clientHeight || 280;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 38 : 30;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(box);
    resize();

    const clock = new THREE.Clock();
    const euler = new THREE.Euler();
    const gE = new THREE.Euler(0, 0, 0, "YXZ");
    const up = new CANNON.Vec3();
    const target = new CANNON.Vec3();
    const Y1 = new CANNON.Vec3(0, 1, 0);

    let animId: number;

    function frame() {
      animId = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const w = bBody.angularVelocity;
      const v = bBody.velocity;
      euler.setFromQuaternion(bottle.quaternion, "YXZ");

      if (!dragging) {
        if (hover) {
          if (!reduce) w.y += (3.2 - w.y) * Math.min(1, dt * 3);
        } else {
          // mouse away: smoothly restore original upright pose
          w.y += (-30 * euler.y - 9 * w.y) * dt;
          w.x += (-30 * euler.x - 9 * w.x) * dt;
          w.z += (-30 * euler.z - 9 * w.z) * dt;
        }
      }

      const kp = hover ? 6 : 24;
      const kd = hover ? 4 : 9;
      v.x += (-kp * bBody.position.x - kd * v.x) * dt;
      v.z += (-kp * bBody.position.z - kd * v.z) * dt;

      if (
        !hover &&
        !dragging &&
        capState === "attached" &&
        Math.abs(euler.x) + Math.abs(euler.y) + Math.abs(euler.z) < 0.02 &&
        Math.hypot(bBody.position.x, bBody.position.z) < 0.02 &&
        w.length() < 0.15
      ) {
        bBody.position.set(0, 0.01, 0);
        bBody.quaternion.set(0, 0, 0, 1);
        v.set(0, 0, 0);
        w.set(0, 0, 0);
      }

      bBody.quaternion.vmult(Y1, up);
      if (up.y < 0.5 || bBody.position.y > 2.5) resetBottle();

      if (capState === "attached") {
        neck(cBody.position, 0);
        cBody.quaternion.copy(bBody.quaternion);
      } else if (capState === "free") {
        capT += dt;
        if (capT > 0.35) cBody.collisionFilterMask = G | GB;
      } else {
        neck(target, phase === "up" ? 1.6 : 0);
        const k = 1 - Math.exp(-dt * (phase === "up" ? 6 : 9));
        cBody.position.x += (target.x - cBody.position.x) * k;
        cBody.position.y += (target.y - cBody.position.y) * k;
        cBody.position.z += (target.z - cBody.position.z) * k;
        cBody.quaternion.slerp(bBody.quaternion, k, cBody.quaternion);
        const d = cBody.position.distanceTo(target);
        if (phase === "up" && d < 0.3) phase = "down";
        else if (phase === "down" && d < 0.04) {
          capState = "attached";
          neck(cBody.position, 0);
          cBody.quaternion.copy(bBody.quaternion);
        }
      }

      world.step(1 / 60, dt, 4);

      bottle.position.copy(bBody.position);
      bottle.quaternion.copy(bBody.quaternion);
      cap.position.copy(cBody.position);
      cap.quaternion.copy(cBody.quaternion);
      gE.set(euler.x, 0, euler.z, "YXZ");
      gloss.position.copy(bBody.position);
      gloss.quaternion.setFromEuler(gE);
      shadow.position.x = bBody.position.x;
      shadow.position.z = bBody.position.z;

      updateBubbles(dt);
      renderer.render(scene, camera);
    }

    frame();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      box.removeEventListener("pointerenter", onPointerEnter);
      box.removeEventListener("pointerleave", onPointerLeave);
      box.removeEventListener("pointerdown", onPointerDown);
      box.removeEventListener("pointerup", onPointerUp);
      box.removeEventListener("pointermove", onPointerMove);
      if (renderer.domElement && box.contains(renderer.domElement)) {
        box.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative ${className} select-none`}>
      <div
        ref={containerRef}
        id="bottle-3d"
        className="w-full h-full min-h-[220px] sm:min-h-[260px] relative cursor-grab active:cursor-grabbing touch-pan-y"
      />
      {/* Subtle Hint Badge */}
      <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none transition-opacity duration-300">
        <span className="inline-block text-[11px] font-medium tracking-wide text-brand-gold/90 bg-brand-forest/90 border border-brand-gold/30 rounded-full px-3.5 py-1 shadow-md backdrop-blur-sm">
          ✦ Hover to pop cap · Drag to spin · Flick to wobble
        </span>
      </div>
    </div>
  );
}
