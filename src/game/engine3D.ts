import { Transform } from "./primitives"



export class Camera{
    parentScene: Scene
    transform:Transform

    constructor(){
        this.transform = Transform.Identity()
    }
}
export class Prop{
    parentScene:Scene
    transform:Transform
}
class Scene{
    parentWorld:World
    transform:Transform
    scenes:Scene[]
    props:Prop[]

}
class World{
    rootScene:Scene
    activeCamera: Camera
}

class Render{

    render(){
        
    }
}