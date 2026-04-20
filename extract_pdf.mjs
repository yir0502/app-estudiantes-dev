import fs from 'fs';
import pdf from 'pdf-parse';

async function extract() {
    try {
        const dataBuffer = fs.readFileSync('Aplicación.pdf');
        const data = await pdf(dataBuffer);
        fs.writeFileSync('extracted_content.txt', data.text);
        console.log('SUCCESS: Content extracted to extracted_content.txt');
    } catch (error) {
        console.error('ERROR:', error);
    }
}

extract();
