import { describe, expect, it } from 'vitest';
import {
  clampGridCoords,
  gridToWorld,
  isNearWall,
  stepFurnitureRotation,
} from '../components/sims/three/spatialMath';

describe('gridToWorld', () => {
  it('centres the footprint in room-centred coordinates', () => {
    expect(gridToWorld(0, 0, 1, 1, 4, 4)).toEqual({ x: -1.5, z: -1.5 });
    expect(gridToWorld(1.5, 1.5, 1, 1, 4, 4)).toEqual({ x: 0, z: 0 });
  });
});

describe('clampGridCoords', () => {
  it('snaps to the step', () => {
    expect(clampGridCoords(1.13, 0.9, 1, 1, 4, 4, 0.25)).toEqual({ x: 1.25, z: 1 });
  });
  it('keeps the whole footprint inside the room', () => {
    expect(clampGridCoords(10, 10, 1.5, 1, 4, 4)).toEqual({ x: 2.5, z: 3 });
    expect(clampGridCoords(-3, -3, 1, 1, 4, 4)).toEqual({ x: 0, z: 0 });
  });
  it('pins to 0 when the footprint is larger than the room', () => {
    expect(clampGridCoords(2, 2, 6, 6, 4, 4)).toEqual({ x: 0, z: 0 });
  });
  it('avoids floating point drift on 1/8 steps', () => {
    expect(clampGridCoords(0.37, 0.62, 0.5, 0.5, 4, 4, 0.125)).toEqual({ x: 0.375, z: 0.625 });
  });
});

describe('isNearWall', () => {
  it('is true within the threshold of any wall', () => {
    expect(isNearWall(0.1, 2, 1, 1, 4, 4)).toBe(true);
    expect(isNearWall(2, 0.2, 1, 1, 4, 4)).toBe(true);
    expect(isNearWall(2.8, 2, 1, 1, 4, 4)).toBe(true); // right edge at 3.8
    expect(isNearWall(2, 2.9, 1, 1, 4, 4)).toBe(true);
  });
  it('is false in the middle of the room', () => {
    expect(isNearWall(1.5, 1.5, 1, 1, 4, 4)).toBe(false);
  });
});

describe('stepFurnitureRotation', () => {
  it('steps cw and ccw', () => {
    expect(stepFurnitureRotation(0, 'cw', 15)).toBe(15);
    expect(stepFurnitureRotation(0, 'ccw', 15)).toBe(345);
  });
  it('wraps around 360', () => {
    expect(stepFurnitureRotation(355, 'cw', 5)).toBe(0);
    expect(stepFurnitureRotation(720, 'cw', 5)).toBe(5);
  });
});
