const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Display = require('./models/display');
const Image = require('./models/image');
const Group = require('./models/group');
const User = require('./models/user');


mongoose.connect(
  'mongodb://administrador:' +
    'boardinghouse' +
    '@iot-api-shard-00-00-yznka.mongodb.net:27017,iot-api-shard-00-01-yznka.mongodb.net:27017,iot-api-shard-00-02-yznka.mongodb.net:27017/test?ssl=true&replicaSet=iot-api-shard-0&authSource=admin',
  {
    useMongoClient: true
  }
);

Display.remove({}).exec().then(() => console.log('Displays eliminados...'));
Image.remove({}).exec().then(() => console.log('Imagenes eliminadas...'));
Group.remove({}).exec().then(() => console.log('Grupos eliminados...'));
User.remove({}).exec().then(() => console.log('Usuarios eliminados...'));
