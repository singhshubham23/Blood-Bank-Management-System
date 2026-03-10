const shortid = require("shortid");
const User = require("../models/User");  // <-- required

async function generateUniqueId() {
  let id;
  let exists = true;

  while (exists) {
    id = shortid.generate();
    exists = await User.exists({ uniqueId: id });
  }

  return id;
}

module.exports = generateUniqueId;
