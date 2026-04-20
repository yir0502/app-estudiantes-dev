const fs = require('fs');
const pdf = require('pdf-parse');
const dir = 'c:/Users/dani6/Desktop/apps_negocios/app-estudiantes-dev/';
const files = fs.readdirSync(dir);
const pdfFile = files.find(f => f.endsWith('.pdf'));
if (pdfFile) {
    let dataBuffer = fs.readFileSync(dir + pdfFile);
    pdf(dataBuffer).then(function(data) {
        fs.writeFileSync(dir + 'pdf_output.txt', data.text);
        console.log("SUCCESS");
    }).catch(err => {
        fs.writeFileSync(dir + 'pdf_output.txt', err.toString());
    });
} else {
    fs.writeFileSync(dir + 'pdf_output.txt', "No PDF found!");
}
