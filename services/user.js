const Database = require('./database')

let store = {}
Database.ref('/users').on('value', (snapshot) => {
  store = snapshot.val()
})

class User {
  static add(userId) {
    Database.ref(`/users/${userId}`).set({
      isAdmin: false
    })
  }

  static remove(userId) {
    Database.ref(`/users/${userId}`).remove()
  }

  static assignAsAdmin(userId) {
    Database.ref(`/users/${userId}`).update({
      isAdmin: true
    })
  }

  static unassignAsAdmin(userId) {
    Database.ref(`/users/${userId}`).update({
      isAdmin: false
    })
  }

  static addServiceId(userId, serviceType, serviceId) {
    Database.ref(`/users/${userId}`).update({
      [serviceType]: serviceId
    })
  }

  static removeServiceId(serviceType, userId) {
    Database.ref(`/users/${userId}/${serviceType}`).remove()
  }

  static getUserIdByServiceId(serviceType, serviceId) {
    const map = Object.keys(store).reduce((obj, key) => {
      if (store[key][serviceType]) {
        obj[store[key][serviceType]] = key
      }
      return obj
    }, {})
    return map[serviceId]
  }

  static getServiceId(serviceType, userId) {
    return store[userId][serviceType]
  }

  static isAdmin(userId) {
    return store[userId].isAdmin
  }

  static get(userId) {
    return store[userId]
  }
}

module.exports = User
