export class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private readonly assetList = [
    { key: 'spritesheet', src: '/sheets/combined-sprite.png' },
  ];

  public async loadAll(): Promise<void> {
    const promises = this.assetList.map(asset => this.loadImage(asset.key, asset.src));
    await Promise.all(promises);
  }

  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
} 