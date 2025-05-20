import ComplexNumber from "./ComplexNumber.js";

let WIDTH, HEIGHT, RE_BORDER, IM_BORDER, MAX_ITERATIONS, ESCAPE_BORDER;

onmessage = e => {
    const Setup = e.data.Setup;
    if(Setup){
        WIDTH = e.data.WIDTH;
        HEIGHT = e.data.HEIGHT;
        RE_BORDER = e.data.RE_BORDER;
        IM_BORDER = e.data.IM_BORDER;
        MAX_ITERATIONS = e.data.maxIterations;
        ESCAPE_BORDER = e.data.escapeBorder;
    } else{
        const col = e.data.col;
        let mandelbrotSets = []
        for(let row = 0; row < HEIGHT; row++){
            mandelbrotSets[row] = mandelbrot(row, col);
        }
        postMessage({col, mandelbrotSets});
    }
}

function mandelbrot(row, col){
    let Z = new ComplexNumber(0, 0);
    let iter = 0;

    let [re, im] = mapToPlane(col, row)
    let m = 0
    while(m < ESCAPE_BORDER && iter < MAX_ITERATIONS){
        if (Z.imaginary === 0) Z.imaginary += 1e-12;
        Z.Square();
        Z.Add(re, im)
        m = Z.Modulus();
        iter++;
    }
    return [iter, m < ESCAPE_BORDER]
}


function mapToPlane(x, y){
    const re = RE_BORDER.start + (x / WIDTH) * (RE_BORDER.end - RE_BORDER.start);
    const im = IM_BORDER.start + (y / HEIGHT) * (IM_BORDER.end - IM_BORDER.start);
    return [re, im];
}

