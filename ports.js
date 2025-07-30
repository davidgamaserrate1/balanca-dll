const { SerialPort } = require('serialport');

const partPorth = 'COM5'

const porta = new SerialPort({
  path: partPorth,
  baudRate: 9600,
});

porta.on('data', (data) => {
  const raw = data.toString('utf8').replace(/\x02|\x03/g, '');

  if (/^\d+$/.test(raw)) {
    const peso = parseFloat(raw) / 1000; 
    console.log('Peso em kg:', peso.toFixed(3).replace('.', ','));
  } else {
    console.log('Formato inesperado:', raw);
  }
});

porta.on('open', () => {
  console.log(`Porta ${partPorth} aberta e escutando...`);
});

porta.on('error', (err) => {
  console.error('Erro na porta serial:', err.message);
});
