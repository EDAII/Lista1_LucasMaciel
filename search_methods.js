function binarySearch(vet = [], key, size) {
    let inf = 0;
    let sup = size - 1;
    let middle;
    while (inf <= sup) {
        middle = (inf + sup) / 2;
        if (key == vet[middle]) return middle;
        if (key < vet[middle]) sup = middle - 1;
        else inf = middle + 1;
    }
}