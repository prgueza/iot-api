const { displays, groups, images, users, resolutions, locations } = require('./datos');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Display = require('./models/display');
const Image = require('./models/image');
const Group = require('./models/group');
const User = require('./models/user');
const Resolution = require('./models/resolution');
const Location = require('./models/location');


mongoose.connect(
  'mongodb://administrador:' +
    '7MZ5oRy4e0YWG4v0' +
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
    location: '5a3c0b332900cb640a07da27',
    created_by: d.created_by,
    resolution: '5a3c327887309b662f490c13',
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
    created_by: i.created_by,
    file: i.file,
    size: i.size,
    src_url: i.src_url,
    color_profile: i.color_profile,
    resolution: '5a3c327887309b662f490c13',
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
    created_by: g.created_by,
    updated_by: g.updated_by,
    active_image: null,
    images: [],
    displays: [],
    tags_total: g.tags.length,
    tags: g.tags,
  });
});

const ResolutionsData = resolutions.map((r) => {
  var _id = new mongoose.Types.ObjectId();
  return resolution = new Resolution({
    _id: _id,
    url: 'http://localhost:4000/resolutions/' + _id,
    id: r.id,
    name: r.name,
    size: {
      width: r.size.width,
      height: r.size.height
    }
  });
});

const LocationsData = locations.map((l) => {
  var _id = new mongoose.Types.ObjectId();
  return location = new Location({
    _id: _id,
    url: 'http://localhost:4000/locations/' + _id,
    id: l.id,
    name: l.name,
    description: l.description,
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
    email: u.email,
    admin: u.admin
  });
});

Promise.all([
      Display.remove({}).exec(),
      Image.remove({}).exec(),
      Group.remove({}).exec(),
      //User.remove({}).exec(),
      //Resolution.remove({}).exec()
    ])
  .then(() => console.log('Datos eliminados...'))
  .then(() => Promise.all([ displaysData.map((d) => {d.save()}) ]))
  .then(() => console.log('Displays añadidos...'))
  .then(() => Promise.all([ ImagesData.map((i) => {i.save()}) ]))
  .then(() => console.log('Imagenes añadidas...'))
  .then(() => Promise.all([ GroupsData.map((g) => {g.save()}) ]))
  .then(() => console.log('Grupos añadidos...'))
  //.then(() => Promise.all([ UsersData.map((u) => {u.save()}) ]))
  //.then(() => console.log('Usuarios añadidos...'))
  //.then(() => Promise.all([ ResolutionsData.map((r) => {r.save()}) ]))
  //.then(() => console.log('Resoluciones añadidas...'))
  //.then(() => Promise.all([ LocationsData.map((l) => {l.save()}) ]))
  //.then(() => console.log('Localizaciones añadidas...'));
