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
var slider = document.getElementById("rangec");
var slider_label = document.getElementById("range_value");
var func_select = document.getElementById("func_select");
var FX_data = document.getElementById("fx");
var addFX_btn = document.getElementById("addFX");
var volume_slider = document.getElementById("volume_slider");
var playbtn = document.getElementById('test');
var volume = 0.4;
var xscale = 1;
var testfx = function (x) { return "wrong input"; };
document.addEventListener("DOMContentLoaded", function (e) {
    xscale = parseInt(slider.value);
    slider_label.innerHTML = slider.value;
    volume = parseInt(volume_slider.value) / 100.0;
});
volume_slider.addEventListener("input", function () {
    volume = parseInt(volume_slider.value) / 100.0;
    console.log(volume);
});
slider.addEventListener("input", function () {
    slider_label.innerHTML = slider.value;
    xscale = parseInt(slider.value);
});
addFX_btn.addEventListener("click", function (e) {
    var fxstr = FX_data.value;
    if ((fxstr).trim() != "") {
        var eval_str = "testfx = " + fxstr;
        try {
            eval(eval_str);
        }
        catch (_a) {
            alert("invalid input");
        }
        ;
        console.log(typeof testfx(1.0));
        if (typeof testfx(1.0) != "number") {
            //alert("invalid input");
        }
        else {
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
var channels = 2;
var DURATION = 2.0;
var frameCount = audioCtx.sampleRate * DURATION;
//let real_freq = (360 - xscale) + 1;
var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
playbtn.addEventListener("click", function () {
    for (var channel = 0; channel < channels; channel++) {
        var channelData = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++) {
            //channelData[i] = Math.random() * 2 - 1;
            channelData[i] = applyFtoX(i, lookUpFunc) * volume;
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
//let i = 0;
var timer = 0;
function draw_func(i, x, yoffset, render_func) {
    var r = 50;
    var _dir = draw_dir * canvas.width;
    var y = applyFtoX(x, render_func);
    if (x == 0) {
        ctx.moveTo(_dir - i, 0 - y * r + yoffset);
    }
    else {
        ctx.lineTo(_dir - (i + 1), 0 - y * r + yoffset);
    }
}
function draw_func2(i, x, yoffset, render_func) {
    var r = 50;
    var _dir = draw_dir * canvas.width;
    var _a = applyFtoX_Iter(x, render_func), y = _a[0], y2 = _a[1];
    ctx.moveTo(_dir - i, 0 - y * r + yoffset);
    ctx.lineTo(_dir - (i + 1), 0 - y2 * r + yoffset);
}
function applyFtoX(x, f) {
    var y = f(Math.PI * 2 / xscale * (x % xscale));
    return y;
}
function applyFtoX_Iter(x, f) {
    var y = f(Math.PI * 2 / xscale * x);
    var y2 = f(Math.PI * 2 / xscale * (x + 1));
    return [y, y2];
}
function drawCirlce(x, y, rad) {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
var FuncLookup = (_a = {},
    _a["mix"] = function (x) { return Math.sin(x) + Math.cos(x); },
    _a["sin"] = Math.sin,
    _a["cos"] = Math.cos,
    _a["tan"] = Math.tan,
    _a["saw"] = function (rad) { return rad % Math.PI; },
    _a["square"] = function (rad) {
        // console.log("size of x is ", rad);
        return step(0, Math.sin(rad));
    },
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
    for (var i = 0; i <= canvas.width; i++) {
        var x = i + timer;
        //let _dir = draw_dir * canvas.width;
        //draw_func(i,x,200, FuncLookup["saw"]);
        draw_func(i, x, 200, lookUpFunc);
    }
    ctx.stroke();
    ctx.closePath();
}
var stop_timer = false;
function update(time) {
    if (!stop_timer)
        timer += 4;
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
    stop_timer = !stop_timer;
    ///stopFrameLoop();
}
