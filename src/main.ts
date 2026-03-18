import './style.css'
import { setupHeader, getPredictionsContainer, getCitySelect } from './components/Header'
import { setupWeatherWidget } from './components/WeatherWidget'
import { setupFooter } from './components/Footer'
import { fetchPredictions } from './api/weather'
import type { Prediction } from './types'

document.body.innerHTML = `
  <div id="header-container"></div>
  <div id="app">
    <div id="content-container"></div>
  </div>
`;

const contentContainer = document.querySelector<HTMLDivElement>('#content-container')!;

setupHeader(
  document.querySelector<HTMLDivElement>('#header-container')!,
  contentContainer
);

setupWeatherWidget(
  document.querySelector<HTMLDivElement>('#table-container')!
);

let allPredictions: Prediction[] = [];

async function loadPredictions() {
  try {
    allPredictions = await fetchPredictions();
    const cities = [...new Set(allPredictions.map(p => p.city))];
    const select = getCitySelect()!;
    select.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join('');
    
    if (cities.length > 0) {
      renderPredictionsTable(cities[0]);
    }
    
    select.addEventListener('change', (e) => {
      const selectedCity = (e.target as HTMLSelectElement).value;
      if (selectedCity) {
        renderPredictionsTable(selectedCity);
      }
    });
  } catch (error) {
    console.error('Failed to load predictions:', error);
    const select = getCitySelect();
    if (select) select.innerHTML = '<option value="">Failed to load</option>';
  }
}

function renderPredictionsTable(city: string) {
  const container = getPredictionsContainer()!;
  const predictions = allPredictions.filter(p => p.city === city);
  
  if (predictions.length === 0) {
    container.innerHTML = '<p>No predictions found for this city.</p>';
    return;
  }
  
  const latestPred = predictions[0];
  
  let tableHTML = `
    <table class="predictions-table">
      <thead>
        <tr>
          <th>Prediction Value</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  latestPred.predictions.forEach((value, index) => {
    const timestamp = latestPred.timestamps[index] || 'N/A';
    tableHTML += `
      <tr>
        <td>${value.toFixed(4)}</td>
        <td>${timestamp}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
    <div class="predictions-meta">
      <p><strong>Model File:</strong> ${latestPred.model_file}</p>
      <p><strong>Created At:</strong> ${latestPred.created_at}</p>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

loadPredictions();

setupFooter(
  document.querySelector<HTMLDivElement>('#footer-container')!
);
