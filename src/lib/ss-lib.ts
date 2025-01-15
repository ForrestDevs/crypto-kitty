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

interface CombinedAnimation {
  name: string;
  parts: string[];
}

const COMBINED_ANIMATIONS: CombinedAnimation[] = [
  {
    name: "sleep_full",
    parts: ["sleepstart", "sleeping", "sleepwake"],
  },
];

async function optimizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
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
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: "{bar} | {percentage}% | {value}/{total} | {name} | {status}",
    },
    cliProgress.Presets.shades_classic
  );

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

  // First, process combined animations
  const combinedFrames: Map<string, Buffer[]> = new Map();

  for (const combined of COMBINED_ANIMATIONS) {
    const frames: Buffer[] = [];

    // Collect frames from all parts in order
    for (const part of combined.parts) {
      const folderPath = path.join(animationsDir, part);
      const partFrames = await fs.readdir(folderPath);

      // Sort frames by number
      const sortedFrames = partFrames.sort(
        (a, b) => getFrameNumber(a) - getFrameNumber(b)
      );

      // Process each frame
      for (const frame of sortedFrames) {
        const framePath = path.join(folderPath, frame);
        const optimizedBuffer = await optimizeImage(framePath);
        frames.push(optimizedBuffer);
      }
    }

    combinedFrames.set(combined.name, frames);
  }

  // Modify the categories to exclude combined animation parts
  const categories = {
    idle: ["idle", "idle2"],
    eat: ["eating", "hungry", "hungry2"],
    sleep: ["sleepy"], // Remove individual sleep animations
    clean: ["dirty", "dirty2", "shower"],
  };

  // Calculate total frames including combined animations
  let totalFrames = 0;
  for (const frames of combinedFrames.values()) {
    totalFrames += frames.length;
  }
  for (const animationFolders of Object.values(categories)) {
    for (const folder of animationFolders) {
      const folderPath = path.join(animationsDir, folder);
      const frames = await fs.readdir(folderPath);
      totalFrames += frames.length;
    }
  }

  const progressBar = multibar.create(totalFrames, 0, {
    name: "Processing frames",
    status: "Starting...",
  });
  const optimizeBar = multibar.create(totalFrames, 0, {
    name: "Optimizing images",
    status: "Starting...",
  });
  const compositeBar = multibar.create(100, 0, {
    name: "Generating sheet",
    status: "Waiting...",
  });

  let currentRowIndex = 0;
  let processedFrames = 0;

  // First, process combined animations
  for (const [name, frames] of combinedFrames.entries()) {
    const firstFrame = sharp(frames[0]);
    const { width: frameWidth, height: frameHeight } =
      await firstFrame.metadata();

    meta.animations.push({
      name,
      frameWidth: frameWidth || 0,
      frameHeight: frameHeight || 0,
      frameCount: frames.length,
      rowIndex: currentRowIndex,
      frames: frames.map((_, index) => ({
        name: `${name}_${index}`,
        number: index,
      })),
    });

    // Convert buffers to sharp instances
    const sharpInstances = frames.map((buffer) => sharp(buffer));
    optimizedFrames.push(...sharpInstances);

    currentRowIndex++;
    processedFrames += frames.length;
    progressBar.update(processedFrames, {
      status: `Processing combined animation: ${name}`,
    });
    optimizeBar.update(processedFrames);
  }

  // Then process regular animations
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
          progressBar.update(processedFrames, {
            status: `Processing ${category}/${folder}`,
          });
          optimizeBar.update(processedFrames);
        }

        // Get dimensions from first frame
        const firstFrame = sharp(frameBuffers[0]);
        const { width: frameWidth, height: frameHeight } =
          await firstFrame.metadata();

        // Add to metadata
        meta.animations.push({
          name: `${category}_${folder}`, // Prefix with category for unique names
          frameWidth: frameWidth || 0,
          frameHeight: frameHeight || 0,
          frameCount: frames.length,
          rowIndex: currentRowIndex,
          frames: frames.map((frame) => ({
            name: frame,
            number: getFrameNumber(frame),
          })),
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

  // Update sprite sheet generation progress
  compositeBar.update(10, { status: "Calculating dimensions..." });

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

  compositeBar.update(30, { status: "Creating background..." });

  // Create sprite sheet
  const background = sharp({
    create: {
      width: meta.width,
      height: meta.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
    limitInputPixels: false,
  });

  compositeBar.update(30, { status: "Preparing composite operations..." });

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

  compositeBar.update(50, { status: "Converting frames..." });

  // Convert Sharp instances to Buffers
  const compositeOps = await Promise.all(
    compositeOperations.map(async (op) => ({
      ...op,
      input: await op.input.toBuffer(),
    }))
  );

  compositeBar.update(70, { status: "Generating final sprite sheet..." });

  // Generate files
  try {
    await Promise.all([
      // Save sprite sheet
      background
        .composite(compositeOps)
        .png({ quality: 80 })
        .toFile(path.join(outputDir, "combined-sprite.png"))
        .then(() => {
          compositeBar.update(80, { status: "Saving sprite sheet..." });
        }),

      // Save config
      fs
        .writeFile(
          path.join(outputDir, "combined-config.json"),
          JSON.stringify(meta, null, 2)
        )
        .then(() => {
          compositeBar.update(90, { status: "Saving config..." });
        }),

      // Generate CSS
      generateCombinedCSS(meta)
        .then((css) =>
          fs.writeFile(path.join(outputDir, "combined-sprites.css"), css)
        )
        .then(() => {
          compositeBar.update(95, { status: "Generating CSS..." });
        }),
    ]);

    compositeBar.update(100, { status: "Complete!" });
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
export { createCombinedSpriteSheet, type SpriteConfig, type SpriteSheetMeta };

// Run the combined generator
createCombinedSpriteSheet();
