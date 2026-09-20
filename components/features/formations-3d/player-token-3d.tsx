"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";

import { percentToWorld, worldToPercent } from "@/lib/three-pitch";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

interface PlayerToken3DProps {
  x: number;
  y: number;
  label: string;
  jerseyNumber: number | null;
  color: string;
  selected: boolean;
  draggable: boolean;
  onMove?: (x: number, y: number) => void;
  onMoveEnd?: () => void;
  onSelect?: () => void;
}

export function PlayerToken3D({
  x,
  y,
  label,
  jerseyNumber,
  color,
  selected,
  draggable,
  onMove,
  onMoveEnd,
  onSelect,
}: PlayerToken3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const intersection = useRef(new THREE.Vector3());
  const controls = useThree((state) => state.controls) as { enabled: boolean } | null;

  const [worldX, worldY, worldZ] = percentToWorld(x, y);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!draggable) {
      onSelect?.();
      return;
    }
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (controls) controls.enabled = false;
    setIsDragging(true);
    onSelect?.();
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!isDragging) return;
    e.stopPropagation();
    if (e.ray.intersectPlane(GROUND_PLANE, intersection.current)) {
      const { x: nx, y: ny } = worldToPercent(intersection.current.x, intersection.current.z);
      onMove?.(nx, ny);
    }
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (controls) controls.enabled = true;
    if (isDragging) onMoveEnd?.();
    setIsDragging(false);
  }

  return (
    <group
      ref={groupRef}
      position={[worldX, worldY, worldZ]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[1.6, 1.6, 2, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#ffffff" : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      {selected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 2.3, 32]} />
          <meshBasicMaterial color="#ffd60a" />
        </mesh>
      )}
      <Text
        position={[0, 2.2, 0]}
        fontSize={1.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#00000080"
      >
        {jerseyNumber ?? label}
      </Text>
    </group>
  );
}
