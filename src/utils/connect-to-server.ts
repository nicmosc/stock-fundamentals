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
      console.log('connected af');
    },
  );
}

export function disconnectFromServer() {
  return mongoose.connection.close();
}
