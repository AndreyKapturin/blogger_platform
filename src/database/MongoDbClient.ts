import { Db, MongoClient, ServerApiVersion, Document } from "mongodb";
import { MONGO_DB_NAME } from "../core/config";
import { log } from "../core/utils/logger/loggerUtils";

class MongoDbClient {
  private client: MongoClient | null = null;
  private dbInstance: Db | null = null;

  async connectToDB(connectionUri: string) {
    try {
      this.client = new MongoClient(connectionUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await this.client.connect();
      this.dbInstance = this.client.db(MONGO_DB_NAME);
      await this.dbInstance.command({ ping: 1 });
      log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      await this.client!.close();
      throw new Error(`Database connection error: ${error}`);
    }
  }

  getCollection<T extends Document>(collectionName: string) {
    if (!this.client || !this.dbInstance) throw new Error('Database is not connect');
    return this.dbInstance.collection<T>(collectionName);
  }

  async closeDBConnection() {
    if (!this.client) return;
    await this.client.close();
  }
}

const mongoClient = new MongoDbClient;

export { mongoClient, MongoDbClient }