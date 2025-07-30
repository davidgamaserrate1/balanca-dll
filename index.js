const path = require('path');
const koffi = require('koffi');
const os = require('os');

const isWindows = os.platform() === 'win32';
const baseDir = path.join(__dirname, 'dll', isWindows ? 'win' : 'linux');
const dllPath = path.join(baseDir, isWindows ? 'ACBrBAL64.dll' : 'libacbrbal64.so');
const iniPath = path.join(baseDir, 'ACBrLib.ini');

const eArqConfig = path.join(__dirname, isWindows ? 'win/ACBrLib.ini' : 'linux/ACBrLib.ini');
let eChaveCrypt = '';

if (isWindows) {
  process.env.PATH += ';' + baseDir;  
}

const balLib = koffi.load(dllPath);


const lib = {
    //metodos lib
    BAL_Inicializar: balLib.func("BAL_Inicializar", 'int', ['string', 'string']),
    BAL_Finalizar: balLib.func("BAL_Finalizar", 'int', []),
    BAL_UltimoRetorno: balLib.func("BAL_UltimoRetorno", 'int', ['string', 'int']),
    BAL_Nome: balLib.func("BAL_Nome", 'int', ['string', 'int']),
    BAL_Versao: balLib.func("BAL_Versao", 'int', ['string', 'int']),

    //metodos config
    BAL_ConfigLer: balLib.func("BAL_ConfigLer", 'int', ['string']),
    BAL_ConfigGravar: balLib.func("BAL_ConfigGravar", 'int', ['string']),
    BAL_ConfigLerValor: balLib.func("BAL_ConfigLerValor", 'int', ['string', 'string', 'string', 'int']),
    BAL_ConfigImportar: balLib.func("BAL_ConfigImportar", 'int', ['string', 'string', 'string']),
    BAL_ConfigGravarValor: balLib.func("BAL_ConfigGravarValor", 'int', ['string']),
    BAL_ConfigExportar: balLib.func("BAL_ConfigExportar", 'int', ['string', 'int']),
    
    //metodos balança
    BAL_Ativar: balLib.func("BAL_Ativar", 'int', []),
    BAL_Desativar: balLib.func("BAL_Desativar", 'int', []),
    BAL_SolicitarPeso: balLib.func("BAL_SolicitarPeso", 'int', []),
    BAL_LePeso: balLib.func("BAL_LePeso", 'int', ['string', 'int']),
    BAL_UltimoPesoLido: balLib.func("BAL_UltimoPesoLido", 'int', ['string']),
    BAL_UltimoPesoLidoStr: balLib.func("BAL_UltimoPesoLidoStr", 'int', ['string']),
    BAL_InterpretarRespostaPeso: balLib.func("BAL_InterpretarRespostaPeso", 'int', ['string', 'string']),
    BAL_InterpretarRespostaPesoStr: balLib.func("BAL_InterpretarRespostaPesoStr", 'int', ['string', 'string']),

};

try {
    const inicio = lib.BAL_Inicializar(eArqConfig, eChaveCrypt);
    const ler = lib.BAL_ConfigLer(eArqConfig, eChaveCrypt);
    const ativar = lib.BAL_Ativar();
    
    console.log('inicio', inicio)
    console.log('ativar', ativar)
    console.log('ler', ler)

} catch (error) {
    console.error('An error occurred:', error)
}
 