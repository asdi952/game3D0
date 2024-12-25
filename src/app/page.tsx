'use client'
import { RefObject, useEffect, useRef, useState } from "react";
import { Game } from "@/game/main";
import { deinitExample } from "@/game/example";
export default function Home() {
  const canvasRef:RefObject<HTMLCanvasElement> = useRef(undefined)
  const canvasSize = useState([900,800])

  let game:Game
  let ctxGl:WebGL2RenderingContext

  function devInit(){
    // window.addEventListener("keypress", (event)=>{
    //   if(event.code == "Space"){
    //   }
    // })
  }


  
  useEffect(()=>{
    const gl = canvasRef.current.getContext("webgl2")
    if (gl == undefined){
      console.error("fail to load webgl2 context")
      return
    }
    ctxGl = gl
    devInit()
    game = new Game()
    game.init(gl)
    window.addEventListener(
      'beforeunload',
      function(e){
          e.stopPropagation();e.preventDefault();return false;
      },
      true
  );
    window.addEventListener("keydown", (e)=>{
      if (e.ctrlKey && e.code === 'KeyW') {
          e.preventDefault(); // Prevent the default action (closing the tab)
          console.log("Ctrl + W is disabled!");
      }
      game.keyboardInput.processKeyDown(e)})
    window.addEventListener("keyup", (e)=>{game.keyboardInput.processKeyUp(e)})

    // window.addEventListener("keydown", (e)=>{
    //   if(e.code == "KeyF"){
    //     if (!document.fullscreenElement) {
    //       canvasRef.current.requestFullscreen();
    //     } else if (document.exitFullscreen) {
    //       document.exitFullscreen();
    //     }

    //   }

    // })

    // canvasRef.current.addEventListener("click",()=>{
    //   canvasRef.current.requestPointerLock();
    // })
    // canvasRef.current.addEventListener("mousemove", (e)=>{
    //   console.log("mouse move", e)
    // })

    canvasRef.current.addEventListener("mousemove", (e)=>{game.mouseInput.processMouseMove(e)})
    canvasRef.current.addEventListener("mouseenter", (e)=>{game.mouseInput.processMouseEnter(e)})
    canvasRef.current.addEventListener("mouseleave", (e)=>{game.mouseInput.processMouseLeave(e)})

    canvasRef.current.addEventListener("pointerdown", (e)=>{
      canvasRef.current.setPointerCapture(e.pointerId)
    })

    game.start()
    return ()=>{ game.stop(); game.deinit()} 
  },[])

  return (
    <>
      {/* <div className="bg-gray-300 inline-block"> */}
        <canvas className="" ref={canvasRef}  width={canvasSize[0][0]} height={canvasSize[0][1]}></canvas>
      {/* </div> */}
    </>
  );
}
