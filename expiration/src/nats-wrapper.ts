import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client)
      throw new Error("you have to connect to NATS before using it");

    return this._client;
  }

  connect(clusterId: string, clineId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clineId, { url });
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("connected to NATS...");
        resolve();
      });

      this.client.on("error", (err) => reject(err));
    });
  }
}

let natsWrapper = new NatsWrapper();

export { natsWrapper };
