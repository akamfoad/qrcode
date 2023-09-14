export default class ImageLoader {
  static load(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(img);
      img.src = url;
    });
  }
}
