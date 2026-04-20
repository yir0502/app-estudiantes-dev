const fs = require('fs');
const PDFParser = require("pdf2json");

const file = fs.readdirSync(__dirname).find(f => f.endsWith('.pdf'));
if (!file) {
    fs.writeFileSync("pdf_output.txt", "No PDF found");
    process.exit(1);
}

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => {
    fs.writeFileSync("pdf_output.txt", "ERROR: " + errData.parserError);
});
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("pdf_output.txt", pdfParser.getRawTextContent());
    console.log("SUCCESS");
});

pdfParser.loadPDF(file);
