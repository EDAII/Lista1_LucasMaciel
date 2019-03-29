const TRACE_LENGTH_SKIP_STEPS = 8;
const FIXED_DT = 0.5;
const DISTANCE_TEXT_SCREEN = window.innerWidth / 20;
const DISTANCE_BETWEEN_SIMULATIONS = window.innerWidth / 4;
const SEARCH_TEXT_SIZE = DISTANCE_BETWEEN_SIMULATIONS * 0.05;
const RATIO_INDEX_TABLE = 10;


function start() {
    const canvas = initCanvas();
    const ctx = canvas.getContext('2d');

    const objectsNumber = 100;
    let objectsRanger = 200;
    let number_searched = 0;
    
    do {
        number_searched = prompt(`Qual numero você deseja buscar(0-${objectsRanger})?`);
    } while (number_searched > objectsRanger && number_searched < 0);

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

    for (let i = 0; i < objectsNumber; i++) {
        let num;
        do {
            num = rand(0, objectsRanger);
        } while (numbers.indexOf(num) >= 0);
        numbers[i] = num;
    }
    numbers.sort(function (num1, num2) {
        if (num1 == num2) return 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    });

    // criar simulation para busca binaria
    for (let i = 0; i < objectsNumber; i++) {
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
    const binarySearchSimulation = new SimulationBinary(binarySearchObjects, number_searched, "Busca Binaria", offsetX - radius, offsetY - 50);

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


    for (let i = 0; i < objectsNumber; i++) {
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

    const indexSearchSimulation = new SimulationSequenceIndex(
        indexSearchObjects, number_searched, "Busca Sequencial Indexada",
        offsetX - radius, offsetY - 50, offsetX, size_obj);

    // gerar tabela de indices com o tipo Object
    indexSearchSimulation.generateIndexTable();
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

class SimulationBinary {
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

    renderNotFound(ctx) {
        ctx.beginPath();
        ctx.font = `${SEARCH_TEXT_SIZE}pt Arial`;
        ctx.fillStyle = 'red';
        ctx.fillText("Número não Encontrado", this.posMsgX + 130, this.posMsgY + 20);
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
}

class SimulationSequenceIndex {
    constructor(objects, number_searched, message = "", posMsgX, posMsgY) {
        this.objects = objects || [];
        this.objects.forEach(object => object.simulation = this);
        this.number_searched = number_searched;
        this.message = message;
        this.posMsgX = posMsgX;
        this.posMsgY = posMsgY;
        this.step_count = 0;
        this.numberNotFound = false;
        this.indexTable = [];
    }

    // metodo de busca sequencial
    updateSequenceSearch(index) {
        this.step_count++;
        if (this.objects[index].value > this.number_searched) {
            return false;
        }
        if (this.number_searched == this.objects[index].value) {
            this.objects[index].setColor(`rgba(0, 128, 0, 0.8)`);
            return true;
        }
        this.objects[index].setColor(`rgba(0, 50, 180, 0.8)`);
        return index + 1
    }

    updateIndexSearch(kindex) {
        this.step_count++;
        this.objects[kindex].setColor(`rgba(0, 50, 180, 0.8)`);
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

    generateIndexTable() {
        const size = this.objects.length;
        // dividir lista em n pedacos
        const blockSize = size / RATIO_INDEX_TABLE;
        let posY = 0;

        for (let kindex = 0; kindex < size; kindex += blockSize) {
            this.indexTable.push(kindex);
            this.objects[kindex].setColor("gray");

            posY++;
        }

        return true;
    }

    getIndextable() {
        return this.indexTable;
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



function search_thread(textScreen, binarySearchSimulation, indexSearchSimulation, ctx) {
    // utilizando setInterval para fazer uma busca assistida
    // busca binaria
    let inf = 0;
    let sup = binarySearchSimulation.objects.length - 1;
    let middle;

    const indexTable = indexSearchSimulation.getIndextable();

    for (let i = 0; i < indexTable.length; i++) {
        console.log(indexSearchSimulation.objects[indexTable[i]].value);
    }

    let situationBinarySearch = [];
    let kindexFinded = false;
    let kindex = 0; // indice da busca na tabela de indices
    let index = 0; // indice da busca sequencial
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
        if (kindexFinded === false) {
            // busca o maior indice proximo ao valor buscado
            if (indexSearchSimulation.objects[indexTable[kindex]].value < indexSearchSimulation.number_searched &&
                indexSearchSimulation.objects[indexTable[kindex + 1]].value > indexSearchSimulation.number_searched) {
                index = indexTable[kindex] + 1;
                kindexFinded = true;
            }
            indexSearchSimulation.updateIndexSearch(indexTable[kindex]);
        } else if (kindexFinded === true && index !== false && index !== true) {
            index = indexSearchSimulation.updateSequenceSearch(index);
            if (index === false) {
                indexSearchSimulation.changeNumbernotFound();
            }
        }
        kindex++;

        textScreen.render(ctx);
        binarySearchSimulation.render(ctx);
        indexSearchSimulation.render(ctx);
    }, FIXED_DT * 1000);
}

window.onload = start;