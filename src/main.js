import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 1. Create scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Create a sharp-edged cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0800ff });
const cube = new THREE.Mesh(geometry, material);

// Add black edge lines to cube
const edges = new THREE.EdgesGeometry(geometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const edgesLines = new THREE.LineSegments(edges, edgesMaterial);
cube.add(edgesLines);

scene.add(cube);

// 3. Add light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 2);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// 4. Shadow plane
// const planeGeometry = new THREE.PlaneGeometry(10, 10);
// const planeMaterial = new THREE.MeshStandardMaterial({ opacity: 0.5 });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.rotation.x = -Math.PI / 2.4;
// plane.position.y = -1;
// scene.add(plane);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 4. Load Duck model
let userModel = null;
const loader = new GLTFLoader();

// 6. File Upload UI
const input = document.createElement("input");
input.type = "file";
input.accept = ".glb";
input.style.position = "absolute";
input.style.top = "10px";
input.style.left = "10px";
input.style.zIndex = "10";
document.body.appendChild(input);

input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;
    loader.parse(
      arrayBuffer,
      "",
      (gltf) => {
        if (userModel) {
          scene.remove(userModel);
        } // remove previous if any

        // ✅ Always remove cube (only once)
        if (scene.children.includes(cube)) {
          scene.remove(cube);
        }

        userModel = gltf.scene;
        userModel.scale.set(1, 1, 1);
        userModel.position.set(0, 0, 0);
        scene.add(userModel);
      },
      console.error
    );
  };
  reader.readAsArrayBuffer(file);
});

// 5. Animate
const animate = () => {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  if (userModel) {
    userModel.rotation.x += 0.01;
    userModel.rotation.y += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
};
animate();

// 6. Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", () => {
  cube.material.color.setHex(Math.random() * 0xffffff);
});
