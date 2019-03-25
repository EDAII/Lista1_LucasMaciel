const TRACE_LENGTH_PARTS = 10;
const TRACE_LENGTH_SKIP_STEPS = 8;
const OBJECTS_NUMBER = 100;
const FIXED_DT = 0.5;
const SEARCH_TEXT_SIZE = 25;
const DISTANCE_BETWEEN_SIMULATIONS = window.innerWidth / 4;
const RATIO_INDEX_TABLE = 10;
const INDEX_BLOCK_SIZE = OBJECTS_NUMBER / RATIO_INDEX_TABLE;


function start() {
    const canvas = initCanvas();
    const ctx = canvas.getContext('2d');
    let numbers = [];
    const binarySearchObjects = [];
    const indexSearchObjects = [];
    let pos_x = 0;
    let pos_y = 0;

    const size_rect = canvas.width / 3
    const size_obj = size_rect / 12;
    const radius = size_obj / 2;
    let offsetX = radius + 10; // distancia da borda
    let offsetY = radius + 70;

    const number_searched = rand(0, 100); // numero a ser encontrado

    for (let i = 0; i < OBJECTS_NUMBER; i++) {
        // numbers[i] = rand(0, 1000);
        numbers[i] = i;
    }

    // criar simulation para busca binaria
    for (let i = 0; i < OBJECTS_NUMBER; i++) {
        let object = new Object(
            new Vector(offsetX + pos_x * size_obj, offsetY + pos_y * size_obj),
            radius,
            numbers[i]
        );
        binarySearchObjects.push(object);

        if (size_rect > (pos_x * size_obj) + (size_obj)) pos_x++;
        else {
            pos_x = 0;
            pos_y++;
        }
    }
    const binarySearchSimulation = new Simulation(binarySearchObjects, number_searched, "Busca Binaria", offsetX - radius, offsetY - 20);

    // criar simulation para busca sequencial indexada
    offsetX = radius + size_rect + DISTANCE_BETWEEN_SIMULATIONS; // distancia da borda
    offsetY = radius + 70;
    pos_x = 0;
    pos_y = 0;
    for (let i = 0; i < OBJECTS_NUMBER; i++) {
        let object = new Object(
            new Vector(offsetX + pos_x * size_obj, offsetY + pos_y * size_obj),
            radius,
            numbers[i]
        );
        indexSearchObjects.push(object);

        if (size_rect > (pos_x * size_obj) + (size_obj)) pos_x++;
        else {
            pos_x = 0;
            pos_y++;
        }
    }


    const indexSearchSimulation = new Simulation(indexSearchObjects, number_searched, "Busca Sequencial Indexada", offsetX - radius, offsetY - 20);

    search_thread(binarySearchSimulation, indexSearchSimulation, ctx);
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
    constructor(objects, number_searched, message = "", pos_msg_x, pos_msg_y) {
        this.objects = objects || [];
        this.objects.forEach(object => object.simulation = this);
        this.number_searched = number_searched;
        this.message = message;
        this.pos_msg_x = pos_msg_x;
        this.pos_msg_y = pos_msg_y;
    }

    // metodo de busca binaria
    updateBinarySearch(dt = FIXED_DT, inf, sup, middle) {
        middle = Math.floor((inf + sup) / 2);
        if (this.number_searched == this.objects[middle].value) {
            this.objects[middle].setColor(`rgba(0, 128, 0, 0.8)`);
            return [inf, sup, middle]
        }
        if (this.number_searched < this.objects[middle].value) sup = middle - 1;
        else inf = middle + 1;
        this.objects.forEach(object => object.update(dt));
        this.objects[middle].setColor(`rgba(0, 50, 180, 0.8)`);
        return [inf, sup, middle]
    }

    // metodo de busca sequencial
    updateSequenceSearch(dt = FIXED_DT, index) {
        if (this.number_searched == this.objects[index].value) {
            this.objects[index].setColor(`rgba(0, 128, 0, 0.8)`);
            return true;
        }
        this.objects.forEach(object => object.update(dt));
        this.objects[index].setColor(`rgba(0, 50, 180, 0.8)`);
        return index+=1
    }

    render(ctx) {
        ctx.beginPath();

        var message = this.message; //Define a mensagem
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`; //Define Tamanho e fonte
        ctx.fillStyle = 'white'; //Define a cor
        ctx.fillText(message, this.pos_msg_x, this.pos_msg_y); //Desenha a mensagem
        this.objects.forEach(object => object.render(ctx));
    }

    removeObject(object) {
        this.objects = this.objects.filter(p => p != object)
    }

    copy() {
        return new Simulation(this.objects, this.number_searched);
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

function generateIndexTable(list) {
    const size = list.objects.length;
    let indexTable = [];
    // dividir lista em n pedacos
    const blockSize = size / RATIO_INDEX_TABLE;

    for (let i_list = 0, i_table = 0; i_list < size; i_list += blockSize, i_table++) {
        indexTable[i_table] = list.objects[i_list].value;
    }

    return indexTable;
}

function search_thread(binarySearchSimulation, indexSearchSimulation, ctx) {
    // utilizando setInterval para fazer uma busca assistida
    // busca binaria
    let inf = 0;
    let sup = binarySearchSimulation.objects.length - 1;
    let middle;

    const indexTable = generateIndexTable(indexSearchSimulation);
    let indexFinded = 0;

    // temporario
    // busca o maior indice proximo ao valor buscado
    for (let i = 0; i < indexTable.length; i++) {
        if (Math.abs(indexSearchSimulation.number_searched - indexTable[i]) < INDEX_BLOCK_SIZE) {
            indexFinded = indexTable[i];
            break;
        }
    }

    setInterval(() => {
        // busca binaria
        if (inf <= sup) {
            [inf, sup, middle] = binarySearchSimulation.updateBinarySearch(FIXED_DT, inf, sup, middle);
        }

        // busca sequencial indexada
        if (indexFinded != true){
            indexFinded = indexSearchSimulation.updateSequenceSearch(FIXED_DT, indexFinded);
        }

        updateCanvas(canvas);
        binarySearchSimulation.render(ctx);
        indexSearchSimulation.render(ctx);
    }, FIXED_DT * 1000);
}

window.onload = start;