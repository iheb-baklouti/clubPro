"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

import { percentToWorld } from "@/lib/three-pitch";

export function Arrow3D({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const [start, end, headPoints] = useMemo(() => {
    const startVec = new THREE.Vector3(...percentToWorld(x1, y1));
    const endVec = new THREE.Vector3(...percentToWorld(x2, y2));
    startVec.y = 0.4;
    endVec.y = 0.4;

    const direction = endVec.clone().sub(startVec).normalize();
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(0.7);
    const headBase = endVec.clone().sub(direction.clone().multiplyScalar(1.8));

    const points: [number, number, number][] = [
      [headBase.x + perpendicular.x, 0.4, headBase.z + perpendicular.z],
      [endVec.x, 0.4, endVec.z],
      [headBase.x - perpendicular.x, 0.4, headBase.z - perpendicular.z],
    ];

    return [startVec, endVec, points];
  }, [x1, y1, x2, y2]);

  return (
    <group>
      <Line points={[start, end]} color="#ffd60a" lineWidth={3} />
      <Line points={headPoints} color="#ffd60a" lineWidth={3} />
    </group>
  );
}
