const { displays, groups, images, users } = require('./datos');
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

const displaysData = displays.map((d) => {
  var _id = new mongoose.Types.ObjectId();
  return display = new Display({
    _id: _id,
    url: 'http://localhost:4000/displays/' + _id,
    id: d.id,
    name: d.name,
    description: d.description,
    location: d.location,
    user: d.user,
    resolution: d.resolution,
    groups: [],
    images: [],
    active_image: undefined,
    tags_total: d.tags.length,
    tags: d.tags,
    mac_address: d.mac,
    gateway: d.gateway
  });
});

const ImagesData = images.map((i) => {
  var _id = new mongoose.Types.ObjectId();
  return image = new Image({
    _id: _id,
    url: 'http://localhost:4000/images/' + _id,
    id: i.id,
    name: i.name,
    description: i.description,
    user: i.user,
    file: i.file,
    size: i.size,
    src_url: i.src_url,
    color_profile: i.color_profile,
    dimensions: i.dimensions,
    category: i.category,
    groups: [],
    displays: [],
    tags_total: i.tags.length,
    tags: i.tags,
  });
});

const GroupsData = groups.map((g) => {
  var _id = new mongoose.Types.ObjectId();
  return group = new Group({
    _id: _id,
    url: 'http://localhost:4000/groups/' + _id,
    id: g.id,
    name: g.name,
    description: g.description,
    user: g.user,
    active_image: undefined,
    images: [],
    displays: [],
    tags_total: g.tags.length,
    tags: g.tags,
  });
});

const UsersData = users.map((u) => {
  var _id = new mongoose.Types.ObjectId();
  return user = new User({
    _id: _id,
    url: 'http://localhost:4000/users/' + _id,
    name: u.name,
    login: u.login,
    password: u.password,
    admin: u.admin,
  });
});

Promise.all([
      Display.remove({}).exec(),
      Image.remove({}).exec(),
      Group.remove({}).exec(),
      User.remove({}).exec()
    ])
  .then(() => console.log('Datos eliminados...'))
  .then(() => Promise.all([ displaysData.map((d) => {d.save()}) ]))
  .then(() => console.log('Displays añadidos...'))
  .then(() => Promise.all([ ImagesData.map((i) => {i.save()}) ]))
  .then(() => console.log('Imagenes añadidas...'))
  .then(() => Promise.all([ GroupsData.map((g) => {g.save()}) ]))
  .then(() => console.log('Grupos añadidos...'))
  .then(() => Promise.all([ UsersData.map((u) => {u.save()}) ]))
  .then(() => console.log('Usuarios añadidos...'));
