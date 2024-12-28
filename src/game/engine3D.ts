import { TraceState } from "next/dist/trace"
import { Transform } from "./primitives"
import assert from "assert"




export class Mesh{
    vertexs:Float32Array
    triIndex:Uint16Array

    static Defined(vertexs:Float32Array, triIndex:Uint16Array){
        const m = new Mesh()
        m.vertexs = vertexs
        m.triIndex = triIndex
        return m
    }
}
class ListImutableIndex<TYPE>{
    slots:TYPE[]
    freeSlots:number[]

    constructor(){
        this.slots = []
        this.freeSlots = []
    }

    push(e:TYPE){
        const fslot = this.freeSlots.pop()
        if(fslot != undefined){
            this.slots[fslot] = e
        }else{
            this.slots.push(e)
        }
    }
    remove(index:number):TYPE{
        assert(index > 0 && index < this.slots.length)

        const holder = this.slots[index]
        this.slots[index] = undefined
        this.freeSlots.push(index)
        return holder
    }
    values(){
        return this.slots.filter(e=> e != undefined)
    }
    
}
export class Prefab{
    state: Prefab.State
    mesh:Mesh

    vbo:WebGLBuffer[]
    eib:WebGLBuffer[]
    vao:WebGLVertexArrayObject[]

    props:ListImutableIndex<Prop>

    constructor(){
        this.state = Prefab.State.uinit
    }
    static Defined(mesh: Mesh){
        const p = new Prefab()
        p.mesh = mesh
        return p
    }
}
export namespace Prefab{
    export enum State{
        uinit,
        init,
    }
}
export class Prop{
    parentScene:Scene|undefined
    
    //---------Prefab -------
    prefab:Prefab
    prefebId:number
    transform:Transform

    static Defined(prefab:Prefab, transform:Transform){
        const p = new Prop()
        p.transform = transform
        p.prefab = prefab
    }

    onTreeEnter(parentScene:Scene){
        this.parentScene = parentScene
    }   
}
export class Camera{
    parentScene: Scene
    transform:Transform

    constructor(){
        this.transform = Transform.Identity()
    }
    onTreeEnter(parentScene:Scene){
        this.parentScene = parentScene
    }  
}
export class Scene{
    parentWorld:RenderBundle
    parentScene:Scene

    transform:Transform
    scenes:Scene[]
    props:Prop[]

    prefabsContained: Prefab

}
export class RenderBundle{
    rootScene:Scene
    activeCamera: Camera

    prefabsContained: Prefab

    setRootScene(scene:Scene){

    }
}


function render(gl:WebGL2RenderingContext, renderBundle:RenderBundle){

    for(let scene of renderBundle.rootScene.scenes){

    }
}