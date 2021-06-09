"use strict";
/** if b > a return 1 else returns 0 */
function step(a, b) {
    return b > a ? 1.0 : 0;
}
function frameLoop(callback) {
    var running = true;
    var update = function (time) {
        callback(time);
        if (running) {
            requestAnimationFrame(update);
        }
    };
    requestAnimationFrame(update);
    return function () {
        if (!running) {
            requestAnimationFrame(update);
        }
        running = !running;
    };
}
//export {frameLoop} ;
///<reference path='utils.ts'/>
var _a;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var xscale = 1;
var slider = document.getElementById("rangec");
var output = document.getElementById("range_value");
var func_select = document.getElementById("func_select");
slider.addEventListener("input", function () {
    output.innerHTML = slider.value;
    xscale = parseInt(slider.value);
});
function applyFtoX(x, f) {
    var y1 = f(((xscale * x) % 360) * 0.0174533);
    var y2 = f(((xscale * x) + xscale) % 360 * 0.0174533);
    return [y1, y2];
}
//let i = 0;
var timer = 0;
function drawCirlce(x, y, rad) {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
var FuncLookup = (_a = {},
    _a["sin"] = Math.sin,
    _a["cos"] = Math.cos,
    _a["tan"] = Math.tan,
    _a["saw"] = function (rad) { return rad % Math.PI; },
    _a["square"] = function (rad) { return step(rad, Math.PI); },
    _a);
function onSelectMathFunc(s) {
    lookUpFunc = FuncLookup[s];
}
//let lookUpFunc = (x:number) => x%4;
var lookUpFunc = FuncLookup[func_select.value];
var draw_dir = 1; // can be either 0 or 1
function draw_FX() {
    var yoffset = 150;
    var r = 50;
    //let x = 0;
    var _dir = draw_dir * canvas.width;
    ctx.beginPath();
    for (var i = 0; i < canvas.width; ++i) {
        var x = i + timer;
        //let y = Math.sin(( (x) %360) * 0.0174533);
        //let y2 = f(( (xscale*x) + xscale)%360 * 0.0174533);
        var _a = applyFtoX(x, lookUpFunc), y = _a[0], y2 = _a[1];
        if (i == 0) {
            ctx.moveTo(_dir - i, y * r + yoffset);
        }
        else {
            ctx.lineTo(_dir - i, y * r + yoffset);
        }
        // ctx.moveTo(_dir - i, 0 - y*r + yoffset);
        // ctx.lineTo(_dir - (i+1), 0 - y2*r + yoffset);
    }
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();
}
function update(time) {
    timer += 12;
}
function render(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw_path(x, y);
    draw_FX();
}
var stopFrameLoop = frameLoop(function (time) {
    update(time);
    render(time);
});
function pause() {
    stopFrameLoop();
}
var playbtn = document.getElementById('test');
var AudioContext = window.AudioContext;
var audioCtx = new AudioContext({
    latencyHint: 'interactive',
    sampleRate: 44100,
});
var channels = 1;
var frameCount = audioCtx.sampleRate * 2.0;
var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
playbtn.addEventListener("click", function () {
    console.log("helloworld from test");
    for (var channel = 0; channel < channels; channel++) {
        var channelData = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++) {
            //channelData[i] = Math.random() * 2 - 1;
            channelData[i] = Math.sin(((360 / 100) * (i % 100) % 360) * 0.0174533);
        }
    }
    var source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioCtx.destination);
    source.start();
    source.onended = function () {
        console.log('White noise finished');
    };
});
// sound stuff
