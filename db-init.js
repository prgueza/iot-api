const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserGroup = require('./api/models/userGroup.js');
const User = require('./api/models/user.js');

const init = async function initDatabase () {
  try {
    // Check if database is already populated
    const users = await User.find({ admin: "true" })
    if (users.length > 0) throw new Error("Database is already populated")
    // UserGroupData
    const userGroupData = {
      name: 'Administración General',
      users: [],
      groups: [],
      images: [],
      devices: [],
      displays: [],
      description: 'Grupo de administradores',
    }
    // UserGroupData
    const userData = {
      admin: 'true',
      name: 'admin',
      login: 'admin',
      email: 'admin@test.com',
    }
    // Create userGroup instance
    const userGroup = new UserGroup(userGroupData)
    // Save userGroup
    const { _id: usergroupId } = await userGroup.save()
    // Update userGroup with the corresponding url
    const usergroupUrl = `${process.env.API_URL}usergroups/${usergroupId}`
    await UserGroup.findByIdAndUpdate({ _id: usergroupId }, { $set: { url: usergroupUrl } })
    // Add user password and userGroup
    userData.password = bcrypt.hashSync('1234', 10);
    userData.userGroup = usergroupId
    // Create user instance
    const user = new User(userData)
    // Save user
    const { _id: userId } = await user.save()
    // Update user with the corresponding url
    const userUrl = `${process.env.API_URL}users/${userId}`
    await User.findByIdAndUpdate({ _id: userId }, { $set: { url: userUrl } })
    // Add user to the userGroup and viceversa
    await User.findByIdAndUpdate({ _id: userId }, { $set: { usergroup: usergroupId } })
    await UserGroup.findByIdAndUpdate({ _id: usergroupId }, { $addToSet: { users: userId } })
  } catch (e) {
    console.log(e)
  }
}

module.exports = init
