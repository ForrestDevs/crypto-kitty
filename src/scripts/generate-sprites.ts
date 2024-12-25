import { createCombinedSpriteSheet } from '../lib/ss-lib';

createCombinedSpriteSheet()
    .then(() => console.log('Combined sprite sheet generated successfully'))
    .catch(console.error); 