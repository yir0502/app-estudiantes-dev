const fs = require('fs');
const pdf = require('pdf-parse');

const run = async () => {
    try {
        const file = fs.readdirSync(__dirname).find(f => f.endsWith('.pdf'));
        if (!file) {
            fs.writeFileSync('pdf_output.txt', 'No PDF found');
            return;
        }
        const dataBuffer = fs.readFileSync(file);
        const parsed = await pdf(dataBuffer);
        fs.writeFileSync('pdf_output.txt', parsed.text);
        console.log("SUCCESS");
    } catch (e) {
        fs.writeFileSync('pdf_output.txt', "ERROR: " + e.message + "\n" + e.stack);
        console.error(e);
    }
}
run();
