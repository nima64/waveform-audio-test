/** if b > a return 1 else returns 0 */
function step(a:number,b:number){
    return  b > a ? 1.0 : 0;   
}

function frameLoop( callback: (time:number)=>void ) {
    let running:Boolean  = true;

    let update = (time:any) =>{

        callback(time);
        if (running){
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);

    return () => { 
        if (!running){
            requestAnimationFrame(update);
        }
        running = !running;
     };
}

//export {frameLoop} ;