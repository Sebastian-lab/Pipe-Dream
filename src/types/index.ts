// Type for a single reading
export interface Reading {
  tempF: number | null;
  tempC: number | null;
  timezone?: string;
  localTime: string;
  error?: string;
}

// Type for a city with multiple readings
export interface CityReading {
  city: string;
  readings: Reading[]; // last 10 readings
}
