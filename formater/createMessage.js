const createMessage = (to, object) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Create",
    "generator": {
      "id": process.env.BROID_SERVICE_ID,
      "type": "Service",
      "name": "slack"
    },
    object,
    to
  }
}
module.exports = createMessage
