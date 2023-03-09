import mongoose from "mongoose";
import user from "./user";

class Database {
  mongoose: typeof mongoose;
  user: typeof user;
  private _uri: string;
  constructor(config: { host: string; user: string; password: string; database: string }) {
    this._uri = `mongodb://${config.user}:${encodeURIComponent(config.password)}@${config.host}/${config.database}`;

    this.mongoose = mongoose;

    this.user = user;
  }

  async connect() {
    return this.mongoose.connect(this._uri);
  }

  async getAllIloveYouUsers() {
    return await this.user.find({ love_you: true });
  }

  async getAllMorningUsers() {
    return await this.user.find({ morning: true });
  }

  async getAllNightUsers() {
    return await this.user.find({ night: true });
  }

  async stopLovingYou(id: string) {
    return await this.user.updateOne({ id }, { love_you: false });
  }

  async startLovingYou(id: string) {
    return (
      (await this.user.findOneAndUpdate({ id }, { love_you: true })) || (await this.user.create({ id, love_you: true }))
    );
  }

  async setPetName(id: string, name: string) {
    return await this.user.updateOne({ id }, { pet_name: name });
  }
}

export default Database;
