"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";

import { PITCH_WIDTH, PITCH_DEPTH } from "@/lib/three-pitch";

const LINE_COLOR = "#ffffff";
const LINE_Y = 0.02;

function circlePoints(radius: number, segments = 48): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, LINE_Y, Math.sin(angle) * radius]);
  }
  return points;
}

function rectPoints(width: number, depth: number, centerZ: number): [number, number, number][] {
  const hw = width / 2;
  return [
    [-hw, LINE_Y, centerZ - depth / 2],
    [hw, LINE_Y, centerZ - depth / 2],
    [hw, LINE_Y, centerZ + depth / 2],
    [-hw, LINE_Y, centerZ + depth / 2],
    [-hw, LINE_Y, centerZ - depth / 2],
  ];
}

export function PitchMarkings() {
  const halfW = PITCH_WIDTH / 2;
  const halfD = PITCH_DEPTH / 2;

  const boundary = useMemo<[number, number, number][]>(
    () => [
      [-halfW, LINE_Y, -halfD],
      [halfW, LINE_Y, -halfD],
      [halfW, LINE_Y, halfD],
      [-halfW, LINE_Y, halfD],
      [-halfW, LINE_Y, -halfD],
    ],
    [halfW, halfD],
  );

  const centerLine = useMemo<[number, number, number][]>(
    () => [
      [-halfW, LINE_Y, 0],
      [halfW, LINE_Y, 0],
    ],
    [halfW],
  );

  return (
    <group>
      {/* Pelouse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PITCH_WIDTH, PITCH_DEPTH]} />
        <meshStandardMaterial color="#1d7a3c" />
      </mesh>

      <Line points={boundary} color={LINE_COLOR} lineWidth={2} />
      <Line points={centerLine} color={LINE_COLOR} lineWidth={2} />
      <Line points={circlePoints(PITCH_WIDTH * 0.15)} color={LINE_COLOR} lineWidth={2} />

      {/* Surfaces de réparation (haut = adversaire, bas = notre camp) */}
      <Line points={rectPoints(PITCH_WIDTH * 0.6, PITCH_DEPTH * 0.16, -halfD + (PITCH_DEPTH * 0.16) / 2)} color={LINE_COLOR} lineWidth={2} />
      <Line points={rectPoints(PITCH_WIDTH * 0.6, PITCH_DEPTH * 0.16, halfD - (PITCH_DEPTH * 0.16) / 2)} color={LINE_COLOR} lineWidth={2} />
      <Line points={rectPoints(PITCH_WIDTH * 0.3, PITCH_DEPTH * 0.06, -halfD + (PITCH_DEPTH * 0.06) / 2)} color={LINE_COLOR} lineWidth={2} />
      <Line points={rectPoints(PITCH_WIDTH * 0.3, PITCH_DEPTH * 0.06, halfD - (PITCH_DEPTH * 0.06) / 2)} color={LINE_COLOR} lineWidth={2} />
    </group>
  );
}
