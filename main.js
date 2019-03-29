const TRACE_LENGTH_PARTS = 10;
const TRACE_LENGTH_SKIP_STEPS = 8;
const OBJECTS_NUMBER = 100;
const OBJECT_VALUE_RANGE = 200;
const FIXED_DT = 0.5;
const DISTANCE_TEXT_SCREEN = window.innerWidth / 20;
const DISTANCE_BETWEEN_SIMULATIONS = window.innerWidth / 4;
const SEARCH_TEXT_SIZE = DISTANCE_BETWEEN_SIMULATIONS * 0.05;
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

    const number_searched = prompt(`Qual numero você deseja buscar(0-${OBJECT_VALUE_RANGE})?`);

    for (let i = 0; i < OBJECTS_NUMBER; i++) {
        let num;
        do {
            num = rand(0, OBJECT_VALUE_RANGE);
        } while (numbers.indexOf(num) >= 0);
        numbers[i] = num;
    }
    numbers.sort(function (num1, num2) {
        if (num1 == num2) return 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    });

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
    const binarySearchSimulation = new Simulation(binarySearchObjects, number_searched, "Busca Binaria", offsetX - radius, offsetY - 50);

    offsetX = radius + size_rect + DISTANCE_TEXT_SCREEN; // distancia da borda
    offsetY = radius + 40;
    pos_x = 0;
    pos_y = 0;

    const textScreen = new TextScreen("Número Procurado", number_searched, offsetX, offsetY);

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


    const indexSearchSimulation = new Simulation(indexSearchObjects, number_searched, "Busca Sequencial Indexada", offsetX - radius, offsetY - 50);

    search_thread(textScreen, binarySearchSimulation, indexSearchSimulation, ctx);
}

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `[${this.x.toFixed(2)}, ${this.y.toFixed(2)}]`
    }
}

class TextScreen {
    constructor(message, number_searched, posX, posY) {
        this.message = message;
        this.number_searched = number_searched;
        this.posX = posX;
        this.posY = posY;
    }

    render(ctx) {
        ctx.beginPath();
        var message = this.message;
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText(message, this.posX, this.posY);


        var number = this.number_searched;
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`;
        ctx.fillStyle = 'green';
        ctx.fillText(number, this.posX, this.posY + 20);
    }
}

class Simulation {
    constructor(objects, number_searched, message = "", posMsgX, posMsgY) {
        this.objects = objects || [];
        this.objects.forEach(object => object.simulation = this);
        this.number_searched = number_searched;
        this.message = message;
        this.posMsgX = posMsgX;
        this.posMsgY = posMsgY;
        this.step_count = 0;
        this.numberNotFound = false;
    }

    // metodo de busca binaria
    updateBinarySearch(inf, sup, middle) {
        this.step_count++;
        middle = Math.floor((inf + sup) / 2);
        if (this.number_searched == this.objects[middle].value) {
            this.objects[middle].setColor(`rgba(0, 128, 0, 0.8)`);
            return true;
        }
        if (this.number_searched < this.objects[middle].value) sup = middle - 1;
        else inf = middle + 1;

        this.objects[middle].setColor(`rgba(0, 50, 180, 0.8)`);
        return [inf, sup, middle]
    }

    // metodo de busca sequencial
    updateSequenceSearch(kindex) {
        this.step_count++;
        if (this.objects[kindex].value > this.number_searched) {
            return false;
        }
        if (this.number_searched == this.objects[kindex].value) {
            this.objects[kindex].setColor(`rgba(0, 128, 0, 0.8)`);
            return true;
        }
        this.objects[kindex].setColor(`rgba(0, 50, 180, 0.8)`);
        return kindex + 1
    }

    renderNotFound(ctx) {
        ctx.beginPath();
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`;
        ctx.fillStyle = 'red';
        ctx.fillText("Número não Encontrado", this.posMsgX + 110, this.posMsgY + 20);
    }

    changeNumbernotFound() {
        this.numberNotFound = true;
    }

    render(ctx) {
        if (this.numberNotFound === true) {
            this.renderNotFound(ctx);
        }
        ctx.beginPath();
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`; //Define Tamanho e fonte
        ctx.fillStyle = 'white'; //Define a cor
        ctx.fillText(this.message, this.posMsgX, this.posMsgY); //Desenha a mensagem

        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`; //Define Tamanho e fonte
        ctx.fillStyle = 'green'; //Define a cor
        ctx.fillText("Passos: " + this.step_count, this.posMsgX, this.posMsgY + 20); //Desenha a mensagem

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
        this.color = `rgba(255, 255, 255, 0.8)`;
    }

    update() {
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
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function generateIndexTable(list) {
    const size = list.objects.length;
    let indexTable = [];
    // dividir lista em n pedacos
    const blockSize = size / RATIO_INDEX_TABLE;

    for (let index = 0, kindex = 0; index < size; index += blockSize, kindex++) {
        indexTable[kindex] = index;
    }

    return indexTable;
}

function search_thread(textScreen, binarySearchSimulation, indexSearchSimulation, ctx) {
    // utilizando setInterval para fazer uma busca assistida
    // busca binaria
    let inf = 0;
    let sup = binarySearchSimulation.objects.length - 1;
    let middle;

    const indexTable = generateIndexTable(indexSearchSimulation);
    let indexFinded = 0;
    for (let i = 0; i < indexTable.length; i++){
        console.log(indexSearchSimulation.objects[indexTable[i]].value);
    }

    // temporario
    // busca o maior indice proximo ao valor buscado
    for (let i = 0; i < indexTable.length; i++) {
        if (indexSearchSimulation.objects[indexTable[i]].value < indexSearchSimulation.number_searched &&
            indexSearchSimulation.objects[indexTable[i + 1]].value > indexSearchSimulation.number_searched) {
            indexFinded = indexTable[i];
            break;
        }
    }

    let situationBinarySearch = [];
    setInterval(() => {
        updateCanvas(canvas);
        // busca binaria
        if (inf <= sup && situationBinarySearch !== true) {
            situationBinarySearch = binarySearchSimulation.updateBinarySearch(inf, sup, middle);
            if (situationBinarySearch !== true) [inf, sup, middle] = situationBinarySearch;
            if (inf > sup) {
                binarySearchSimulation.changeNumbernotFound();
            }
        }

        // busca sequencial indexada
        if (indexFinded !== true && indexFinded !== false) {
            indexFinded = indexSearchSimulation.updateSequenceSearch(indexFinded);
            if (indexFinded === false) {

                indexSearchSimulation.changeNumbernotFound();
            }
        }

        textScreen.render(ctx);
        binarySearchSimulation.render(ctx);
        indexSearchSimulation.render(ctx);
    }, FIXED_DT * 1000);
}

window.onload = start;