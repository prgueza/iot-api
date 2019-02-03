const required = '_id url name description createdAt updatedAt userGroup';

const Selections = {
  devices: {
    long: `${required} mac found lastFound batt rssi initcode screen display activeImage userGroup updatedBy`,
    short: `${required} gateway display mac found lastFound batt rssi screen initcode`,
    populate: `${required} initcode activeImage screen`,
  },
  displays: {
    long: `${required} category device tags images activeImage group userGroup imageFromGroup createdBy updating lastUpdateResult timeline`,
    short: `${required} tags device activeImage updating lastUpdateResult timeline`,
    populate: `${required}`,
  },
  gateways: {
    long: `${required} sync ip mac port createdBy`,
    short: `${required} sync ip mac port`,
    populate: `${required} mac location`,
  },
  groups: {
    long: `${required} createdBy updatedBy activeImage overlayImage images displays tags`,
    short: `${required} tags`,
    populate: `${required} activeImage`,
  },
  images: {
    long: `${required} createdBy updatedBy extension path size src color bytes category groups displays tags userGroup`,
    short: `${required} tags src`,
    populate: `${required} src`,
  },
  locations: {
    long: `${required}`,
    short: `${required}`,
    populate: `${required}`,
  },
  screens: {
    long: `${required} screenCode color width height`,
    short: `${required} screenCode color width height`,
    populate: `${required} screenCode color width height`,
  },
  userGroups: {
    long: `${required}`,
    short: `${required} users devices displays images groups`,
    populate: `${required}`,
  },
  users: {
    long: `${required} login email password admin userGroup`,
    short: `${required} login email admin userGroup`,
    populate: `${required}`,
  },
};

module.exports = Selections;
