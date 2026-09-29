global.self = global;
const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const loader = new GLTFLoader();
loader.manager.setURLModifier = () => {};

const p = 'public/3dObject/heavy_duty_standing_table.glb';
const buf = fs.readFileSync(p);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

loader.parse(ab, '', (gltf) => {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log('1. Raw Table Size: X=' + size.x.toFixed(3) + ' Y=' + size.y.toFixed(3) + ' Z=' + size.z.toFixed(3));

  // If scaled with width=1.4, depth=0.7 (Medium variant):
  const targetW = 1.4;
  const targetD = 0.7;
  const scaleX = targetW / size.x; // 1.4 / 2.0 = 0.7
  const scaleZ = targetD / size.z; // 0.7 / 0.8 = 0.875
  const uniformScale = Math.min(scaleX, scaleZ); // 0.7
  model.scale.setScalar(uniformScale);

  const updatedBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  updatedBox.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= updatedBox.min.y;

  const finalBox = new THREE.Box3().setFromObject(model);
  console.log('2. Final Table Height (Max Y) with uniformScale: ' + finalBox.max.y.toFixed(3) + ' m');

  // Procedural desk height check:
  console.log('3. Procedural Desk height: 0.74m tabletop center, top is 0.765m');
});
