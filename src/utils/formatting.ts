export function formatCityTime(localTime: string, timezone?: string): string {
  if (!timezone) return "Unknown";
  
  const date = new Date(localTime);
  
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone, 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
}
