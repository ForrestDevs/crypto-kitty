import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import cliProgress from "cli-progress";

interface SpriteConfig {
  name: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  rowIndex: number;
  frames: Array<{
    name: string;
    number: number;
  }>;
}

interface SpriteSheetMeta {
  name: string;
  width: number;
  height: number;
  animations: SpriteConfig[];
}

async function optimizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 80 })
    .toBuffer();
}

// Add this helper function to extract and compare frame numbers
function getFrameNumber(filename: string): number {
  const match = filename.match(/_(\d+)\./);
  return match ? parseInt(match[1], 10) : 0;
}

async function createCombinedSpriteSheet(): Promise<void> {
  // Create progress bars
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{bar} | {percentage}% | {value}/{total} | {name}',
  }, cliProgress.Presets.shades_classic);

  const publicDir = path.join(process.cwd(), "public");
  const animationsDir = path.join(process.cwd(), "animations");
  const outputDir = path.join(publicDir, "sheets");

  await fs.mkdir(outputDir, { recursive: true });

  const optimizedFrames: sharp.Sharp[] = [];
  const meta: SpriteSheetMeta = {
    name: "combined",
    width: 0,
    height: 0,
    animations: [],
  };

  // Get all category folders
  const categories = {
    eat: ["eating", "hungry"],
    sleep: ["sleeping", "sleepy", "sleepstart", "sleepwake"],
    clean: ["dirty", "dirty2", "shower"],
  };

  // Calculate total frames for progress bar
  let totalFrames = 0;
  for (const animationFolders of Object.values(categories)) {
    for (const folder of animationFolders) {
      const folderPath = path.join(animationsDir, folder);
      const frames = await fs.readdir(folderPath);
      totalFrames += frames.length;
    }
  }

  const progressBar = multibar.create(totalFrames, 0, { name: 'Processing frames' });
  const optimizeBar = multibar.create(totalFrames, 0, { name: 'Optimizing images' });

  let currentRowIndex = 0;
  let processedFrames = 0;

  // Process all animations from all categories
  for (const [category, animationFolders] of Object.entries(categories)) {
    for (const folder of animationFolders) {
      const folderPath = path.join(animationsDir, folder);
      
      try {
        const unsortedFrames = await fs.readdir(folderPath);
        
        const frames = unsortedFrames.sort((a, b) => {
          const numA = getFrameNumber(a);
          const numB = getFrameNumber(b);
          return numA - numB;
        });

        const frameBuffers: Buffer[] = [];

        // Optimize each frame
        for (const frame of frames) {
          const framePath = path.join(folderPath, frame);
          const optimizedBuffer = await optimizeImage(framePath);
          frameBuffers.push(optimizedBuffer);
          processedFrames++;
          progressBar.update(processedFrames, { name: `Processing ${category}/${folder}` });
          optimizeBar.update(processedFrames, { name: `Optimizing ${category}/${folder}` });
        }

        // Get dimensions from first frame
        const firstFrame = sharp(frameBuffers[0]);
        const { width: frameWidth, height: frameHeight } = await firstFrame.metadata();

        // Add to metadata
        meta.animations.push({
          name: `${category}_${folder}`, // Prefix with category for unique names
          frameWidth: frameWidth || 0,
          frameHeight: frameHeight || 0,
          frameCount: frames.length,
          rowIndex: currentRowIndex,
          frames: frames.map(frame => ({
            name: frame,
            number: getFrameNumber(frame)
          }))
        });

        // Convert buffers to sharp instances
        const sharpInstances = frameBuffers.map((buffer) => sharp(buffer));
        optimizedFrames.push(...sharpInstances);

      } catch (error) {
        console.error(`Error processing folder ${folderPath}:`, error);
        throw error;
      }

      currentRowIndex++;
    }
  }

  const compositeBar = multibar.create(1, 0, { name: 'Generating sprite sheet' });

  // Calculate sprite sheet dimensions differently
  // First, find the longest animation
  const maxFramesPerAnimation = Math.max(
    ...meta.animations.map((a) => a.frameCount)
  );
  const frameWidth = meta.animations[0].frameWidth;
  const frameHeight = meta.animations[0].frameHeight;

  // Width needs to accommodate the longest animation
  meta.width = frameWidth * maxFramesPerAnimation;
  // Height is simply number of animations times frame height
  meta.height = frameHeight * meta.animations.length;

  // Create sprite sheet
  const background = sharp({
    create: {
      width: meta.width,
      height: meta.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  // Place frames on sprite sheet - modified positioning logic
  const compositeOperations = [];
  let currentFrame = 0;

  for (const animation of meta.animations) {
    // Get the frames for this animation
    const animationFrames = optimizedFrames.slice(
      currentFrame,
      currentFrame + animation.frameCount
    );

    // Place each frame of this animation on its row
    const operations = animationFrames.map((frame, index) => ({
      input: frame,
      top: animation.rowIndex * frameHeight,
      left: index * frameWidth,
    }));

    compositeOperations.push(...operations);
    currentFrame += animation.frameCount;
  }

  // Convert Sharp instances to Buffers
  const compositeOps = await Promise.all(
    compositeOperations.map(async (op) => ({
      ...op,
      input: await op.input.toBuffer(),
    }))
  );

  // Generate files
  try {
    await Promise.all([
      // Save sprite sheet
      background
        .composite(compositeOps)
        .png({ quality: 80 })
        .toFile(path.join(outputDir, "combined-sprite.png")),

      // Save config
      fs.writeFile(
        path.join(outputDir, "combined-config.json"),
        JSON.stringify(meta, null, 2)
      ),

      // Generate CSS
      generateCombinedCSS(meta).then((css) =>
        fs.writeFile(path.join(outputDir, "combined-sprites.css"), css)
      ),
    ]);

    compositeBar.update(1);
    multibar.stop();
    console.log("\nGenerated combined sprite sheet successfully!");
  } catch (error) {
    multibar.stop();
    console.error("\nError generating combined sprite sheet:", error);
    throw error;
  }
}

function generateCombinedCSS(meta: SpriteSheetMeta): Promise<string> {
  let css = `.sprite {
    background-image: url('./combined-sprite.png');
    background-repeat: no-repeat;
    width: ${meta.animations[0].frameWidth}px;
    height: ${meta.animations[0].frameHeight}px;
    display: inline-block;
}\n\n`;

  meta.animations.forEach((animation) => {
    for (let frame = 0; frame < animation.frameCount; frame++) {
      css += `.sprite-${animation.name}-${frame} {
    background-position: -${frame * animation.frameWidth}px -${
        animation.rowIndex * animation.frameHeight
      }px;
}\n`;
    }
  });

  return Promise.resolve(css);
}

// Update exports
export {
  createCombinedSpriteSheet,
  type SpriteConfig,
  type SpriteSheetMeta,
};

// Run the combined generator
createCombinedSpriteSheet();


