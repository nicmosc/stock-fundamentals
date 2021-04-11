import mongoose from 'mongoose';

export async function connectToServer() {
  try {
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
  } catch (err) {
    console.error('Could not connect to server');
    console.error(err);
  }
}

export function disconnectFromServer() {
  try {
    return mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}
