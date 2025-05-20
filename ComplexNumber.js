class ComplexNumber {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    Add(real, im){
        this.real += real;
        this.imaginary += im;
    }

    Square(){
        const re = this.real;
        const im = this.imaginary;
        this.real = re * re - im * im;
        this.imaginary = 2 * re * im;
    }

    Modulus(){
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary)
    }
}

export default ComplexNumber;


