import * as fs from 'fs';
import { Cache } from './model/Cache';
import { CacheCard } from './model/CacheCard';

export class LocalCache {
  constructor(private filepath: string) {}

  private collection: Cache | undefined;

  private async load(): Promise<Cache> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filepath, 'utf8', (err, content) => {
        if (err) {
          if (err.errno === -2) {
            resolve({
              cards: [],
            });
          } else {
            reject(err);
          }
        } else {
          try {
            resolve(JSON.parse(content));
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  }

  public async search(set: string, collectorNumber: string): Promise<CacheCard | undefined> {
    if (!this.collection) {
      this.collection = await this.load();
    }

    return this.collection?.cards
      .find((card) => card.set === set && card.collectorNumber === collectorNumber);
  }

  public async cache(
    name: string,
    multiverseId: number,
    set: string,
    collectorNumber: string,
    mtgStocksId: number,
  ) {
    if (!this.collection) {
      this.collection = await this.load();
    }

    const card: CacheCard = {
      name,
      multiverseId,
      set,
      collectorNumber,
      mtgStocksId,
    };

    this.collection?.cards.push(card);
  }

  public async save(): Promise<void> {
    if (!this.collection) return;
    const data: string = JSON.stringify(this.collection, null, 2);
    await fs.writeFile(this.filepath, data, 'utf8', () => {});
  }
}
