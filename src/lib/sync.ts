import sequelize from "./sequelize";

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Unable to synchronize the database:", error);
  }
};

export default syncDatabase;
