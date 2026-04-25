export async function compressImage(file: File, maxSizeKb: number = 50): Promise<{ dataUrl: string, sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;
        let quality = 0.9;
        let dataUrl = '';
        let sizeKb = 0;

        const compress = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeBytes = Math.round((dataUrl.length * 3) / 4);
          sizeKb = sizeBytes / 1024;

          if (sizeKb > maxSizeKb) {
            if (quality > 0.5) {
              quality -= 0.1;
            } else {
              width *= 0.8;
              height *= 0.8;
            }
            
            if (width < 100 || height < 100) {
              resolve({ dataUrl, sizeKb: Math.round(sizeKb) });
              return;
            }
            compress();
          } else {
            resolve({ dataUrl, sizeKb: Math.round(sizeKb) });
          }
        };
        
        compress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
