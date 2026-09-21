import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "../Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export default function Lanyard({
  position = [0, 0, 26],
  gravity = [0, -40, 0],
  fov = 18.5,
  transparent = true,
  frontImage = "/front-card.svg",
  backImage = "/back-card.svg",
  imageFit = "cover",
  lanyardImage = "/lanyard-pattern.svg",
  lanyardWidth = 1,
  cardName = "Laguna Athletic",
  cardNumber = "10",
  cardPosition = "Jugador",
  cardCategory = "Sub-10",
  cardStatus = "Plantel Oficial",
  cardStarter = true,
  cardAttendance = "0%",
  cardGoals = "0",
  cardAssists = "0",
  cardMinutes = "0'",
  cardFolio = "LA-2026-0010",
  cardTutor = "Familia",
  cardPhoto = "./LAGUNA.jpg",
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper" style={{ background: "transparent" }}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={Math.PI * 0.85} />
        <directionalLight position={[0, 6, 8]} intensity={1.2} />
        <pointLight position={[-4, 2, 5]} intensity={2.2} color="#38bdf8" />
        <pointLight position={[4, -2, 5]} intensity={1.8} color="#fbbf24" />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            cardName={cardName}
            cardNumber={cardNumber}
            cardPosition={cardPosition}
            cardCategory={cardCategory}
            cardStatus={cardStatus}
            cardStarter={cardStarter}
            cardAttendance={cardAttendance}
            cardGoals={cardGoals}
            cardAssists={cardAssists}
            cardMinutes={cardMinutes}
            cardFolio={cardFolio}
            cardTutor={cardTutor}
            cardPhoto={cardPhoto}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

// Cache global para fotos del alumno y logos
const imageCache = {};

function getOrLoadImage(url, onLoaded) {
  if (!url) return null;
  const cached = imageCache[url];
  if (cached) {
    if (cached.complete && cached.naturalWidth > 0) return cached;
    return null;
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageCache[url] = img;
    if (typeof onLoaded === "function") onLoaded();
  };
  img.onerror = () => {
    imageCache[url] = null;
  };
  img.src = url;
  imageCache[url] = img;
  return null;
}

// Dibuja un rectángulo con esquinas redondeadas
function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
  ctx.restore();
}

