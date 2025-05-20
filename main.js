const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let WIDTH;
let HEIGHT;

let worker;
let colorPallete = [];
let RE_BORDER = {start: -2.5, end: 1};
let IM_BORDER = {start: -1.25, end: 1.25};

let MAX_ITERATIONS = 200;
let ESCAPE_BORDER = 2;
let ZOOM_FACTOR = 1.5

let col;


function start(){
    worker.postMessage({col: col})
}

function draw(response){
    const col = response.data.col;
    const mandelbrotSets = response.data.mandelbrotSets;

    if (col + 1 < WIDTH)
        worker.postMessage({ col: col + 1 })

    for(let i = 0; i < HEIGHT; i++){
        const [m, isMandelbrotSet] = mandelbrotSets[i];
        let color = isMandelbrotSet ? [0, 0, 0] : colorPallete[m % (colorPallete.length - 1)]
        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        ctx.fillRect(col, i, 1, 1)
    }
}

function init(){
    col = 0;
    if(worker) worker.terminate();
    worker = new Worker('mandelbrotWorker.js', {type: 'module'});
    worker.postMessage({WIDTH, HEIGHT, RE_BORDER, IM_BORDER, maxIterations: MAX_ITERATIONS, escapeBorder: ESCAPE_BORDER, Setup: 1});
    worker.onmessage = draw;
    start();
}



function interpolateColor(color1, color2, t) {
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t),
    ];
}

function palette(size = 250) {
    const stops = [
        [255, 0, 0],
        [255, 255, 0],
        [0, 255, 0],
        [0, 255, 255],
        [0, 0, 255],
        [255, 0, 255],
    ];

    let colors = [];
    const pairs = stops.length - 1;
    const stepsPerPair = size / pairs;

    for (let i = 0; i < size; i++) {
        const pair = Math.floor(i / stepsPerPair);
        const t = (i % stepsPerPair) / stepsPerPair;
        colors.push(interpolateColor(stops[pair], stops[pair + 1], t));
    }


    return colors;
}

function resize(){
    canvas.width = canvas.clientWidth;
    WIDTH = canvas.clientWidth;

    canvas.height = canvas.clientHeight;
    HEIGHT = canvas.clientHeight;

    init();
}

window.addEventListener("resize", resize);

const zoomInBtn = document.getElementById('zoomIn');

zoomInBtn.addEventListener("click", () => {
    if(zoomInBtn.classList.contains('pressed')){
        zoomInBtn.classList.remove('pressed')
        return;
    }

    zoomInBtn.classList.add('pressed')
});

document.getElementById("zoomOut").addEventListener("click", () => {
    document.getElementById("zoomIn").classList.remove("pressed");

    zoom(1 / ZOOM_FACTOR);
});


document.getElementById("reset").addEventListener("click", () => {
    RE_BORDER = { start: -2.5, end: 1 };
    IM_BORDER = { start: -1.25, end: 1.25 };
    MAX_ITERATIONS = 200;
    ESCAPE_BORDER = 2;

    document.getElementById("iterationsCount").value = MAX_ITERATIONS;
    document.getElementById("escapeBorder").value = ESCAPE_BORDER;

    init();
});


canvas.addEventListener("click", (e) => {
    if (!zoomInBtn.classList.contains('pressed')) return;

    zoom(ZOOM_FACTOR, e)

    zoomInBtn.classList.remove('pressed')

});

function zoom(ZOOM_FACTOR, e = null) {
    const real_range = RE_BORDER.end - RE_BORDER.start;
    const imag_range = IM_BORDER.end - IM_BORDER.start;

    let real_position, im_position;

    if (e) {
        real_position = RE_BORDER.start + (e.offsetX / canvas.width) * real_range;
        im_position = IM_BORDER.start + (e.offsetY / canvas.height) * imag_range;
    } else {
        real_position = (RE_BORDER.start + RE_BORDER.end) / 2;
        im_position = (IM_BORDER.start + IM_BORDER.end) / 2;
    }

    const new_real_range = real_range * (1 / ZOOM_FACTOR);
    const new_imag_range = imag_range * (1 / ZOOM_FACTOR);

    RE_BORDER = {
        start: real_position - new_real_range / 2,
        end: real_position + new_real_range / 2
    };

    IM_BORDER = {
        start: im_position - new_imag_range / 2,
        end: im_position + new_imag_range / 2
    };

    init()
}

document.getElementById("customZoom").addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
        ZOOM_FACTOR = value;
    }
});

document.getElementById("updateParams").addEventListener("click", () => {
    const iterInput = parseInt(document.getElementById("iterationsCount").value);
    const escapeInput = parseFloat(document.getElementById("escapeBorder").value);

    if (!isNaN(iterInput) && iterInput > 0) {
        MAX_ITERATIONS = iterInput;
    }

    if (!isNaN(escapeInput) && escapeInput > 0) {
        ESCAPE_BORDER = escapeInput;
    }

    init();
});

function initialSetup(){
    document.getElementById("customZoom").dispatchEvent(new Event('input'))

    canvas.width = canvas.clientWidth;
    WIDTH = canvas.clientWidth;

    canvas.height = canvas.clientHeight;
    HEIGHT = canvas.clientHeight;

    colorPallete = palette();

    document.getElementById("reset").click();
}

initialSetup()
