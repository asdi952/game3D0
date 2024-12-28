import { Mesh, Prefab, Prop } from "./engine3D";
import { cubeMesh } from "./meshs";


const allPrefabs:{[name:string]:Prefab} = {}

export function registerPrefab(name:string, prefab: Prefab){
    if( name in allPrefabs){
        console.error("prefabe name exists")
        return false
    }
    allPrefabs[name] = prefab
    return true
}

export function getPrefab(name:string){
    return allPrefabs[name]
}

registerPrefab("cube", Prefab.Defined(cubeMesh))

