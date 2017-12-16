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

displays.forEach(function(d){
  var _id = new mongoose.Types.ObjectId();
  var display = new Display({
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
  display.save().then(result => {
      console.log(_id + ' -- Display añadido...');
    })
    .catch(err => {
      console.log(err);
    });
  }
);

images.forEach(function(i){
  var _id = new mongoose.Types.ObjectId();
  var image = new Image({
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
  image.save().then(result => {
      console.log(_id + ' -- Imagen añadida...');
    })
    .catch(err => {
      console.log(err);
    });
  }
);

groups.forEach(function(g){
  var _id = new mongoose.Types.ObjectId();
  var group = new Group({
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
  group.save()
    .then(result => console.log(_id + ' -- Grupo añadido...'))
    .catch(err => console.log(err));
  }
);

users.forEach(function(u){
  var _id = new mongoose.Types.ObjectId();
  var user = new User({
    _id: _id,
    url: 'http://localhost:4000/users/' + _id,
    name: u.name,
    login: u.login,
    password: u.password,
    admin: u.admin,
  });
  user.save()
    .then(result => console.log(_id + ' -- Usuario añadido...'))
    .catch(err => console.log(err));
  }
);
