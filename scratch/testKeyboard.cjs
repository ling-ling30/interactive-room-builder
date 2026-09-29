global.self = global;
const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const loader = new GLTFLoader();
loader.manager.setURLModifier = () => {};

async function test(filename) {
  const p = 'public/3dObject/' + filename;
  const buf = fs.readFileSync(p);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  await new Promise(res => {
    loader.parse(ab, '', (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);

      console.log('--- ' + filename + ' ---');
      console.log('Raw Box Min:', box.min.x.toFixed(3), box.min.y.toFixed(3), box.min.z.toFixed(3));
      console.log('Raw Box Max:', box.max.x.toFixed(3), box.max.y.toFixed(3), box.max.z.toFixed(3));
      console.log('Raw Size:', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));

      // Scaling logic from Sims3DModels:
      const targetW = 0.36;
      const primaryW = Math.max(size.x, size.z);
      const uniformScale = targetW / primaryW;
      model.scale.setScalar(uniformScale);

      const updatedBox = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      updatedBox.getCenter(center);
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= updatedBox.min.y;

      const finalBox = new THREE.Box3().setFromObject(model);
      console.log('Final Box Min:', finalBox.min.x.toFixed(3), finalBox.min.y.toFixed(3), finalBox.min.z.toFixed(3));
      console.log('Final Box Max:', finalBox.max.x.toFixed(3), finalBox.max.y.toFixed(3), finalBox.max.z.toFixed(3));
      res();
    });
  });
}

async function run() {
  await test('custom_-_mechanical_keyboard.glb');
  await test('gaming_keyboard.glb');
  await test('computer_mouse_low-poly.glb');
  await test('computer_mouse_a4tech_bloody_v7.glb');
}
run();
