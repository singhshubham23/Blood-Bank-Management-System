import User from "../models/User";

const generateUniqueId = async (): Promise<string> => {
  let uniqueId: string = "";
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    uniqueId = `BB${randomNum}`;

    const existingUser = await User.findOne({ uniqueId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return uniqueId;
};

export default generateUniqueId;
