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
  cardStatus = "Plantel Oficial",
  cardAttendance = "0%",
  cardGoals = "0",
  cardAssists = "0",
  cardMinutes = "0'",
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
        gl={{ alpha: transparent }}
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
            cardStatus={cardStatus}
            cardAttendance={cardAttendance}
            cardGoals={cardGoals}
            cardAssists={cardAssists}
            cardMinutes={cardMinutes}
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

function createCardTexture(image, data, isBack) {
  if (!image) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 1280;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.fillStyle = isBack ? "rgba(2, 6, 23, 0.72)" : "rgba(2, 6, 23, 0.84)";
  context.fillRect(80, isBack ? 290 : 560, 800, isBack ? 760 : 620);
  context.strokeStyle = "rgba(125, 211, 252, 0.7)";
  context.lineWidth = 4;
  context.strokeRect(80, isBack ? 290 : 560, 800, isBack ? 760 : 620);

  context.fillStyle = "#f8fafc";
  context.textAlign = "left";
  context.font = "700 42px Arial, sans-serif";
  context.fillText(
    isBack ? "ESTADISTICAS" : "LAGUNA ATHLETIC",
    120,
    isBack ? 370 : 690,
  );

  if (!isBack) {
    context.font = "800 64px Arial, sans-serif";
    context.fillText(String(data.name).toUpperCase().slice(0, 19), 120, 790);
    context.fillStyle = "#7dd3fc";
    context.font = "600 34px Arial, sans-serif";
    context.fillText(`${data.position}  |  DORSAL #${data.number}`, 120, 860);
    context.fillStyle = "#fbbf24";
    context.font = "700 30px Arial, sans-serif";
    context.fillText(String(data.status).toUpperCase(), 120, 950);
    context.fillStyle = "#cbd5e1";
    context.font = "500 27px Arial, sans-serif";
    context.fillText("CREDENCIAL OFICIAL 2026", 120, 1030);
    return makeCanvasTexture(canvas);
  }

  const metrics = [
    ["ASISTENCIA", data.attendance],
    ["GOLES", data.goals],
    ["ASISTENCIAS", data.assists],
    ["MINUTOS", data.minutes],
  ];
  metrics.forEach(([label, value], index) => {
    const y = 490 + index * 125;
    context.fillStyle = "#cbd5e1";
    context.font = "600 28px Arial, sans-serif";
    context.fillText(label, 140, y);
    context.fillStyle = "#f8fafc";
    context.font = "800 48px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(String(value), 820, y);
    context.textAlign = "left";
    context.strokeStyle = "rgba(148, 163, 184, 0.35)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(140, y + 28);
    context.lineTo(820, y + 28);
    context.stroke();
  });

  context.fillStyle = "#7dd3fc";
  context.font = "600 26px Arial, sans-serif";
  context.fillText(`ALUMNO #${data.number}`, 140, 990);
  return makeCanvasTexture(canvas);
}

function makeCanvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = "/front-card.svg",
  backImage = "/back-card.svg",
  imageFit = "cover",
  lanyardImage = "/lanyard-pattern.svg",
  lanyardWidth = 1,
  cardName = "Laguna Athletic",
  cardNumber = "10",
  cardPosition = "Jugador",
  cardStatus = "Plantel Oficial",
  cardAttendance = "0%",
  cardGoals = "0",
  cardAssists = "0",
  cardMinutes = "0'",
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

  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  const texture = useTexture(lanyardImage || BLANK_PIXEL);

  const frontDataTex = useMemo(
    () =>
      createCardTexture(
        frontTex.image,
        {
          name: cardName,
          number: cardNumber,
          position: cardPosition,
          status: cardStatus,
        },
        false,
      ),
    [frontTex, cardName, cardNumber, cardPosition, cardStatus],
  );
  const backDataTex = useMemo(
    () =>
      createCardTexture(
        backTex.image,
        {
          name: cardName,
          number: cardNumber,
          position: cardPosition,
          status: cardStatus,
          attendance: cardAttendance,
          goals: cardGoals,
          assists: cardAssists,
          minutes: cardMinutes,
        },
        true,
      ),
    [
      backTex,
      cardName,
      cardNumber,
      cardPosition,
      cardStatus,
      cardAttendance,
      cardGoals,
      cardAssists,
      cardMinutes,
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
    [0, 1.5, 0],
  ]);

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
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

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
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
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
          >
            <mesh>
              <boxGeometry args={[1.6, 2.25, 0.08]} />
              <meshStandardMaterial
                color="#0b1220"
                metalness={0.7}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.35, 1.95]} />
              <meshStandardMaterial
                map={frontDataTex || frontTex}
                transparent
              />
            </mesh>
            <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.35, 1.95]} />
              <meshStandardMaterial map={backDataTex || backTex} transparent />
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
