"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";

import { percentToWorld, worldToPercent } from "@/lib/three-pitch";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export function BallToken3D({
  x,
  y,
  draggable,
  onMove,
  onMoveEnd,
}: {
  x: number;
  y: number;
  draggable: boolean;
  onMove?: (x: number, y: number) => void;
  onMoveEnd?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const intersection = useRef(new THREE.Vector3());
  const controls = useThree((state) => state.controls) as { enabled: boolean } | null;
  const [worldX, worldY, worldZ] = percentToWorld(x, y);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!draggable) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (controls) controls.enabled = false;
    setIsDragging(true);
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
    <mesh
      position={[worldX, 0.5, worldZ]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      castShadow
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#f5f5f5" />
    </mesh>
  );
}
