import Zernio from '@zernio/node';

const zernio = new Zernio(); // uses ZERNIO_API_KEY env variable

const { profile } = await zernio.profiles.createProfile({
  name: 'My First Profile',
  description: 'Testing the Zernio API'
});
