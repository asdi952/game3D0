import { trackSynchronousPlatformIOAccessInDev } from "next/dist/server/app-render/dynamic-rendering"
import { Matrix4x4_f32, perspectiveMatrix, Quaternion, Transform, transformToObjectMatrix, transformToViewMatrix, Vec2, Vec3 } from "./primitives"
import { TraceState } from "next/dist/trace"
import { Camera } from "./engine3D"
import { Game } from "./main"


//data ---
let gl:WebGL2RenderingContext

let vbo:WebGLBuffer|undefined = undefined
let vao:WebGLVertexArrayObject = undefined
let eib:WebGLBuffer|undefined = undefined

let shaderProg = undefined


let transform0:Transform
let transform1:Transform
let transform2:Transform
let transform3:Transform
let transform4:Transform
let transform5:Transform


const vertShaderCode = `#version 300 es
in vec3 vpos;
in vec3 vcol;
uniform  mat4 mvp;
out vec3 fcol;

void main() {
    gl_Position = mvp * vec4(vpos, 1.0);
    fcol = vcol;
}
`

const fragShaderCode = `#version 300 es
precision mediump float;
in vec3 fcol;
out vec4 fragColor;
uniform bool isBlack;

void main() {
    if(isBlack == true){
        fragColor = vec4(0,0,0, 1.0);
    }else{
        fragColor = vec4(fcol, 1.0);
    }
}
`
const TriVertices = new Float32Array([
    // Position      // Color
    0.0,  0.5,       1.0, 0.0, 0.0,  // Top vertex (Red)
   -0.5, -0.5,       0.0, 1.0, 0.0,  // Bottom-left vertex (Green)
    0.5, -0.5,       0.0, 0.0, 1.0   // Bottom-right vertex (Blue)
]);
const cubeVertices = new Float32Array([
    0.5, 0.5, 0.5,    1.0, 0.0, 0.0,
    0.5, -0.5, 0.5,    0.0, 1.0, 0.0,
    -0.5, -0.5, 0.5,    0.0, 0.0, 1.0,
    -0.5, 0.5, 0.5,    0.0, 5.0, 5.0,

    0.5, 0.5, -0.5,    1.0, 0.0, 0.0,
    0.5, -0.5, -0.5,    0.0, 1.0, 0.0,
    -0.5, -0.5, -0.5,    0.0, 0.0, 1.0,
    -0.5, 0.5, -0.5,    0.0, 5.0, 5.0,

])
const cubeTriIndex = new Uint8Array([
    // Front face
    0, 2, 1,  0, 3, 2,
    // Back face
    4, 5, 6,  4, 6, 7,
    // Top face
    0, 4, 7,  0, 7, 3,
    // Bottom face
    // 1, 6, 2,  1, 5, 6,
    1, 2, 6,  1, 6, 5,
    // Right face
    0, 1, 5,  0, 5, 4,
    // Left face
    3, 7, 6,  3, 6, 2
]);

const cubeOutlineIndex = new Uint16Array([
    0, 1, 1, 2, 2, 3, 3, 0,  // Front face (loop)
    4, 5, 5, 6, 6, 7, 7, 4,  // Back face (loop)
    0, 4, 1, 5, 2, 6, 3, 7   // Connecting the front and back faces
]);

let outlineEIB:WebGLBuffer|undefined = undefined

let prespMat:Matrix4x4_f32
let camera:Camera

//routines ---
function compileShader(type:GLenum, sourceCode:string){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error('Shader compilation failed');
    }
    return shader
}

export function initExample(_gl:WebGL2RenderingContext){
    gl = _gl
    if (!gl) {
        throw new Error("WebGL2RenderingContext is not initialized.");
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertShaderCode);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragShaderCode);

    shaderProg = gl.createProgram();
    gl.attachShader(shaderProg, vertexShader);
    gl.attachShader(shaderProg, fragmentShader);
    gl.linkProgram(shaderProg);

    if (!gl.getProgramParameter(shaderProg, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(shaderProg));
        gl.deleteProgram(shaderProg);
        throw new Error('Program linking failed');
    }

    vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW)

    eib = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eib)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeTriIndex, gl.STATIC_DRAW)

    outlineEIB = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineEIB)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeOutlineIndex, gl.STATIC_DRAW)

    const vposLocation = gl.getAttribLocation(shaderProg, "vpos")
    const vcolLocation = gl.getAttribLocation(shaderProg, "vcol")

    vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.vertexAttribPointer(vposLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0)
    gl.enableVertexAttribArray(vposLocation)

    gl.vertexAttribPointer(vcolLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
    gl.enableVertexAttribArray(vcolLocation)

    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    
    gl.enable(gl.DEPTH_TEST);
    // gl.depthRange(0.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); // Cull back faces


    transform0 = Transform.Identity()
    transform0.position = Vec3.Defined(0,0,0.75)
    transform0.scale.multiplyS_self(0.2)

    transform1 = transform0.clone()
    transform1.position.addV_self(Vec3.Defined(0.3,0,0))

    transform2 = transform0.clone()
    transform2.position.addV_self(Vec3.Defined(0.6,0.0,0))

    transform3 = transform0.clone()
    transform3.position.addV_self(Vec3.Defined(0.0,0.3,0))
    transform3.scale.multiplyS_self(0.5)

    transform4 = transform0.clone()
    transform4.position.addV_self(Vec3.Defined(0.3,0.3,0))
    transform4.scale.multiplyS_self(0.5)

    transform5 = transform0.clone()
    transform5.position.addV_self(Vec3.Defined(0.6,0.3,0))
    transform5.scale.multiplyS_self(0.5)

    camera = new Camera()
    // camera.transform.scale.multiplyS_self(4)
    // camera.transform.rotation.rotate_self(Vec3.Up(), Math.PI)
}

