import mongoose from "mongoose";

//* Function for connect db
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  mongoose.set("strictQuery", true);

  mongoose.connection.on("error", (err) =>
    console.error("MongoDB connection error:", err),
  );
  await mongoose.connect(uri);
  console.log("\nMongoDB connection established.");
};

//* Function for disconnect db
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("\nMongoDB connection terminated.");
};
