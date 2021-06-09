///<reference path='utils.ts'/>

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let xscale = 1;

let slider = document.getElementById("rangec") as HTMLInputElement ;
let output = document.getElementById("range_value") as HTMLInputElement;
let func_select = document.getElementById("func_select") as HTMLSelectElement;

slider.addEventListener("input", function(){
    output.innerHTML = slider.value;
    xscale =  parseInt(slider.value);
});

function applyFtoX( x:number, f:(a:number) => number ) : Array<number> {
    let y1 = f(( (xscale*x) %360) * 0.0174533);
    let y2 = f(( (xscale*x) + xscale)%360 * 0.0174533);
    return [y1, y2] ;
}

//let i = 0;
let timer = 0;

function drawCirlce(x:number,y :number, rad:number){
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

let FuncLookup:any = {
    ["sin"]: Math.sin, 
    ["cos"]: Math.cos,
    ["tan"]: Math.tan,
    ["saw"]: (rad: number) => rad%Math.PI ,
    ["square"]: (rad:number) => step(rad, Math.PI)
};


function onSelectMathFunc(s:string){
    lookUpFunc = FuncLookup[s];
}

//let lookUpFunc = (x:number) => x%4;
let lookUpFunc = FuncLookup[func_select.value];

let draw_dir = 1;// can be either 0 or 1

function draw_FX(){
    let yoffset = 150;
    let r = 50;
    //let x = 0;
    let _dir = draw_dir * canvas.width;

    ctx.beginPath();
    for (let i =0; i < canvas.width; ++i){
        let x = i + timer;
        //let y = Math.sin(( (x) %360) * 0.0174533);
        //let y2 = f(( (xscale*x) + xscale)%360 * 0.0174533);

        let [y, y2] = applyFtoX( x, lookUpFunc );
        
        if (i == 0){
            ctx.moveTo(_dir - i, y*r + yoffset);
        }else{
            ctx.lineTo(_dir - i, y*r + yoffset);
        }
        // ctx.moveTo(_dir - i, 0 - y*r + yoffset);
        // ctx.lineTo(_dir - (i+1), 0 - y2*r + yoffset);
    }
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();

}

function update(time:number){
    timer += 12;
}

function render( time:number ){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //draw_path(x, y);
    draw_FX();
}

let stopFrameLoop = frameLoop( (time:number) => {
    update(time);
    render(time);
});

function pause(){
    stopFrameLoop();
}

var playbtn = document.getElementById('test') as HTMLButtonElement ;
var AudioContext = window.AudioContext;

var audioCtx = new AudioContext({
    latencyHint: 'interactive',
    sampleRate: 44100,
});

let channels:number = 1;
var frameCount = audioCtx.sampleRate * 2.0;

var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate );

playbtn.addEventListener("click",() => {
    console.log("helloworld from test");
    for (var channel = 0; channel < channels; channel++){
        var channelData = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++){
            //channelData[i] = Math.random() * 2 - 1;
            channelData[i] = Math.sin(( (360/100) * ( i%100) % 360 ) * 0.0174533);
        }
    }

    let source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();

    source.onended = () => {
        console.log('White noise finished');
    }
});





// sound stuff