export function deinitExample(){
    gl.useProgram(shaderProg)
    gl.deleteBuffer(vbo)
    gl.deleteVertexArray(vao)
    gl.useProgram(null)
    gl.deleteProgram(shaderProg)
}

const rRotVel = 2
let tRotPos = 1





let viewAngle = Vec2.Defined(0,0)

function runCamera(game:Game, deltatime:number){ 

    const mouseSens = 0.008
      
    viewAngle.addV_self( game.mouseInput.dmouse.clone().multS_self(mouseSens))
    // camera.transform.rotation.rotate_self(Vec3.Up(), viewAngle.x * mouseSens)
    // camera.transform.rotation.rotate_self(Vec3.Right(), viewAngle.y * mouseSens)
    camera.transform.rotation = Quaternion.Identity().rotate_self(Vec3.Up(), -viewAngle.x).rotate_self(Vec3.Right(), -viewAngle.y)
    // console.log(game.mouseInput.dmouse)

    // console.log(viewAngle)
    const forwardVel = 1.2
    const sideVel = 1
    const upVel = 1
    const forwardSpeedMut = 4

    const dir = Vec3.Zero()
    if(game.keyboardInput.isKeyPressed("KeyW")){
        dir.z -= forwardVel
    }
    if(game.keyboardInput.isKeyPressed("KeyS")){
        dir.z += forwardVel
    }
    
    if(game.keyboardInput.isKeyPressed("KeyD")){
        dir.x += sideVel
    }
    if(game.keyboardInput.isKeyPressed("KeyA")){
        dir.x -= sideVel
    }
    if(game.keyboardInput.isKeyPressed("Space")){
        dir.y += upVel
    }
    if(game.keyboardInput.isKeyPressed("ControlLeft")){
        dir.y -= upVel
    }
    
    if(game.keyboardInput.isKeyPressed("ShiftLeft")){
        console.log("shif")
        dir.multiplyS_self(forwardSpeedMut)
    }
    
    dir.multiplyS_self(deltatime)
    const ndir = camera.transform.rotation.rotateVec3(dir)
    // console.log(ndir, ndir.magnitude())
    camera.transform.position.addV_self(ndir)

    if(game.keyboardInput.isKeyPressed("KeyC")){
        // camera.transform = Transform.Identity()
        // viewAngle = Vec2.Defined(Math.PI,0)
    }
}


function drawObj(transform:Transform, prespMat:Matrix4x4_f32, viewMat:Matrix4x4_f32){
    const mvpLocation = gl.getUniformLocation(shaderProg, "mvp")
    const isBlackLocation = gl.getUniformLocation(shaderProg, "isBlack")

    let objMat = transformToObjectMatrix(transform)
    let mvpMat = prespMat.multiplyM(viewMat).multiplyM(objMat)
    // let mvpMat = (viewMat).multiplyM(objMat)

    gl.uniformMatrix4fv(mvpLocation, true, mvpMat.mat)
    gl.uniform1i(isBlackLocation, 0)

    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eib)
    gl.drawElements(gl.TRIANGLES, cubeTriIndex.length, gl.UNSIGNED_BYTE, 0);

    gl.uniform1i(isBlackLocation, 1)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, outlineEIB)
    gl.drawElements(gl.LINES, cubeOutlineIndex.length, gl.UNSIGNED_SHORT, 0);
}

export function renderExample(game: Game, deltaTime:number){
    game.mouseInput.pollInputs()

    // moveProp(game, deltaTime)
    runCamera(game, deltaTime)
    // transform.rotation.rotate(Vec3.Forward(), 2*Math.PI * rRotVel *  deltaTime)
    // transform.rotation.rotate(Vec3.Up(), 2*Math.PI * rRotVel *  deltaTime)
    tRotPos += 2*Math.PI * 0.5 * deltaTime
    transform0.position = Vec3.Defined( Math.cos( tRotPos), Math.sin(tRotPos), 0).multiplyS_self(0.5)
    
    gl.useProgram(shaderProg)
    
    
    const mvpLocation = gl.getUniformLocation(shaderProg, "mvp")
    const isBlackLocation = gl.getUniformLocation(shaderProg, "isBlack")

    prespMat = perspectiveMatrix(Math.PI / 4 , 1.0, 0.01, 1000.0)
    const viewMat = transformToViewMatrix(camera.transform.inverse())
    
    
    //-------------------Block0 -------------------------------

    drawObj(transform0, prespMat, viewMat)
    drawObj(transform1, prespMat, viewMat)
    drawObj(transform2, prespMat, viewMat)
    drawObj(transform3, prespMat, viewMat)
    drawObj(transform4, prespMat, viewMat)
    drawObj(transform5, prespMat, viewMat)


    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)


}