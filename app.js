import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

let bee;
let mixer;
let gltfAnimations = [];
let currentAnimationIndex = 0; // Inicia com a animação do banner

const camera = new THREE.PerspectiveCamera(
  10,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.z = 13

const scene = new THREE.Scene();

const loader = new GLTFLoader()
loader.load("./bee.glb",
  function (gltf) {
    bee = gltf.scene
    bee.position.y = -1
    bee.rotation.y = 1.5
    scene.add(bee)

    mixer = new THREE.AnimationMixer(bee);
    gltfAnimations = gltf.animations;
    
    // Inicia com a animação do banner (índice 2)
    if (gltf.animations.length > 2) {
      mixer.clipAction(gltf.animations[0]).play()
    }
  },
  function (xhr) { },
  function (error) { }
)

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector("#container3D").appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 1.3)
scene.add(ambientLight)

const topLight = new THREE.DirectionalLight(0xffffff, 1)
topLight.position.set(500, 500, 500)
scene.add(topLight)

const reRender3d = () => {
  requestAnimationFrame(reRender3d)
  renderer.render(scene, camera)
  if (mixer) mixer.update(0.02)
}
reRender3d()

let arrPositionModel = [
  {
    id: 'banner',
    position: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
    animation: 0
  },
  {
    id: "description",
    position: { x: 1, y: -1, z: -5 },
    rotation: { x: 0.5, y: -0.5, z: 0 },
    animation: 0
  },
  {
    id: "intro",
    position: { x: -1, y: -1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 },
    animation: 0
  },
  {
    id: "contact",
    position: { x: -1, y: -1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 },
    animation: 2
  },
];

const changeModelAnimation = (animationIndex) => {
  if (!mixer || !gltfAnimations || animationIndex >= gltfAnimations.length || animationIndex < 0) return;
  
  if (animationIndex === currentAnimationIndex) return;
  
  mixer.stopAllAction();
  
  const action = mixer.clipAction(gltfAnimations[animationIndex]);
  action.play();
  
  currentAnimationIndex = animationIndex;
}

const modelMove = () => {
  const sections = document.querySelectorAll(".section")
  let currentSection;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    if (rect.top <= window.innerHeight / 3) {
      currentSection = section.id
    }
  })

  let position_active = arrPositionModel.findIndex(
    (val) => val.id == currentSection
  )

  if (position_active >= 0) {
    let new_coordinates = arrPositionModel[position_active];
    
    // Move o modelo para a nova posição
    gsap.to(bee.position, {
      x: new_coordinates.position.x,
      y: new_coordinates.position.y,
      z: new_coordinates.position.z,
      duration: 1.5,
      ease: "power1.out"
    })
    
    // Rotaciona o modelo
    gsap.to(bee.rotation, {
      x: new_coordinates.rotation.x,
      y: new_coordinates.rotation.y,
      z: new_coordinates.rotation.z,
      duration: 3,
      ease: "power1.out"
    })
    
    // Troca a animação do modelo GLB
    changeModelAnimation(new_coordinates.animation);
  }
}

window.addEventListener('scroll', function () {
  if (bee) {
    modelMove()
  }
})

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})