import mongoose from 'mongoose';

export function connectToServer() {
  return mongoose.connect(
    'mongodb://localhost:27017/stock-fundamentals',
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
