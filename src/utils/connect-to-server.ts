import mongoose from 'mongoose';

export function connectToServer() {
  return mongoose.connect(
    process.env.MONGODB_URI!,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    () => {
      console.log('Connected to MongoDB at ' + process.env.MONGODB_URI);
    },
  );
}

export function disconnectFromServer() {
  return mongoose.connection.close();
}
