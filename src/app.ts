///<reference path='utils.ts'/>


let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let slider = document.getElementById("rangec") as HTMLInputElement ;
let slider_label = document.getElementById("range_value") as HTMLInputElement;
let func_select = document.getElementById("func_select") as HTMLSelectElement;
let FX_data = document.getElementById("fx") as HTMLTextAreaElement;
let addFX_btn = document.getElementById("addFX") as HTMLButtonElement;
let volume_slider = document.getElementById("volume_slider") as HTMLInputElement;
var playbtn = document.getElementById('test') as HTMLButtonElement ;

var volume:number = 0.4;
let xscale = 1;
let testfx:Function = (x:number) => "wrong input";

document.addEventListener("DOMContentLoaded",(e) => {
    xscale = parseInt(slider.value);
    slider_label.innerHTML = slider.value;
    volume = parseInt(volume_slider.value)/100.0;
});

volume_slider.addEventListener("input", () => {
    volume = parseInt(volume_slider.value)/100.0;
    console.log(volume);
});

slider.addEventListener("input", function(){
    slider_label.innerHTML = slider.value;
    xscale =  parseInt(slider.value);
});

addFX_btn.addEventListener("click", (e) => {
    let fxstr = FX_data.value;
    if ((fxstr).trim() != ""){
        let eval_str = "testfx = " + fxstr;
        try {
            eval(eval_str);
        }catch{
            alert("invalid input");
        };
        console.log(typeof testfx(1.0) )
        if (typeof testfx(1.0) != "number"){
            //alert("invalid input");
        }else{
            lookUpFunc = testfx;
        }
        // let eval_str = "lookUpFunc = " + fxstr;
        // console.log(eval_str);
        // eval(eval_str);
    }
});

var AudioContext = window.AudioContext;

var audioCtx = new AudioContext({
    latencyHint: 'interactive',
    sampleRate: 44100,
});

let channels:number = 2;
var DURATION = 2.0;
var frameCount = audioCtx.sampleRate * DURATION;
//let real_freq = (360 - xscale) + 1;

var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate );

playbtn.addEventListener("click",() => {
    for (var channel = 0; channel < channels; channel++){
        var channelData = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++){
            //channelData[i] = Math.random() * 2 - 1;
            channelData[i] =  applyFtoX( i, lookUpFunc )* volume ;
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


//let i = 0;
let timer = 0;

function draw_func(i:number ,x:number, yoffset:number, render_func:(a:number)=>number){
    let r = 50;
    let _dir = draw_dir * canvas.width;
    let y = applyFtoX(x,render_func);
    
    if (x == 0){
        ctx.moveTo(_dir - i, 0 - y*r + yoffset);
    }else {
        ctx.lineTo(_dir - (i+1), 0 - y*r + yoffset);
    }
}

function draw_func2(i:number ,x:number, yoffset:number, render_func:(a:number)=>number){
    let r = 50;
    let _dir = draw_dir * canvas.width;
    let [y,y2] = applyFtoX_Iter(x,render_func);
    
    ctx.moveTo(_dir - i, 0 - y*r + yoffset);
    ctx.lineTo(_dir - (i+1), 0 - y2*r + yoffset);
}

function applyFtoX( x:number, f:(a:number) => number ) : number {
    let y = f(Math.PI*2/xscale * (x % xscale));
    return y;
}

function applyFtoX_Iter( x:number, f:(a:number) => number ) : Array<number> {
    let y = f(Math.PI*2/xscale * x );
    let y2 = f(Math.PI*2/xscale * (x+1) );
    return [y,y2];
}


function drawCirlce(x:number,y :number, rad:number){
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

let FuncLookup:any = {
    ["mix"]: (x:number) => Math.sin(x) + Math.cos(x),
    ["sin"]: Math.sin, 
    ["cos"]: Math.cos,
    ["tan"]: Math.tan,
    ["saw"]: (rad: number) => rad%Math.PI ,
    ["square"]: (rad:number) => {
        // console.log("size of x is ", rad);
        return step(0, Math.sin(rad));
    }
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
    for (let i =0; i <= canvas.width; i++){
        let x = i + timer;
        //let _dir = draw_dir * canvas.width;
        //draw_func(i,x,200, FuncLookup["saw"]);
        draw_func(i,x,200, lookUpFunc);
    }
    ctx.stroke();
    ctx.closePath();
}

let stop_timer = false;

function update(time:number){
    if (!stop_timer)
        timer += 4;
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
    stop_timer = !stop_timer;
    ///stopFrameLoop();
}

