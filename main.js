const TRACE_LENGTH_PARTS = 10
const TRACE_LENGTH_SKIP_STEPS = 8

const OBJECT_NUMBER = 100
const FIXED_DT = 0.5

let pos_x = 0;
let pos_y = 0;

function start() {
    const canvas = initCanvas();
    const ctx = canvas.getContext('2d');
    let numbers = [];
    const objects = [];

    const size_rect = canvas.width / 3
    const size_obj = size_rect / 12;
    const radius = size_obj / 2;
    let offsetX = radius;
    let offsetY = radius;

    const number_searched = rand(0, 100);

    for (let i = 0; i < OBJECT_NUMBER; i++) {
        // numbers[i] = rand(0, 1000);
        numbers[i] = i;
    }

    for (let i = 0; i < OBJECT_NUMBER; i++) {
        let object = new Object(
            new Vector(offsetX + pos_x * size_obj, offsetY + pos_y * size_obj),
            radius,
            numbers[i]
        );
        objects.push(object);

        if (size_rect > (pos_x * size_obj) + (size_obj)) pos_x++;
        else {
            pos_x = 0;
            pos_y++;
        }
    }

    const simulation = new Simulation(objects, number_searched);

    // utilizando setInterval para fazer uma busca assistida
    // busca binaria
    let inf = 0;
    let sup = objects.length - 1;
    let middle;
    let count = 0;

    setInterval(() => {
        // busca binaria
        if (inf <= sup) {
            count++;

            [inf, sup, middle] = simulation.updateBinarySearch(FIXED_DT, inf, sup, middle);
        }

        updateCanvas(canvas);
        simulation.render(ctx);
    }, FIXED_DT * 1000);

}

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `[${this.x.toFixed(2)}, ${this.y.toFixed(2)}]`
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    scale(factorX, factorY = factorX) {
        this.x *= factorX
        this.y *= factorY
        return this
    }

    magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    normalize() {
        let magnitude = this.magnitude();

        this.x /= magnitude;
        this.y /= magnitude;
        return this;
    }

    copy() {
        return new Vector(this.x, this.y);
    }
}

class Simulation {
    constructor(objects, number_searched) {
        this.objects = objects || [];
        this.objects.forEach(object => object.simulation = this);
        this.number_searched = number_searched;
    }

    updateBinarySearch(dt = FIXED_DT, inf, sup, middle) {

        middle = Math.floor((inf + sup) / 2);
        // if (number_searched == objects[middle].value) return middle;
        if (this.number_searched < this.objects[middle].value) sup = middle - 1;
        else inf = middle + 1;

        this.objects.forEach(object => object.update(dt));
        this.objects[middle].setColor(`rgba(0, 128, 0, 0.8)`);
        return [inf, sup, middle]
    }

    render(ctx) {
        this.objects.forEach(object => object.render(ctx));
    }

    removeObject(object) {
        this.objects = this.objects.filter(p => p != object)
    }
}

class Object {
    constructor(initialPosition = new Vector(), radius = 1, value = 0) {
        this.position = initialPosition;
        this.radius = radius;
        this.trace = [];
        this.font_size = radius * 0.6;
        this.value = value;
        this.color = `rgba(242, 100, 83, 0.8)`;
    }

    update(dt = FIXED_DT) {
        // this.position.add(new Vector(5, 0));

        // Add to trace
        // let snapshot = { position: this.position.copy(), velocity: this.velocity.magnitude() }
        // if (this.traceStep > TRACE_LENGTH_SKIP_STEPS) {
        //     this.trace.push(snapshot)
        //     this.trace = this.trace.slice(Math.max(0, this.trace.length - TRACE_LENGTH_PARTS))
        //     this.traceStep = 0
        // } else {
        //     this.traceStep = (this.traceStep || 0) + 1
        //     this.trace[this.trace.length - 1] = snapshot
        // }
    }

    render(ctx) {
        this.renderObject(ctx);
        this.renderTrace(ctx);
    }

    renderTrace(ctx) {
        if (this.trace.length > 1) {
            for (let i = 1; i < this.trace.length; i++) {
                ctx.beginPath()
                ctx.moveTo(this.trace[i - 1].position.x, this.trace[i - 1].position.y)
                ctx.lineTo(this.trace[i].position.x, this.trace[i].position.y)
                ctx.strokeStyle = colorForTrace(i, TRACE_LENGTH_PARTS)
                ctx.stroke()
            }
        }
    }

    renderObject(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 360);
        ctx.strokeStyle = this.exceeded_max_acceleration ? '#FF0000' : 'transparent';
        ctx.fillStyle = this.color;
        ctx.stroke();
        ctx.fill();

        var message = this.value; //Define a mensagem
        ctx.font = `${this.font_size}pt Arial`; //Define Tamanho e fonte
        ctx.fillStyle = 'black'; //Define a cor
        ctx.fillText(message,
            this.position.x - Math.floor(this.font_size),
            this.position.y + Math.floor(this.font_size / 2)); //Desenha a mensagem

    }

    setColor(color) {
        this.color = color
    }

    // color() {
    //     return this.color
    // }
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

window.onload = start;