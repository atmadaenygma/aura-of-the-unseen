import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const VOCShaderImpl = shaderMaterial(
  { uTime: 0, uTexture: null, uSelfControl: 1.0 },
  // Vertex
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // Fragment
  `uniform sampler2D uTexture;
   uniform float uTime;
   uniform float uSelfControl;
   varying vec2 vUv;
   void main() {
     vec4 tex = texture2D(uTexture, vUv);
     float pulse = sin(uTime * 0.8) * 0.05 * (1.0 - uSelfControl);
     vec3 color = mix(tex.rgb, vec3(0.0, 0.15, 0.15), (1.0 - uSelfControl) * 0.5);
     gl_FragColor = vec4(color + pulse, tex.a);
     if(gl_FragColor.a < 0.1) discard;
   }`
)

extend({ VOCShaderImpl })
export { VOCShaderImpl }