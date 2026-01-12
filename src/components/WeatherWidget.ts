import { fetchWeatherReadings } from '../api/weather';
import { formatCityTime } from '../utils/formatting';
import type { CityReading, Reading } from '../types';

export function setupWeatherWidget(displayContainer: HTMLDivElement) {
  let isFetching = false; // Prevent overlapping fetches

  const renderTable = (data: CityReading[]) => {
    if (data.length === 0) {
      displayContainer.innerHTML = '<p>No data loaded.</p>';
      return;
    }

    // Map over cities and get the latest reading from the readings array
    const rows = data.map(city => {
      const latest: Reading | undefined = city.readings[city.readings.length - 1];

      if (!latest) {
        return `<tr class="error-row">
          <td>${city.city}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>`;
      }

      return `
        <tr>
          <td>${city.city}</td>
          <td>${latest.tempC ?? '-'}</td>
          <td>${latest.tempF ?? '-'}</td>
          <td>${formatCityTime(latest.timezone)}</td>
        </tr>
      `;
    }).join('');

    // Get current time for table caption
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    displayContainer.innerHTML = `
      <table class="temp-table">
        <caption class="table-caption">Last updated: ${formattedTime}</caption>
        <thead>
          <tr><th>City</th><th>Temp (°C)</th><th>Temp (°F)</th><th>Local Time</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Move caption to bottom
    const caption = displayContainer.querySelector('caption');
    if (caption) {
      (caption as HTMLElement).style.captionSide = 'bottom';
      (caption as HTMLElement).style.fontStyle = 'italic';
      (caption as HTMLElement).style.textAlign = 'center';
      (caption as HTMLElement).style.paddingTop = '8px';
    }
  };

  const fetchAndRender = async () => {
    if (isFetching) return;
    isFetching = true;

    // Show loading indicator for first fetch only
    if (!displayContainer.innerHTML) {
      displayContainer.innerHTML = '<p class="loading-text">Fetching live data...</p>';
    }

    try {
      const data = await fetchWeatherReadings();
      renderTable(data);
    } catch (err) {
      displayContainer.innerHTML = `<p style="color:red">Error: ${err}</p>`;
    } finally {
       isFetching = false;
    }
  };

  // Fetch immediately when the widget loads
  fetchAndRender();

  // Refresh every 1 minute
  setInterval(fetchAndRender, 60_000);
}
