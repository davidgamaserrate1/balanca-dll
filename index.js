const path = require('path');
const koffi = require('koffi');
const os = require('os');

const isWindows = os.platform() === 'win32';
const baseDir = path.join(__dirname, 'dll', isWindows ? 'win' : 'linux');
const dllPath = path.join(baseDir, isWindows ? 'ACBrBAL64.dll' : 'libacbrbal64.so');
const iniPath = path.join(baseDir, 'ACBrLib.ini');
const eArqConfig = iniPath;

const TAMANHO_BUFFER = 1024;
const fs = require('fs');

console.log('eArqConfig#', eArqConfig);
console.log('Arquivo existe?', fs.existsSync(eArqConfig));


let eChaveCrypt = '';

if (isWindows) {
  process.env.PATH += ';' + baseDir;
}

const balLib = koffi.load(dllPath);

const lib = {
  BAL_Inicializar: balLib.func("BAL_Inicializar", 'int', ['string', 'string']),
  BAL_Finalizar: balLib.func("BAL_Finalizar", 'int', []),
  BAL_UltimoRetorno: balLib.func("BAL_UltimoRetorno", 'int', ['char*', 'int*']),
  BAL_Nome: balLib.func('BAL_Nome', 'int', ['char*', 'int*']),
  BAL_Versao: balLib.func("BAL_Versao", 'int', ['char*', 'int*']),

  BAL_ConfigLer: balLib.func("BAL_ConfigLer", 'int', ['string']),
  BAL_ConfigGravar: balLib.func("BAL_ConfigGravar", 'int', ['string']),
  BAL_ConfigLerValor: balLib.func("BAL_ConfigLerValor", 'int', ['string', 'string', 'char*', 'int*']),
  BAL_ConfigGravarValor: balLib.func("BAL_ConfigGravarValor", 'int', ['string']),
  
  BAL_Ativar: balLib.func("BAL_Ativar", 'int', []),
  BAL_Desativar: balLib.func("BAL_Desativar", 'int', []),
  BAL_SolicitarPeso: balLib.func("BAL_SolicitarPeso", 'int', []),
  BAL_LePeso: balLib.func("BAL_LePeso", 'int', ['char*', 'int']),
};

function getNome(bufferSize = TAMANHO_BUFFER) {
  const buffer = Buffer.alloc(bufferSize);
  const tamanhoPtr = koffi.alloc('int', 1);
  tamanhoPtr.writeInt32LE(bufferSize, 0);

  const res = lib.BAL_Nome(buffer, tamanhoPtr);

  if (res !== 0) {
    console.error("Erro ao chamar BAL_Nome. Código:", res);
    return null;
  }

  const tamanhoReal = tamanhoPtr.deref();

  return buffer.toString('utf8', 0, tamanhoReal).replace(/\0/g, '').trim();
}

function getVersao(bufferSize = TAMANHO_BUFFER) {
  const buffer = Buffer.alloc(bufferSize);
  const tamanhoPtr = koffi.alloc('int', 1);
  tamanhoPtr.writeInt32LE(bufferSize, 0);

  const res = lib.BAL_Versao(buffer, tamanhoPtr);

  if (res !== 0) {
    console.error("Erro ao chamar BAL_Versao. Código:", res);
    return null;
  }

  const tamanhoReal = tamanhoPtr.deref();

  return buffer.toString('utf8', 0, tamanhoReal).replace(/\0/g, '').trim();
}

function lerValor(sessao, chave, bufferSize = TAMANHO_BUFFER) {
  const buffer = Buffer.alloc(bufferSize);
  const tamanhoPtr = koffi.alloc('int', 1);
  tamanhoPtr.writeInt32LE(bufferSize, 0);

  const res = lib.BAL_ConfigLerValor(sessao, chave, buffer, tamanhoPtr);

  if (res !== 0) {
    console.error(`Erro ao ler valor. Código: ${res}`);
    return null;
  }

  const tamanhoReal = tamanhoPtr.deref();

  return buffer.toString('utf8', 0, tamanhoReal).replace(/\0/g, '').trim();
}

function ultimoRetorno(bufferSize = TAMANHO_BUFFER) {
  const buffer = Buffer.alloc(bufferSize);
  const tamanhoPtr = koffi.alloc('int', 1);
  tamanhoPtr.writeInt32LE(bufferSize, 0);

  const res = lib.BAL_UltimoRetorno(buffer, tamanhoPtr);

  if (res !== 0) {
    console.error(`Erro ao obter último retorno. Código: ${res}`);
    return null;
  }

  const tamanhoReal = tamanhoPtr.deref();

  return buffer.toString('utf8', 0, tamanhoReal).replace(/\0/g, '').trim();
}

function iniciarLeitura() {
  try {
    let res;
    
    res = lib.BAL_ConfigGravar(eArqConfig);
    if (res !== 0) throw new Error(`Erro em BAL_ConfigGravar: ${res}`);

    res = lib.BAL_Inicializar(eArqConfig, eChaveCrypt);
    if (res !== 0) throw new Error(`Erro em BAL_Inicializar: ${res}`);

    res = lib.BAL_ConfigLer(eArqConfig);
    if (res !== 0) throw new Error(`Erro em BAL_ConfigLer: ${res}`);

    res = lib.BAL_Ativar();
    if (res !== 0) throw new Error(`Erro em BAL_Ativar: ${res}`);

    console.log('Iniciar: 0');
    console.log('Ler: 0');
    console.log('Ativar: 0');
    console.log('Nome:', getNome());
    console.log('Versão:', getVersao());
    console.log('Modelo:', lerValor('BAL', 'Modelo'));
    console.log('Porta:', lerValor('BAL', 'Porta'));
    console.log('Último retorno:', ultimoRetorno());

    setInterval(() => {
      const buffer = Buffer.alloc(256);
      const resPeso = lib.BAL_LePeso(buffer, 500);
      if (resPeso === 0) {
        console.log('Peso lido:', buffer.toString('utf8').replace(/\0/g, '').trim());
      } else {
        console.error('Erro ao ler peso:', ultimoRetorno());
      }
    }, 1000);

  } catch (error) {
    console.error('Erro durante inicialização:', error);
  }
}

iniciarLeitura();
