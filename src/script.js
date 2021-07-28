import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { Camera, CompressedTextureLoader, Sphere } from 'three'
import  testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import galaxyVertexShader from './shaders/test/vertex1.glsl'
import galaxyFragmentShader from './shaders/test/fragment1.glsl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


//Earth Texture on sphere
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    console.log('loading started')
}
loadingManager.onLoad = () =>
{
    console.log('loading finished')
}
loadingManager.onProgress = () =>
{
    console.log('loading progressing')
}
loadingManager.onError = () =>
{
    console.log('texture loading error')
}






// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// CreateSkyBox allows the scene to have more attractiveness to it, in this case by having the blue starred images around Earth
function createSkyBox(scene) {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        "/texture/space_right.png",
        "/texture/space_left.png",
        "/texture/space_top.png",
        "/texture/space_bot.png",
        "/texture/space_front.png",
        "/texture/space_back.png",
    ]);
    scene.background = texture;
  }
  function addSceneObjects(scene) {
    createSkyBox(scene);
  } // AddSceneObjects adds the items to the scene
  addSceneObjects(scene);

 /**
 * Models
 */
const gltfLoader = new GLTFLoader()


gltfLoader.load(
    '/texture/logo3.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.set(0, -3, 0)
        scene.add(gltf.scene)
    }
)

/**
 * Particles
 */
/**
/**
 * Galaxy
 */
 const parameters = {}
 parameters.count = 200000
 parameters.size = 0.005
 parameters.radius = 5
 parameters.branches = 3
 parameters.spin = 1
 parameters.randomness = 0.2
 parameters.randomnessPower = 3
 parameters.insideColor = '#ff6030'
 parameters.outsideColor = '#1b3984'
 
 let geometry = null
 let material = null
 let points = null
 
 const generateGalaxy = () =>
 {
     if(points !== null)
     {
         geometry.dispose()
         material.dispose()
         scene.remove(points)
     }
 
     /**
      * Geometry
      */
     geometry = new THREE.BufferGeometry()
 
     const positions = new Float32Array(parameters.count * 3)
     const randomness = new Float32Array(parameters.count * 3)
     const colors = new Float32Array(parameters.count * 3)
     const scales = new Float32Array(parameters.count * 1)
 
     const insideColor = new THREE.Color(parameters.insideColor)
     const outsideColor = new THREE.Color(parameters.outsideColor)
 
     for(let i = 0; i < parameters.count; i++)
     {
         const i3 = i * 3
 
         // Position
         const radius = Math.random() * parameters.radius
 
         const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
 
         const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
         const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
         const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
 
         positions[i3    ] = Math.cos(branchAngle) * radius
         positions[i3 + 1] = 0
         positions[i3 + 2] = Math.sin(branchAngle) * radius
     
         randomness[i3    ] = randomX
         randomness[i3 + 1] = randomY
         randomness[i3 + 2] = randomZ
 
         // Color
         const mixedColor = insideColor.clone()
         mixedColor.lerp(outsideColor, radius / parameters.radius)
 
         colors[i3    ] = mixedColor.r
         colors[i3 + 1] = mixedColor.g
         colors[i3 + 2] = mixedColor.b
 
         // Scale
         scales[i] = Math.random()
     }
 
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
     geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
     geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
 
     /**
      * Material
      */
     material = new THREE.ShaderMaterial({
         depthWrite: false,
         blending: THREE.AdditiveBlending,
         vertexColors: true,
         uniforms:
         {
             uTime: { value: 0 },
             uSize: { value: 30 * renderer.getPixelRatio() }
         },    
         vertexShader: galaxyVertexShader,
         fragmentShader: galaxyFragmentShader
     })
 
     /**
      * Points
      */
     points = new THREE.Points(geometry, material)
     scene.add(points)
 }
 
/**
 * Object
 */
 const textureLoader = new THREE.TextureLoader(loadingManager)
 const earthtexture = textureLoader.load('/texture/8.jpg')
 earthtexture.magFilter = THREE.NearestFilter
 

 const geometry1 = new THREE.SphereGeometry(0.5, 64, 64)
 const material1 = new THREE.MeshBasicMaterial({ map: earthtexture })
 const mesh = new THREE.Mesh(geometry1, material1)
 scene.add(mesh)





 //create atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: testFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)
atmosphere.scale.set(1.1, 1.1, 1.1)

scene.add(atmosphere)



/**
 * Fonts
 */
 const fontLoader = new THREE.FontLoader()

 fontLoader.load(
    '/fonts/Japanese Style_Regular.json',
    (font) =>
    {
        const textGeometry = new THREE.TextGeometry(
            'Explore The Possibilities',
            {
                font: font,
                size: 0.3,
                height: 0.1,
                curveSegments: 2,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 2
            }
           
        )
        textGeometry.computeBoundingBox()
        textGeometry.translate(
            - (textGeometry.boundingBox.max.x - 0.02) * 0.5, // Subtract bevel size
            - (textGeometry.boundingBox.max.y - 0.02) * -3.5, // Subtract bevel size
            - (textGeometry.boundingBox.max.z - 0.03) * 0.5  // Subtract bevel thickness
        )
        
        const textMaterial = new THREE.MeshBasicMaterial()
        textMaterial.bevelEnabled = true
        textMaterial.color.set(0x006699)

     //   textMaterial.wireframe = true
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)
    }
)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Lights
 */

 const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
 directionalLight.position.set(0.25, -1, 2.25)
 scene.add(directionalLight)
 
 const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 1
scene.add(ambientLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.z = 4
camera.position.y = 1.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    antialias:true,
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true

/**
 * Generate the first galaxy
 */
 generateGalaxy()
/**
 * Debug
 */
const gui = new dat.GUI({
    // closed: true,
    width: 400
})
// gui.hide()

gui.add(mesh.position, 'y').min(- 3).max(3).step(0.01).name('elevation')
gui.add(mesh, 'visible')
gui.add(material1, 'wireframe')
//gui.addColor(parameters1, 'color').onChange(() =>{material.color.set(parameters1.color)})
//gui.add(parameters1, 'spin')


gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)



/**
 * Animate
 */
 const clock = new THREE.Clock()

 const tick = () =>
 {
     const elapsedTime = clock.getElapsedTime()
//logo planet rotation
     mesh.rotation.y -= 0.008;
 
     // Update material
     material.uniforms.uTime.value = elapsedTime
 
     // Update controls
     controls.update()
 
     // Render
     renderer.render(scene, camera)
 
     // Call tick again on the next frame
     window.requestAnimationFrame(tick)
 }
 
 tick()

//button fall anime.js
const element = document.querySelector("#btn");
element.addEventListener("click", () => {
  element.classList.add("animate__animated", "animate__hinge");
});

//set page change delay after button press
const transition = document.querySelector("#btn");
transition.addEventListener("click", () => {
  setTimeout(function () {
    window.location.href ="./portfolio/home.html";
  }, 2500);
});



