String.prototype.toTitleCase = function() {
    const words = this.split(' ');
    return words.map(word => {
        if (word.charAt(0).match(/\*/)) return word.replace('*', '')
        else return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ').trim();
};

String.prototype.pluralize = function() {
    if (this.match(/s$/i)) return this + "'"
    else return this.match(/[a-z]/) 
        ? this + "s" 
        : this + "S"
}

String.prototype.camelToTitle = function() {
    let str = this.split('');
    for (let i=(str.length-2); i>=0; i--) {
        if (str[i+1].match(/[A-Z]/)) {
            str.splice(i, 1, [str[i]," "]);
            i--;
        };
    };
    const strWithSpaces = str.flat().join('');
    str = strWithSpaces.split(' ');
    str[0] = str[0].toTitleCase();
    return str.join(' ');
}

String.prototype.normalizeCSV = function() {
    if (this.match(/\,\S/g)) {
        return this.replaceAll(/\,/g, ', ')
    } else return this
}

document.querySelectorAll('*[titlecase]').forEach(el => {
    el.textContent = el.textContent.toTitleCase();
});
document.querySelectorAll('*[pluralize]').forEach(el => {
    el.textContent = el.textContent.pluralize();
});
document.querySelectorAll('*[cameltotitle]').forEach(el => {
    el.textContent = el.textContent.camelToTitle();
});
document.querySelectorAll('*[normalizecsv]').forEach(el => {
    el.textContent = el.textContent.normalizeCSV();
});