// Medallón heráldico dorado con el escudo oficial del club
function drawCrestMedallion(ctx, logoImg, x, y, radius) {
  ctx.save();
  // Sombra exterior de gala
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = 18;

  // Bisel dorado exterior
  const rimGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  rimGrad.addColorStop(0, "#fef08a");
  rimGrad.addColorStop(0.35, "#eab308");
  rimGrad.addColorStop(0.7, "#ca8a04");
  rimGrad.addColorStop(1, "#713f12");

  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fondo azul noche del escudo
  ctx.fillStyle = "#050e1d";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Clip circular y renderizado de la imagen del escudo
  ctx.beginPath();
  ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
  ctx.clip();

  if (logoImg) {
    ctx.drawImage(logoImg, x - radius, y - radius, radius * 2, radius * 2);
  } else {
    // Monograma de fallback si la imagen aún carga
    ctx.fillStyle = "#fbbf24";
    ctx.font = `900 ${Math.round(radius * 0.9)}px 'Plus Jakarta Sans', Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LA", x, y + 2);
  }
  ctx.restore();
}

// Chip inteligente de contacto dorado (Smart Pass ISO 7816)
function drawSmartChip(ctx, x, y, width, height) {
  ctx.save();
  const chipGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  chipGrad.addColorStop(0, "#fef08a");
  chipGrad.addColorStop(0.3, "#eab308");
  chipGrad.addColorStop(0.65, "#ca8a04");
  chipGrad.addColorStop(1, "#854d0e");

  ctx.fillStyle = chipGrad;
  ctx.strokeStyle = "#5a3407";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, x, y, width, height, 16, true, true);

  // Contactos de circuito impreso grabados
  ctx.strokeStyle = "rgba(69, 39, 4, 0.9)";
  ctx.lineWidth = 2.5;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.beginPath();
  ctx.moveTo(cx, y + 8);
  ctx.lineTo(cx, y + height - 8);

  ctx.moveTo(x + 8, cy);
  ctx.lineTo(x + width - 8, cy);

  ctx.moveTo(x + 20, y + 8);
  ctx.lineTo(x + 20, cy - 8);
  ctx.lineTo(cx - 8, cy - 8);

  ctx.moveTo(x + width - 20, y + 8);
  ctx.lineTo(x + width - 20, cy - 8);
  ctx.lineTo(cx + 8, cy - 8);

  ctx.moveTo(x + 20, y + height - 8);
  ctx.lineTo(x + 20, cy + 8);
  ctx.lineTo(cx - 8, cy + 8);

  ctx.moveTo(x + width - 20, y + height - 8);
  ctx.lineTo(x + width - 20, cy + 8);
  ctx.lineTo(cx + 8, cy + 8);
  ctx.stroke();

  // Contactos circulares
  ctx.fillStyle = "rgba(69, 39, 4, 0.75)";
  ctx.beginPath();
  ctx.arc(cx - 18, cy, 3, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(69, 39, 4, 0.95)";
  ctx.font = "800 11px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("SMART PASS", cx, y + height - 6);
  ctx.restore();
}

// Sello holográfico de seguridad de difracción óptica (OVD)
function drawHologram(ctx, x, y, radius) {
  ctx.save();
  const holoGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 4, x, y, radius);
  holoGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  holoGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.9)");
  holoGrad.addColorStop(0.4, "rgba(168, 85, 247, 0.85)");
  holoGrad.addColorStop(0.65, "rgba(236, 72, 153, 0.85)");
  holoGrad.addColorStop(0.85, "rgba(250, 204, 21, 0.9)");
  holoGrad.addColorStop(1, "rgba(16, 185, 129, 0.8)");

  ctx.fillStyle = holoGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rayos geométricos de seguridad óptica
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12);
    ctx.lineTo(x + Math.cos(angle) * (radius - 5), y + Math.sin(angle) * (radius - 5));
    ctx.stroke();
  }

  // Anillos concéntricos de seguridad
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#030712";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = "900 13px 'Plus Jakarta Sans', Arial";
  ctx.fillText("CANTERA", x, y - 16);
  ctx.font = "900 24px 'Plus Jakarta Sans', Arial";
  ctx.fillText("★ 2026 ★", x, y + 8);
  ctx.font = "800 12px 'Plus Jakarta Sans', Arial";
  ctx.fillText("AUTHENTIC", x, y + 26);
  ctx.restore();
}

// Código QR de alta resolución realista con patrones de búsqueda (Finder Patterns)
function drawQRCode(ctx, x, y, size, payload) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, x, y, size, size, 14, true, false);

  const padding = 14;
  const innerSize = size - padding * 2;
  const modules = 25;
  const cellSize = innerSize / modules;
  const originX = x + padding;
  const originY = y + padding;

  ctx.fillStyle = "#020617";

  const fillCell = (col, row) => {
    ctx.fillRect(originX + col * cellSize, originY + row * cellSize, cellSize + 0.4, cellSize + 0.4);
  };

  const drawFinder = (startCol, startRow) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          fillCell(startCol + c, startRow + r);
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(modules - 7, 0);
  drawFinder(0, modules - 7);

  for (let i = 7; i < modules - 7; i++) {
    if (i % 2 === 0) {
      fillCell(6, i);
      fillCell(i, 6);
    }
  }

  const alignCol = 16;
  const alignRow = 16;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        fillCell(alignCol + c, alignRow + r);
      }
    }
  }

  let seed = 0;
  for (let i = 0; i < (payload || "LAGUNA-2026").length; i++) {
    seed = (seed * 31 + payload.charCodeAt(i)) & 0xffffffff;
  }
  const nextPseudo = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 16) / 65536;
  };

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modules - 8;
      const inBottomLeft = r >= modules - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlign = r >= 16 && r <= 20 && c >= 16 && c <= 20;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlign) {
        if (nextPseudo() > 0.48) {
          fillCell(c, r);
        }
      }
    }
  }

  ctx.restore();
}

// Dibuja un código de barras vectorial de alta definición
function drawBarcode(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "#020617";
  const barPattern = [
    3, 1, 2, 1, 4, 1, 2, 3, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 4, 1,
    2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1,
    3, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1
  ];

  let currentX = x + 25;
  const usableWidth = width - 50;
  const totalUnits = barPattern.reduce((a, b) => a + b, 0);
  const unitWidth = usableWidth / totalUnits;

  barPattern.forEach((units, i) => {
    const w = units * unitWidth;
    if (i % 2 === 0) {
      ctx.fillRect(currentX, y + 8, w, height - 16);
    }
    currentX += w;
  });
  ctx.restore();
}

// Generador de la textura de alta definición para la credencial de Laguna Athletic
function createCardTexture(data, isBack, onImageLoaded) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const W = canvas.width;
  const H = canvas.height;

  // Precargar escudo oficial de Laguna Athletic
  const logoImg = getOrLoadImage("./LAGUNA.jpg", onImageLoaded);

  // 1. Fondo de la credencial — Noche de Estadio Laguna (Dark Navy azul noche con gradiente)
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#050d1a");
  bgGrad.addColorStop(0.35, "#0a1932");
  bgGrad.addColorStop(0.75, "#060e1c");
  bgGrad.addColorStop(1, "#081426");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Destello de luz deportivo en la parte superior
  const glowGrad = ctx.createRadialGradient(W / 2, 120, 20, W / 2, 120, 520);
  glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.14)");
  glowGrad.addColorStop(0.55, "rgba(37, 99, 235, 0.05)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, 620);

  // Patrón geométrico deportivo de fondo
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.07)";
  ctx.lineWidth = 3;
  for (let i = -W; i < W * 2; i += 65) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 450, H);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Bordes y filetes dorados de gala con alto contraste
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 14;
  drawRoundRect(ctx, 22, 22, W - 44, H - 44, 46, false, true);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, 40, 40, W - 80, H - 80, 36, false, true);

  // Ranura superior para el broche de cinta del gafete
  ctx.fillStyle = "#020617";
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 4;
  drawRoundRect(ctx, W / 2 - 85, 48, 170, 28, 14, true, true);

  // -------------------------------------------------------------------------
  // CARA TRASERA: FICHA TÉCNICA, EXPEDIENTE Y CONTROL DE ACCESO ELECTRÓNICO
  // -------------------------------------------------------------------------
  if (isBack) {
    // Marca de agua central semitransparente del escudo del club
    if (logoImg) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.drawImage(logoImg, W / 2 - 240, 380, 480, 480);
      ctx.restore();
    }

    // Cabecera Trasera con Medallón Oficial
    drawCrestMedallion(ctx, logoImg, W / 2, 118, 32);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 24px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "5px";
    ctx.fillText("LAGUNA ATHLETIC CLUB", W / 2, 172);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 38px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("EXPEDIENTE DEPORTIVO 2026", W / 2, 212);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 19px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.fillText("FICHA TÉCNICA • SEGUIMIENTO OFICIAL", W / 2, 240);

    // Línea separadora dorada
    const sepGrad = ctx.createLinearGradient(90, 0, W - 90, 0);
    sepGrad.addColorStop(0, "rgba(251, 191, 36, 0)");
    sepGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.9)");
    sepGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(90, 260);
    ctx.lineTo(W - 90, 260);
    ctx.stroke();

    // 4 Cajas de métricas oficiales en cuadrícula 2x2
    const metrics = [
      { label: "ASISTENCIA", val: data.attendance || "0%", color: "#38bdf8", icon: "⚡" },
      { label: "GOLES", val: String(data.goals || 0), color: "#fbbf24", icon: "⚽" },
      { label: "ASISTENCIAS", val: String(data.assists || 0), color: "#34d399", icon: "🎯" },
      { label: "MINUTOS", val: String(data.minutes || "0'"), color: "#c084fc", icon: "⏱" },
    ];

    const boxPositions = [
      { x: 90, y: 282, w: 385, h: 165 },
      { x: 525, y: 282, w: 385, h: 165 },
      { x: 90, y: 468, w: 385, h: 165 },
      { x: 525, y: 468, w: 385, h: 165 },
    ];

    metrics.forEach((m, idx) => {
      const pos = boxPositions[idx];
      ctx.fillStyle = "rgba(7, 18, 38, 0.92)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2.5;
      drawRoundRect(ctx, pos.x, pos.y, pos.w, pos.h, 20, true, true);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "800 21px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${m.icon} ${m.label}`, pos.x + 26, pos.y + 50);

      ctx.fillStyle = m.color;
      ctx.font = "900 70px 'JetBrains Mono', monospace, Arial";
      ctx.fillText(m.val, pos.x + 26, pos.y + 130);
    });

    // Ficha del Alumno & Tutor
    ctx.fillStyle = "rgba(4, 12, 26, 0.95)";
    ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 90, 655, 820, 235, 22, true, true);

    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 21px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("ALUMNO:", 130, 708);
    ctx.fillText("TUTOR:", 130, 755);
    ctx.fillText("CATEGORÍA:", 130, 802);
    ctx.fillText("FOLIO / ID:", 130, 849);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 27px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText(String(data.name || "Jugador").toUpperCase(), 295, 708);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "800 25px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText(String(data.tutor || "Familia").toUpperCase(), 295, 755);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 25px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText(`${data.position || "Jugador"} • ${data.category || "Sub-10"}`, 295, 802);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 25px 'JetBrains Mono', monospace";
    ctx.fillText(data.folio || `LA-2026-${String(data.number || 10).padStart(4, "0")}`, 295, 849);

    // Certificación Médica / Física Aprobada
    ctx.fillStyle = "rgba(6, 78, 59, 0.38)";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 90, 910, 820, 130, 18, true, true);

    ctx.fillStyle = "#34d399";
    ctx.font = "900 23px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✔ CERTIFICACIÓN FÍSICA Y DEPORTIVA APROBADA", 130, 955);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "600 18px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("El alumno cuenta con ficha médica vigente y autorización para partidos oficiales.", 130, 992);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "500 17px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("Temporada 2026 • Laguna Athletic Club Academy.", 130, 1020);

    // Zona de Acceso Electrónico Combinada: Código QR 2D + Código de Barras
    const qrSize = 170;
    const qrX = 90;
    const qrY = 1060;
    drawQRCode(ctx, qrX, qrY, qrSize, data.folio || "LA-2026-0010");

    const barX = 285;
    const barY = 1065;
    const barW = 625;
    const barH = 75;
    drawBarcode(ctx, barX, barY, barW, barH);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "800 22px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(data.folio || "LA-2026-0010", barX + barW / 2, 1172);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 18px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("SCANNER GATE • VALIDACIÓN BIOMÉTRICA DE ACCESO", barX + barW / 2, 1205);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 17px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("DOCUMENTO OFICIAL INTRANSFERIBLE • LAGUNA ATHLETIC CLUB", W / 2, 1335);

    return makeCanvasTexture(canvas);
  }

  // -------------------------------------------------------------------------
  // CARA FRONTAL: ESCUDO MEDALLÓN, FOTO, SMART CHIP, HOLOGRAMA Y DORSAL
  // -------------------------------------------------------------------------

  // 1. Cabecera Oficial del Club con Medallón
  drawCrestMedallion(ctx, logoImg, W / 2, 118, 32);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 24px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "5px";
  ctx.fillText("LAGUNA ATHLETIC CLUB", W / 2, 172);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 38px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("CREDENCIAL OFICIAL 2026", W / 2, 212);

  // Cinta de lema oficial formativo
  ctx.fillStyle = "rgba(30, 58, 138, 0.48)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, W / 2 - 250, 226, 500, 34, 17, true, true);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "800 17px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("ACADEMIA FORMATIVA • FORJANDO CAMPEONES", W / 2, 249);

  // 2. MARCO Y FOTO DEL ALUMNO (CENTRADA)
  const photoW = 410;
  const photoH = 420;
  const photoX = W / 2 - photoW / 2;
  const photoY = 275;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#071220";
  drawRoundRect(ctx, photoX, photoY, photoW, photoH, 26, true, false);
  ctx.restore();

  // Cargar y dibujar foto del alumno si está disponible
  const photoImg = getOrLoadImage(data.photo || "./LAGUNA.jpg", onImageLoaded);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(photoX + 26, photoY);
  ctx.lineTo(photoX + photoW - 26, photoY);
  ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + 26);
  ctx.lineTo(photoX + photoW, photoY + photoH - 26);
  ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - 26, photoY + photoH);
  ctx.lineTo(photoX + 26, photoY + photoH);
  ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - 26);
  ctx.lineTo(photoX, photoY + 26);
  ctx.quadraticCurveTo(photoX, photoY, photoX + 26, photoY);
  ctx.closePath();
  ctx.clip();

  if (photoImg) {
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    const grad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    grad.addColorStop(0, "#1e3a8a");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 120px 'Plus Jakarta Sans', Arial";
    ctx.textAlign = "center";
    const initial = data.name ? data.name.charAt(0).toUpperCase() : "L";
    ctx.fillText(initial, W / 2, photoY + photoH / 2 + 40);
  }
  ctx.restore();

  // Borde biselado dorado de la foto
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 7;
  drawRoundRect(ctx, photoX, photoY, photoW, photoH, 26, false, true);

  // Píldora de estatus médico sobre la foto
  const statusIsInjured = String(data.status || "").toLowerCase().includes("rehab") ||
    String(data.status || "").toLowerCase().includes("lesion");
  const pillBg = statusIsInjured ? "rgba(220, 38, 38, 0.96)" : "rgba(5, 150, 105, 0.96)";
  const pillText = statusIsInjured ? "● EN REHABILITACIÓN" : "● APTO FÍSICAMENTE • REGISTRADO";

  ctx.fillStyle = pillBg;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, W / 2 - 195, photoY + photoH - 22, 390, 44, 22, true, true);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 19px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(pillText, W / 2, photoY + photoH + 7);

  // 3. DISTINTIVOS LATERALES: SMART CHIP (IZQUIERDA) & HOLOGRAMA (DERECHA)
  drawSmartChip(ctx, 85, 275, 145, 110);

  // Caja de seguridad NFC debajo del chip
  ctx.fillStyle = "rgba(6, 16, 34, 0.85)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, 85, 400, 145, 75, 14, true, true);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "900 15px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("NFC PASS", 85 + 72, 428);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 13px 'Plus Jakarta Sans', Arial";
  ctx.fillText("SENSOR ID", 85 + 72, 452);

  // Holograma de difracción óptica a la derecha
  drawHologram(ctx, W - 155, 335, 60);

  // Distintivo de Acreditación Oficial Cantera debajo del holograma
  ctx.fillStyle = "rgba(6, 16, 34, 0.85)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, W - 225, 412, 140, 68, 14, true, true);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 14px 'Plus Jakarta Sans', Arial";
  ctx.textAlign = "center";
  ctx.fillText("FEDERACIÓN", W - 155, 438);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "700 13px 'Plus Jakarta Sans', Arial";
  ctx.fillText("ACREDITADO", W - 155, 460);

  // 4. DATOS DEL ALUMNO: NOMBRE CON ESCALADO DINÁMICO
  const nameY = 772;
  const nameStr = String(data.name || "Jugador").toUpperCase();
  let nameFontSize = 62;
  ctx.font = `900 ${nameFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  while (ctx.measureText(nameStr).width > 760 && nameFontSize > 32) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1.5px";
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
  ctx.shadowBlur = 14;
  ctx.fillText(nameStr, W / 2, nameY);
  ctx.restore();

  // Recuadro estético para Posición + Dorsal
  const badgeBoxY = 808;
  ctx.fillStyle = "rgba(6, 16, 34, 0.92)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, 100, badgeBoxY, 800, 104, 22, true, true);

  // Dorsal deportivo en oro
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 74px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`#${data.number || 10}`, 135, badgeBoxY + 76);

  // Posición en cyan y Categoría en plata
  ctx.fillStyle = "#38bdf8";
  ctx.font = "900 36px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText(String(data.position || "Medio Ofensivo").toUpperCase(), 305, badgeBoxY + 50);

  ctx.fillStyle = "#f1f5f9";
  ctx.font = "700 22px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText(`CATEGORÍA: ${data.category || "SUB-10"} • TEMPORADA 2026`, 305, badgeBoxY + 84);

  // 5. DISTINTIVO DE TITULARIDAD / PLANTEL
  const isStarter = data.starter !== false;
  const starterText = isStarter ? "★ PLANTEL TITULAR OFICIAL 2026 ★" : "★ PLANTEL OFICIAL 2026 ★";
  ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, 140, 934, 720, 52, 26, true, true);

  ctx.fillStyle = "#fef08a";
  ctx.font = "900 23px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(starterText, W / 2, 968);

  // 6. Mini resumen de métricas en el frente
  const frontStatsY = 1012;
  const fStats = [
    { label: "ASISTENCIA", val: data.attendance || "0%", color: "#38bdf8" },
    { label: "GOLES", val: String(data.goals || 0), color: "#fbbf24" },
    { label: "ASISTENCIAS", val: String(data.assists || 0), color: "#34d399" },
    { label: "MINUTOS", val: String(data.minutes || "0'"), color: "#c084fc" },
  ];

  const colW = 175;
  const gap = 26;
  const startX = W / 2 - (colW * 4 + gap * 3) / 2;

  fStats.forEach((st, i) => {
    const x = startX + i * (colW + gap);
    ctx.fillStyle = "rgba(6, 16, 34, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, x, frontStatsY, colW, 94, 18, true, true);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "800 17px 'Plus Jakarta Sans', Arial";
    ctx.textAlign = "center";
    ctx.fillText(st.label, x + colW / 2, frontStatsY + 34);

    ctx.fillStyle = st.color;
    ctx.font = "900 37px 'JetBrains Mono', monospace";
    ctx.fillText(st.val, x + colW / 2, frontStatsY + 75);
  });

  // 7. CÓDIGO DE BARRAS DE ALTA DENSIDAD Y FOLIO OFICIAL
  drawBarcode(ctx, 150, 1130, 700, 92);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "800 22px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(data.folio || `LA-2026-${String(data.number || 10).padStart(4, "0")}`, W / 2, 1252);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 19px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText("ACCESO OFICIAL A CANCHA & INSTALACIONES • CLUB LAGUNA", W / 2, 1310);

  return makeCanvasTexture(canvas);
}

function makeCanvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  lanyardImage = "/lanyard-pattern.svg",
  lanyardWidth = 1,
  cardName = "Laguna Athletic",
  cardNumber = "10",
  cardPosition = "Jugador",
  cardCategory = "Sub-10",
  cardStatus = "Plantel Oficial",
  cardStarter = true,
  cardAttendance = "0%",
  cardGoals = "0",
  cardAssists = "0",
  cardMinutes = "0'",
  cardFolio = "LA-2026-0010",
  cardTutor = "Familia",
  cardPhoto = "./LAGUNA.jpg",
}) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const [texVersion, setTexVersion] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlippedRef = useRef(false);

  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const texture = useTexture(lanyardImage || BLANK_PIXEL);

  // Actualiza la textura cuando una imagen externa termina de cargar
  const onImageLoaded = () => {
    setTexVersion((v) => v + 1);
  };

  const frontDataTex = useMemo(
    () =>
      createCardTexture(
        {
          name: cardName,
          number: cardNumber,
          position: cardPosition,
          category: cardCategory,
          status: cardStatus,
          starter: cardStarter,
          attendance: cardAttendance,
          goals: cardGoals,
          assists: cardAssists,
          minutes: cardMinutes,
          folio: cardFolio,
          tutor: cardTutor,
          photo: cardPhoto,
          version: texVersion,
        },
        false,
        onImageLoaded,
      ),
    [
      cardName,
      cardNumber,
      cardPosition,
      cardCategory,
      cardStatus,
      cardStarter,
      cardAttendance,
      cardGoals,
      cardAssists,
      cardMinutes,
      cardFolio,
      cardTutor,
      cardPhoto,
      texVersion,
    ],
  );

  const backDataTex = useMemo(
    () =>
      createCardTexture(
        {
          name: cardName,
          number: cardNumber,
          position: cardPosition,
          category: cardCategory,
          status: cardStatus,
          starter: cardStarter,
          attendance: cardAttendance,
          goals: cardGoals,
          assists: cardAssists,
          minutes: cardMinutes,
          folio: cardFolio,
          tutor: cardTutor,
          photo: cardPhoto,
          version: texVersion,
        },
        true,
        onImageLoaded,
      ),
    [
      cardName,
      cardNumber,
      cardPosition,
      cardCategory,
      cardStatus,
      cardStarter,
      cardAttendance,
      cardGoals,
      cardAssists,
      cardMinutes,
      cardFolio,
      cardTutor,
      cardPhoto,
      texVersion,
    ],
  );

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 });

  const toggleFlip = () => {
    setIsFlipped((f) => {
      const next = !f;
      isFlippedRef.current = next;
      card.current?.applyTorqueImpulse({ x: 0, y: Math.PI * 3, z: 0 }, true);
      window.parent?.postMessage({ type: "lanyard-flipped", isFlipped: next }, "*");
      return next;
    });
  };

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  // Soporte para voltear o interactuar desde la ventana principal
  useEffect(() => {
    const handleMsg = (e) => {
      if (e.data?.action === "flip") {
        toggleFlip();
      } else if (e.data?.action === "reset") {
        setIsFlipped(false);
        isFlippedRef.current = false;
        card.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        card.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
        card.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        window.parent?.postMessage({ type: "lanyard-flipped", isFlipped: false }, "*");
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "pointer";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation(),
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());

      // Si está volteado, el ángulo objetivo es PI (reverso); si no, 0 (frente)
      const targetY = isFlippedRef.current ? Math.PI : 0;
      let diffY = rot.y - targetY;
      while (diffY > Math.PI) diffY -= Math.PI * 2;
      while (diffY < -Math.PI) diffY += Math.PI * 2;

      card.current.setAngvel({ x: ang.x, y: ang.y - diffY * 0.35, z: ang.z });
    }
  });

  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  }, [texture]);

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.9, 1.3, 0.02]} />
          <group
            scale={2.55}
            position={[0, -1.25, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(event) => {
              event.target.releasePointerCapture(event.pointerId);
              drag(false);
              const dx = Math.abs(event.clientX - pointerDownPos.current.x);
              const dy = Math.abs(event.clientY - pointerDownPos.current.y);
              const dt = Date.now() - pointerDownPos.current.time;
              if (dx < 12 && dy < 12 && dt < 300) {
                toggleFlip();
              }
            }}
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId);
              pointerDownPos.current = {
                x: event.clientX,
                y: event.clientY,
                time: Date.now(),
              };
              drag(
                new THREE.Vector3()
                  .copy(event.point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
            onDoubleClick={toggleFlip}
          >
            {/* Broche superior metálico en oro brillante */}
            <mesh position={[0, 1.16, 0]}>
              <boxGeometry args={[0.26, 0.1, 0.08]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.25, 0]}>
              <torusGeometry args={[0.07, 0.018, 16, 32]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
            </mesh>

            {/* Cuerpo principal de la credencial (plástico PVC) */}
            <mesh>
              <boxGeometry args={[1.56, 2.22, 0.05]} />
              <meshStandardMaterial
                color="#0a1322"
                metalness={0.8}
                roughness={0.25}
              />
            </mesh>

            {/* Cara Frontal con acabado de policarbonato irisado */}
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[1.52, 2.18]} />
              <meshPhysicalMaterial
                map={frontDataTex}
                clearcoat={1}
                clearcoatRoughness={0.06}
                roughness={0.18}
                metalness={0.12}
                reflectivity={0.88}
                iridescence={0.35}
                iridescenceIOR={1.33}
              />
            </mesh>

            {/* Cara Trasera con acabado de policarbonato irisado */}
            <mesh position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.52, 2.18]} />
              <meshPhysicalMaterial
                map={backDataTex}
                clearcoat={1}
                clearcoatRoughness={0.06}
                roughness={0.18}
                metalness={0.12}
                reflectivity={0.88}
                iridescence={0.35}
                iridescenceIOR={1.33}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
