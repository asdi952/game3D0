import { assert } from "console";
import { Vec2, Vec3 } from "./primitives";
import { asecDependencies } from "mathjs";
import { register } from "module";


enum BlockType{
    terrain,
    dig,
    void,
}

class Block{
    type: BlockType
    indexVertexArray:number
}

function createBlocks(size:Vec2):BlockType[]{
    const blocks = new Array(size.y +2)
    for(let y=0; y<size.y+2; y++){
        blocks[y] = new Array(size.x +2)
        for(let x=0; x<size.x+2; x++){
            if( x%2 == 0 && y%2 == 0){
                blocks[y][x] = BlockType.terrain
            }else{
                blocks[y][x] = BlockType.dig
            }
        }
    }
    for(let i=0; i<size.x+2; i++){
        blocks[0][i] = BlockType.void
    }
    for(let i=0; i<size.x+2; i++){
        blocks[size.y+1][i] = BlockType.void
    }
    for(let i=0; i<size.y+2; i++){
        blocks[i][0] = BlockType.void
    }
    for(let i=0; i<size.y+2; i++){
        blocks[i][size.x+1] = BlockType.void
    }
    return blocks
}

function terrainEquation0(x:number,y:number):number{
    const xf = 1 
    const yf = 1 
    return Math.sin(x * 2 * Math.PI * xf) * Math.sin(y * 2 * Math.PI * yf)
}

class Chunk{
    vertexs:Float32Array
    triIndex:Int32Array
    constructor(numOfVertices:number, numOfTriangules:number){
        this.vertexs = new Float32Array(numOfVertices * 3)
        this.triIndex = new Int32Array(numOfTriangules)
    }

}

function createChunk( blocks:BlockType[], blocksPos:Vec2, blocksSize:Vec2, vertexPerBlock:number, terrainFunction: (x:number, y:number)=>number):Chunk{

    const vertexs = []
    const triIndexs = []
    for(let by=0; by<blocksSize.y; by++){
        for(let bx=0; bx<blocksSize.x; bx++){
            switch(blocks[by][bx]){
                case BlockType.terrain:
                    //insert vertex
                    for(let y=0; y<vertexPerBlock-1; y++){
                        for(let x=0; x<vertexPerBlock-1; x++){
                            const px = bx + x/vertexPerBlock
                            const py = by + y/vertexPerBlock
                            const pz = terrainFunction(px,py)
                            vertexs.push(...[px,py,pz])
                        }
                    }
                    //insert triIndex


                    

                case BlockType.dig:
                case BlockType.void:
            }
            for(let x=0; x<vertexPerBlock; x++){
                for(let y=0; y<vertexPerBlock; y++){
                    // if()
                }
            }
        }
    }  
    return new Chunk(1,2)
    
}
export function a(){

}
export function generateMap(chunksCount:Vec2, blocksPerChunk:Vec2, vertexSidePerblock:number):Chunk[]{
    const blocksSizex = chunksCount.x * blocksPerChunk.x
    const blocksSizey = chunksCount.y * blocksPerChunk.y
    const blocks = createBlocks(Vec2.Defined( blocksSizex, blocksSizey))
   
    const chunks = new Array( chunksCount.y)

    for(let cy=0; cy<chunksCount.y; cy++){
        chunks[cy] = new Array(chunksCount.x)
        for(let cx=0; cx<chunksCount.x; cx++){
            const pos = Vec2.Defined(cx* blocksPerChunk.x, cy* blocksPerChunk.y)
            chunks[cy][cx] = createChunk(blocks, pos, blocksPerChunk, vertexSidePerblock, terrainEquation0)
        }
    }

    return chunks
}

// export const allGeneratorMaps:{[id:string]: (any)=>any} = {}
// function registerMapGenerator(fn:any){
//     allGeneratorMaps[fn.name] = fn    
// }

// registerMapGenerator( generateMap0)




