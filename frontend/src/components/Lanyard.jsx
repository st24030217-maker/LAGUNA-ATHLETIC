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
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
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
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
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

// Generador de la textura de alta definición para la credencial de Laguna Athletic
function createCardTexture(data, isBack, onImageLoaded) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Fondo de la credencial — Cancha de Noche / Dark Navy con gradiente
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#08101e");
  bgGrad.addColorStop(0.45, "#0b1c36");
  bgGrad.addColorStop(0.8, "#060c17");
  bgGrad.addColorStop(1, "#0a182e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Patrón geométrico deportivo de fondo (sutiles líneas dinámicas)
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
  ctx.lineWidth = 3;
  for (let i = -W; i < W * 2; i += 70) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 400, H);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Bordes y filetes dorados de gala
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 14;
  drawRoundRect(ctx, 24, 24, W - 48, H - 48, 48, false, true);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 42, 42, W - 84, H - 84, 38, false, true);

  // Ranura superior para la cinta del gafete (lanyard slot simulado)
  ctx.fillStyle = "#030712";
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 4;
  drawRoundRect(ctx, W / 2 - 80, 52, 160, 26, 13, true, true);

  // -------------------------------------------------------------------------
  // CARA TRASERA: FICHA TÉCNICA, ESTADÍSTICAS Y CERTIFICACIÓN
  // -------------------------------------------------------------------------
  if (isBack) {
    // Cabecera Trasera
    ctx.fillStyle = "#d4af37";
    ctx.font = "800 24px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText("★★ LAGUNA ATHLETIC CLUB ★★", W / 2, 140);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 38px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("EXPEDIENTE DEPORTIVO 2026", W / 2, 195);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "600 20px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("FICHA TÉCNICA • SEGUIMIENTO OFICIAL", W / 2, 230);

    // Línea separadora dorada
    const sepGrad = ctx.createLinearGradient(120, 0, W - 120, 0);
    sepGrad.addColorStop(0, "rgba(212, 175, 55, 0)");
    sepGrad.addColorStop(0.5, "rgba(212, 175, 55, 0.8)");
    sepGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 260);
    ctx.lineTo(W - 120, 260);
    ctx.stroke();

    // 4 Cajas de métricas oficiales en cuadrícula 2x2
    const metrics = [
      { label: "ASISTENCIA", val: data.attendance || "0%", color: "#38bdf8", icon: "⚡" },
      { label: "GOLES", val: String(data.goals || 0), color: "#f59e0b", icon: "⚽" },
      { label: "ASISTENCIAS", val: String(data.assists || 0), color: "#10b981", icon: "🎯" },
      { label: "MINUTOS", val: String(data.minutes || "0'"), color: "#a855f7", icon: "⏱" },
    ];

    const boxPositions = [
      { x: 90, y: 290, w: 380, h: 170 },
      { x: 530, y: 290, w: 380, h: 170 },
      { x: 90, y: 490, w: 380, h: 170 },
      { x: 530, y: 490, w: 380, h: 170 },
    ];

    metrics.forEach((m, idx) => {
      const pos = boxPositions[idx];
      ctx.fillStyle = "rgba(8, 24, 48, 0.75)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 2;
      drawRoundRect(ctx, pos.x, pos.y, pos.w, pos.h, 20, true, true);

      // Icono y etiqueta
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 20px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${m.icon} ${m.label}`, pos.x + 28, pos.y + 52);

      // Valor numérico prominente
      ctx.fillStyle = m.color;
      ctx.font = "900 68px 'JetBrains Mono', monospace, Arial";
      ctx.fillText(m.val, pos.x + 28, pos.y + 130);
    });

    // Ficha del Alumno & Tutor
    ctx.fillStyle = "rgba(4, 14, 28, 0.85)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 90, 690, 820, 240, 22, true, true);

    ctx.textAlign = "left";
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "600 20px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("ALUMNO:", 130, 745);
    ctx.fillText("TUTOR:", 130, 795);
    ctx.fillText("CATEGORÍA:", 130, 845);
    ctx.fillText("FOLIO / ID:", 130, 895);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "800 24px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText(String(data.name || "Jugador").toUpperCase(), 280, 745);

    ctx.fillStyle = "#fde047";
    ctx.fillText(String(data.tutor || "Familia").toUpperCase(), 280, 795);

    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`${data.position || "Jugador"} • ${data.category || "Sub-10"}`, 280, 845);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px 'JetBrains Mono', monospace";
    ctx.fillText(data.folio || `LA-2026-${String(data.number || 10).padStart(4, "0")}`, 280, 895);

    // Distintivo de Certificación Deportiva
    ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    drawRoundRect(ctx, 90, 960, 820, 160, 20, true, true);

    ctx.fillStyle = "#10b981";
    ctx.font = "900 24px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✔ CERTIFICACIÓN FÍSICA Y DEPORTIVA APROBADA", 130, 1015);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 18px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("El alumno cuenta con ficha médica vigente y autorización para torneos oficiales.", 130, 1055);
    ctx.fillText("Temporada 2026 • Laguna Athletic Club Academy.", 130, 1085);

    // Pie con código de barras y leyenda oficial
    drawBarcode(ctx, 160, 1160, 680, 90);
    ctx.fillStyle = "#64748b";
    ctx.font = "600 17px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(data.folio || "LA-2026-0010", W / 2, 1285);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("DOCUMENTO OFICIAL INTRANSFERIBLE • LAGUNA ATHLETIC CLUB", W / 2, 1340);

    return makeCanvasTexture(canvas);
  }

  // -------------------------------------------------------------------------
  // CARA FRONTAL: FOTO, SMART CHIP, HOLOGRAMA, DATOS Y DISTINTIVO
  // -------------------------------------------------------------------------

  // 1. Cabecera Oficial del Club
  ctx.fillStyle = "#d4af37";
  ctx.font = "800 22px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("★★ LAGUNA ATHLETIC CLUB ★★", W / 2, 130);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 40px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("CREDENCIAL OFICIAL 2026", W / 2, 185);

  // Cinta de categoría / lema oficial
  ctx.fillStyle = "rgba(37, 99, 235, 0.28)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, W / 2 - 250, 205, 500, 36, 18, true, true);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "700 17px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("ACADEMIA FORMATIVA • FORJANDO CAMPEONES", W / 2, 229);

  // 2. DISTINTIVO 1: Smart Chip Metálico Dorado (Smart Pass Contact Chip)
  const chipX = 90;
  const chipY = 270;
  const chipW = 140;
  const chipH = 110;
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#fef08a");
  chipGrad.addColorStop(0.4, "#eab308");
  chipGrad.addColorStop(0.7, "#ca8a04");
  chipGrad.addColorStop(1, "#a16207");
  ctx.fillStyle = chipGrad;
  ctx.strokeStyle = "#713f12";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, chipX, chipY, chipW, chipH, 16, true, true);

  // Líneas internas del microchip
  ctx.strokeStyle = "rgba(113, 63, 18, 0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chipX + 45, chipY);
  ctx.lineTo(chipX + 45, chipY + chipH);
  ctx.moveTo(chipX + 95, chipY);
  ctx.lineTo(chipX + 95, chipY + chipH);
  ctx.moveTo(chipX, chipY + 40);
  ctx.lineTo(chipX + chipW, chipY + 40);
  ctx.moveTo(chipX, chipY + 70);
  ctx.lineTo(chipX + chipW, chipY + 70);
  ctx.stroke();

  // 3. DISTINTIVO 2: Sello Holográfico Circular de Seguridad Oficial
  const holoX = W - 160;
  const holoY = 325;
  const holoR = 60;
  const holoGrad = ctx.createRadialGradient(holoX, holoY, 5, holoX, holoY, holoR);
  holoGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  holoGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.85)");
  holoGrad.addColorStop(0.6, "rgba(236, 72, 153, 0.75)");
  holoGrad.addColorStop(0.85, "rgba(250, 204, 21, 0.8)");
  holoGrad.addColorStop(1, "rgba(16, 185, 129, 0.6)");
  ctx.fillStyle = holoGrad;
  ctx.beginPath();
  ctx.arc(holoX, holoY, holoR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(holoX, holoY, holoR - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#020617";
  ctx.font = "900 13px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CANTERA", holoX, holoY - 14);
  ctx.font = "900 24px 'Plus Jakarta Sans', Arial";
  ctx.fillText("★ 2026 ★", holoX, holoY + 10);
  ctx.font = "800 12px 'Plus Jakarta Sans', Arial";
  ctx.fillText("OFICIAL", holoX, holoY + 28);

  // 4. MARCO Y FOTO DEL ALUMNO (CENTRADA)
  const photoW = 420;
  const photoH = 430;
  const photoX = W / 2 - photoW / 2;
  const photoY = 270;

  // Sombra exterior del marco
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#081222";
  drawRoundRect(ctx, photoX, photoY, photoW, photoH, 28, true, false);
  ctx.restore();

  // Cargar y dibujar foto del alumno si está disponible
  const photoImg = getOrLoadImage(data.photo || "./LAGUNA.jpg", onImageLoaded);
  ctx.save();
  // Clip para bordes redondeados
  ctx.beginPath();
  ctx.moveTo(photoX + 28, photoY);
  ctx.lineTo(photoX + photoW - 28, photoY);
  ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + 28);
  ctx.lineTo(photoX + photoW, photoY + photoH - 28);
  ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - 28, photoY + photoH);
  ctx.lineTo(photoX + 28, photoY + photoH);
  ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - 28);
  ctx.lineTo(photoX, photoY + 28);
  ctx.quadraticCurveTo(photoX, photoY, photoX + 28, photoY);
  ctx.closePath();
  ctx.clip();

  if (photoImg) {
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    // Fondo de fallback si la imagen aún carga
    const grad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    grad.addColorStop(0, "#172554");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 110px 'Plus Jakarta Sans', Arial";
    ctx.textAlign = "center";
    const initial = data.name ? data.name.charAt(0).toUpperCase() : "L";
    ctx.fillText(initial, W / 2, photoY + photoH / 2 + 35);
  }
  ctx.restore();

  // Borde biselado dorado de la foto
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  drawRoundRect(ctx, photoX, photoY, photoW, photoH, 28, false, true);

  // Píldora de estatus sobre la foto
  const statusIsInjured = String(data.status || "").toLowerCase().includes("rehab") ||
    String(data.status || "").toLowerCase().includes("lesion");
  const pillBg = statusIsInjured ? "rgba(239, 68, 68, 0.92)" : "rgba(16, 185, 129, 0.92)";
  const pillText = statusIsInjured ? "● EN REHABILITACIÓN" : "● APTO FÍSICAMENTE • REGISTRADO";

  ctx.fillStyle = pillBg;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, W / 2 - 190, photoY + photoH - 22, 380, 44, 22, true, true);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 18px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(pillText, W / 2, photoY + photoH + 6);

  // 5. DATOS DEL NIÑO: NOMBRE, DORSAL Y POSICIÓN
  const nameY = 790;
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText(String(data.name || "Jugador").toUpperCase(), W / 2, nameY);

  // Recuadro estilizado para Posición + Dorsal
  const badgeBoxY = 825;
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, 120, badgeBoxY, 760, 95, 24, true, true);

  // Dorsal deportivo a la izquierda del recuadro
  ctx.fillStyle = "#d4af37";
  ctx.font = "900 64px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`#${data.number || 10}`, 160, badgeBoxY + 70);

  // Posición y Categoría
  ctx.fillStyle = "#38bdf8";
  ctx.font = "800 32px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText(String(data.position || "Medio Ofensivo").toUpperCase(), 320, badgeBoxY + 48);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 20px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText(`CATEGORÍA: ${data.category || "SUB-10"} • TEMPORADA 2026`, 320, badgeBoxY + 78);

  // 6. DISTINTIVO DE TITULARIDAD / PLANTEL
  const isStarter = data.starter !== false;
  const starterText = isStarter ? "★ PLANTEL TITULAR OFICIAL 2026 ★" : "★ PLANTEL OFICIAL 2026 ★";
  ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 160, 950, 680, 52, 26, true, true);

  ctx.fillStyle = "#fde047";
  ctx.font = "800 22px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(starterText, W / 2, 984);

  // 7. Mini resumen de métricas del niño en el frente
  const frontStatsY = 1035;
  const fStats = [
    { label: "ASISTENCIA", val: data.attendance || "0%" },
    { label: "GOLES", val: String(data.goals || 0) },
    { label: "ASISTENCIAS", val: String(data.assists || 0) },
    { label: "MINUTOS", val: String(data.minutes || "0'") },
  ];

  const colW = 160;
  const gap = 30;
  const startX = W / 2 - (colW * 4 + gap * 3) / 2;

  fStats.forEach((st, i) => {
    const x = startX + i * (colW + gap);
    ctx.fillStyle = "rgba(6, 18, 36, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, x, frontStatsY, colW, 90, 16, true, true);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 15px 'Plus Jakarta Sans', Arial";
    ctx.textAlign = "center";
    ctx.fillText(st.label, x + colW / 2, frontStatsY + 32);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 32px 'JetBrains Mono', monospace";
    ctx.fillText(st.val, x + colW / 2, frontStatsY + 72);
  });

  // 8. PIE DE CREDENCIAL Y CÓDIGO DE BARRAS DE ALTA DENSIDAD
  drawBarcode(ctx, 160, 1160, 680, 90);
  ctx.fillStyle = "#64748b";
  ctx.font = "600 18px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(data.folio || `LA-2026-${String(data.number || 10).padStart(4, "0")}`, W / 2, 1285);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "700 18px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText("ACCESO OFICIAL A CANCHA & INSTALACIONES • CLUB LAGUNA", W / 2, 1340);

  return makeCanvasTexture(canvas);
}

// Dibuja un código de barras vectorial realista
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
      ctx.fillRect(currentX, y + 10, w, height - 20);
    }
    currentX += w;
  });
  ctx.restore();
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
        setIsFlipped((f) => !f);
        card.current?.applyTorqueImpulse({ x: 0, y: Math.PI * 3, z: 0 }, true);
      } else if (e.data?.action === "reset") {
        setIsFlipped(false);
        card.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        card.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
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
          <CuboidCollider args={[0.8, 1.15, 0.02]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(event) => {
              event.target.releasePointerCapture(event.pointerId);
              drag(false);
            }}
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(event.point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
            onDoubleClick={() => setIsFlipped((f) => !f)}
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
                color="#060c18"
                metalness={0.6}
                roughness={0.35}
              />
            </mesh>

            {/* Cara Frontal */}
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[1.52, 2.18]} />
              <meshPhysicalMaterial
                map={frontDataTex}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.25}
                metalness={0.2}
              />
            </mesh>

            {/* Cara Trasera */}
            <mesh position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.52, 2.18]} />
              <meshPhysicalMaterial
                map={backDataTex}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.25}
                metalness={0.2}
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
