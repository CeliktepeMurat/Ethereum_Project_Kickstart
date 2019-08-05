const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');

const source = fs.readFileSync(campaignPath, 'utf8');

const output = solc.compile(source, 1).contracts;

// bu kod satırı buildPath yoluna bakıyor ve build klasörü var mı diye kontrol ediyor
// eğer build klasörü yoksa bizim için oluşturuyor.
fs.ensureDirSync(buildPath);

for (let contract in output) {
    // Spesifik bir klasöre json dosyası yazmamıza yarar
    fs.outputJSONSync(
        // öncelikle yazacağımız yeri ve ismi belirliyoruz ondan sonra output[] ile neyi yazacağımızı belirliyoruz.
        path.resolve(buildPath, contract.replace(':', '') + '.json'), output[contract]
    );
}



