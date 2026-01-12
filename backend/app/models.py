from pydantic import BaseModel
from typing import List, Optional

# Nested model for a single reading
class Reading(BaseModel):
    tempF: Optional[float] = None
    tempC: Optional[float] = None
    timezone: Optional[str] = None
    localTime: str

# Main CityReading model
class CityReading(BaseModel):
    city: str
    readings: List[Reading]  # List of readings (last 10)
