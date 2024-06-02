document.addEventListener('DOMContentLoaded', () => {
  const bpmInput = document.getElementById('bpm');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const connectBtn = document.getElementById('connectBtn');
  let timer;
  let device;
  let server;
  let service;
  let characteristic;

  // UUIDs personalizados para el servicio y las características
  const SERVICE_UUID = '70881da3-fae1-4536-bd79-5b4a65d6984d'; // Reemplaza con tu UUID de servicio personalizado
  const CHARACTERISTIC_UUID = 'f8fb6e7b-114b-40d1-8390-c82e37d7d766'; // Reemplaza con tu UUID de característica personalizada

  // Tone.js setup
  const synth = new Tone.MembraneSynth().toDestination();

  startBtn.addEventListener('click', () => {
    const bpm = bpmInput.value;
    startMetronome(bpm);
    sendBluetoothMessage({ action: 'start', bpm: bpm });
  });

  stopBtn.addEventListener('click', () => {
    stopMetronome();
    sendBluetoothMessage({ action: 'stop' });
  });

  connectBtn.addEventListener('click', connectToDevice);

  function startMetronome(bpm) {
    if (timer) clearInterval(timer);
    const interval = 60000 / bpm;
    timer = setInterval(() => {
      console.log('Tick');
      synth.triggerAttackRelease("C2", "8n");
    }, interval);
  }

  function stopMetronome() {
    if (timer) clearInterval(timer);
  }

  async function connectToDevice() {
    try {
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID]
      });
      server = await device.gatt.connect();
      service = await server.getPrimaryService(SERVICE_UUID);
      characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      device.addEventListener('gattserverdisconnected', onDisconnected);
      console.log('Connected to device');
    } catch (error) {
      console.log('Error connecting to device', error);
    }
  }

  async function sendBluetoothMessage(message) {
    if (!characteristic) {
      console.log('No Bluetooth characteristic available');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(message));

    try {
      await characteristic.writeValue(data);
      console.log('Message sent:', message);
    } catch (error) {
      console.log('Error sending message', error);
    }
  }

  function onDisconnected() {
    console.log('Device disconnected');
    connectToDevice();
  }
});
