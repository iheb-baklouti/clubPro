"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

import { PitchMarkings } from "@/components/features/formations-3d/pitch-markings";
import { PlayerToken3D } from "@/components/features/formations-3d/player-token-3d";
import { BallToken3D } from "@/components/features/formations-3d/ball-token-3d";
import { Arrow3D } from "@/components/features/formations-3d/arrow-3d";
import { PITCH_WIDTH, PITCH_DEPTH, worldToPercent } from "@/lib/three-pitch";
import type { FormationArrow, FormationSlot, BallPosition } from "@/lib/formations";

interface PlayerInfo {
  full_name: string;
  jersey_number: number | null;
}

export interface FormationSceneProps {
  slots: FormationSlot[];
  arrows: FormationArrow[];
  ball?: BallPosition;
  playersById: Map<string, PlayerInfo>;
  selectedSlotId: string | null;
  interactive: boolean;
  isDrawingArrow?: boolean;
  arrowStart?: { x: number; y: number } | null;
  onSlotMove?: (slotId: string, x: number, y: number) => void;
  onSlotMoveEnd?: () => void;
  onBallMove?: (x: number, y: number) => void;
  onBallMoveEnd?: () => void;
  onSelectSlot?: (slotId: string) => void;
  onPitchPoint?: (x: number, y: number) => void;
}

function SceneContent({
  slots,
  arrows,
  ball,
  playersById,
  selectedSlotId,
  interactive,
  isDrawingArrow,
  onSlotMove,
  onSlotMoveEnd,
  onBallMove,
  onBallMoveEnd,
  onSelectSlot,
  onPitchPoint,
}: FormationSceneProps) {
  function handleGroundPointerDown(e: ThreeEvent<PointerEvent>) {
    if (!isDrawingArrow || !onPitchPoint) return;
    e.stopPropagation();
    const { x, y } = worldToPercent(e.point.x, e.point.z);
    onPitchPoint(x, y);
  }

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 40, 10]} intensity={1} castShadow />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerDown={handleGroundPointerDown}
      >
        <planeGeometry args={[PITCH_WIDTH + 10, PITCH_DEPTH + 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <PitchMarkings />

      {arrows.map((arrow) => (
        <Arrow3D key={arrow.id} x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} />
      ))}

      {slots.map((slot) => {
        const player = slot.playerId ? playersById.get(slot.playerId) : undefined;
        return (
          <PlayerToken3D
            key={slot.id}
            x={slot.x}
            y={slot.y}
            label={slot.label}
            jerseyNumber={player?.jersey_number ?? null}
            color={player ? "#1e6f3c" : "#8a8a8a"}
            selected={selectedSlotId === slot.id}
            draggable={interactive && !isDrawingArrow}
            onMove={(x, y) => onSlotMove?.(slot.id, x, y)}
            onMoveEnd={onSlotMoveEnd}
            onSelect={() => onSelectSlot?.(slot.id)}
          />
        );
      })}

      {ball && (
        <BallToken3D
          x={ball.x}
          y={ball.y}
          draggable={Boolean(interactive) && !isDrawingArrow}
          onMove={(x, y) => onBallMove?.(x, y)}
          onMoveEnd={onBallMoveEnd}
        />
      )}
    </>
  );
}

export default function FormationScene(props: FormationSceneProps) {
  const cameraPosition = useRef<[number, number, number]>([0, 70, 55]);

  return (
    <Canvas shadows camera={{ position: cameraPosition.current, fov: 45 }}>
      <color attach="background" args={["#0b1120"]} />
      <SceneContent {...props} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={30}
        maxDistance={140}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
