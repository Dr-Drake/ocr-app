import sharp from 'sharp';

export function preprocessImage(filePath: string) {

    // Load the image
    const image = sharp(filePath);

    // Convert the image to grayscale
    image.grayscale();

    // Increase the contrast of the image
    image.modulate({ brightness: 1.2, saturation: 0 });

    // Apply median filter to reduce noise
    image.median(3);

    return image.toBuffer();
    
}

