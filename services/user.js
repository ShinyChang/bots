const database = require('./database')

let store = {}
database.ref('/users').on('value', (snapshot) => {
  store = snapshot.val()
})

class User {
  static add(userId) {
    database.ref(`/users/${userId}`).set({
      isAdmin: false
    })
  }

  static remove(userId) {
    database.ref(`/users/${userId}`).remove()
  }

  static assignAsAdmin(userId) {
    database.ref(`/users/${userId}`).update({
      isAdmin: true
    })
  }

  static unassignAsAdmin(userId) {
    database.ref(`/users/${userId}`).update({
      isAdmin: false
    })
  }

  static addServiceId(userId, serviceType, serviceId) {
    database.ref(`/users/${userId}`).update({
      [serviceType]: serviceId
    })
  }

  static removeServiceId(userId, serviceType) {
    database.ref(`/users/${userId}/${serviceType}`).remove()
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

  static getServiceId(userId, serviceType) {
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
