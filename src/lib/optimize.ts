import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const INPUT_PATHS = [
  path.join(process.cwd(), 'public', 'longer.png'),
];

async function optimizeImage(inputPath: string): Promise<void> {
  try {
    // Get original image metadata
    // const metadata = await sharp(inputPath).metadata();
    
    // Create an optimized version with the same dimensions
    await sharp(inputPath)
      .png({
        quality: 80,
        compressionLevel: 9,
        palette: true,
        colors: 256 // Reduce color palette for better compression
      })
      .withMetadata() // Preserve metadata
      .toBuffer()
      .then(async (optimizedBuffer) => {
        // Get original file size
        const originalStats = await fs.stat(inputPath);
        const originalSize = originalStats.size;
        
        // Get optimized size
        const optimizedSize = optimizedBuffer.length;
        
        // Save the optimized version only if it's smaller
        if (optimizedSize < originalSize) {
          await fs.writeFile(inputPath, optimizedBuffer);
          console.log(`✅ Optimized ${path.basename(inputPath)}`);
          console.log(`   Original size: ${(originalSize / 1024).toFixed(2)}KB`);
          console.log(`   Optimized size: ${(optimizedSize / 1024).toFixed(2)}KB`);
          console.log(`   Saved: ${((originalSize - optimizedSize) / 1024).toFixed(2)}KB\n`);
        } else {
          console.log(`ℹ️ ${path.basename(inputPath)} is already optimized\n`);
        }
      });
  } catch (error) {
    console.error(`❌ Error optimizing ${path.basename(inputPath)}:`, error);
  }
}

export async function optimizeImages(): Promise<void> {
  console.log('🎨 Starting image optimization...\n');
  
  for (const inputPath of INPUT_PATHS) {
    try {
      // Check if file exists
      await fs.access(inputPath);
      await optimizeImage(inputPath);
    } catch (error) {
      console.error(`❌ File not found: ${path.basename(inputPath)}\n, ${error}`);
    }
  }
  
  console.log('✨ Image optimization complete!');
}

optimizeImages();
