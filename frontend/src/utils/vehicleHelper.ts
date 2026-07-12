export interface ParsedVehicle {
  variant: string;
  mileage: number;
  engine_capacity: string;
  color: string;
  images: string[];
  descriptionText: string;
}

export function parseVehicleDescription(
  description: string | null,
  _fallbackModel: string,
  fallbackImgUrl: string | null
): ParsedVehicle {
  if (!description) {
    return {
      variant: 'Standard',
      mileage: 0,
      engine_capacity: 'N/A',
      color: 'N/A',
      images: fallbackImgUrl ? [fallbackImgUrl] : [],
      descriptionText: '',
    };
  }

  try {
    const trimmed = description.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      return {
        variant: parsed.variant || 'Standard',
        mileage: typeof parsed.mileage === 'number' ? parsed.mileage : 0,
        engine_capacity: parsed.engine_capacity || 'N/A',
        color: parsed.color || 'N/A',
        images: Array.isArray(parsed.images) && parsed.images.length > 0 ? parsed.images : (fallbackImgUrl ? [fallbackImgUrl] : []),
        descriptionText: parsed.text || '',
      };
    }
  } catch (e) {
    // Fail silently and fallback
  }

  // Fallback for simple string descriptions
  return {
    variant: 'Standard',
    mileage: 0,
    engine_capacity: 'N/A',
    color: 'N/A',
    images: fallbackImgUrl ? [fallbackImgUrl] : [],
    descriptionText: description,
  };
}

export function serializeVehicleDescription(
  variant: string,
  mileage: number,
  engineCapacity: string,
  color: string,
  images: string[],
  text: string
): string {
  return JSON.stringify({
    variant,
    mileage,
    engine_capacity: engineCapacity,
    color,
    images,
    text,
  });
}
