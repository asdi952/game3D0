import { Transform } from "stream"
import { deinitExample, initExample, renderExample } from "./example"
import { Vec2 } from "./primitives"
import React from "react"

enum State {
    deinit,
    idle,
    run,

}

class GameState{
    //change on construct
    state:State
    //change on init
    gl:WebGL2RenderingContext
    //change one start
    lastTime:DOMHighResTimeStamp

    constructor(){
        this.state = State.deinit
    }
    init(gl:WebGL2RenderingContext){
        this.gl = gl
    }
}


class KeyState{
    code:string

    pressed:boolean

    constructor(code:string){
        this.code = code
        this.pressed = false
    }
    
    keyDown(){
        this.pressed = true
    }
    keyUp(){
        this.pressed = false
    }
}


class KeyboardInput{
    inputs:{[code:string]:KeyState} = {}


    processKeyDown(event:KeyboardEvent){
        let key = this.inputs[event.code]
        if(key == undefined){
            key = new KeyState(event.code)
            this.inputs[event.code] = key
        }
        key.keyDown()
    }
    processKeyUp(event:KeyboardEvent){
        let key = this.inputs[event.code]
        if(key == undefined){
            key = new KeyState(event.code)
            this.inputs[event.code] = key
        }
        key.keyUp()
    }

    isKeyPressed(keyCode:string){
        let key = this.inputs[keyCode]
        if(key == undefined){
            return false
        }
        return key.pressed
    }
}

class MouseInput{
    private inner:{
        mouse:Vec2
        mouseOut:boolean
    }

    mouse:Vec2
    dmouse:Vec2
    lmouse:Vec2
    mouseOut:boolean

    constructor(){
        this.mouse = Vec2.Zero()
        this.lmouse = Vec2.Zero()
        this.dmouse = Vec2.Zero()
        this.mouseOut = true

        this.inner = {
            mouse: Vec2.Zero(),
            mouseOut:true
        }

    }
    pollInputs(){
        const lmouse = this.mouse
        this.mouse = this.inner.mouse.clone()
        
        if(this.mouseOut == true && this.inner.mouseOut == false){
            this.mouseOut = false
            this.lmouse = this.mouse.clone()
            this.dmouse = Vec2.Zero()
            console.log("in")
        }else{
            this.lmouse = lmouse
            this.dmouse = this.mouse.subV(this.lmouse)
        }
        this.mouseOut = this.inner.mouseOut
        // console.log(this.dmouse)
    }
    processMouseMove(e: MouseEvent){
        this.inner.mouse = Vec2.Defined(e.clientX, e.clientY)
        this.inner.mouseOut = false
    }
    processMouseEnter(e:MouseEvent){
        this.inner.mouse = Vec2.Defined(e.clientX, e.clientY)
        this.inner.mouseOut = false
    }
    
    processMouseLeave(e:MouseEvent){
        this.inner.mouse = Vec2.Defined(e.clientX, e.clientY)
        this.inner.mouseOut = true
    }
}

export class Game{
    state: GameState
    intervalId:NodeJS.Timeout|undefined

    keyboardInput: KeyboardInput
    mouseInput: MouseInput

    constructor(){
        this.state = new GameState()
        this.keyboardInput = new KeyboardInput()
        this.mouseInput = new MouseInput()
    }

    init(gl:WebGL2RenderingContext){
        this.state.gl = gl

        initExample(gl)
    }
    deinit(){
        deinitExample()
    }

    async start(){
        if(this.intervalId != undefined){
            console.error("this.intervalid != undefined")
            return
        }

        this.state.lastTime = window.performance.now()
        this.state.state = State.run
        this.#run()
        this.intervalId = setInterval(()=>{ this.#run()}, 1000/60)
    }
    async stop(){
        this.state.state = State.idle
        clearInterval(this.intervalId)
        this.intervalId = undefined
    }

    async #run(){
        const curTime = window.performance.now()
        const dtime = curTime - this.state.lastTime
        const gl = this.state.gl


        gl.clearColor(1,1,0,1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        renderExample(this, dtime/1000)

        this.state.lastTime = curTime
    }
}

