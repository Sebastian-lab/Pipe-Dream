import { initGraphComponent } from './Graph';

export type Tab = 'home' | 'chart' | 'graph' | 'report' | 'contact';

export function setupHeader(headerContainer: HTMLElement, contentContainer: HTMLElement) {
  headerContainer.innerHTML = `
    <header class="header">
      <div class="header-logo">
        <img src="https://via.placeholder.com/150x50?text=Pipe+Dream" alt="Pipe Dream Logo" class="logo-img" style="cursor: pointer;" />
      </div>
      <nav class="header-nav">
        <button class="tab-btn active" data-tab="home">Home</button>
        <button class="tab-btn" data-tab="chart">Chart</button>
        <button class="tab-btn" data-tab="graph">Graph</button>
        <button class="tab-btn" data-tab="report">Report</button>
        <button class="tab-btn" data-tab="contact">Contact Us</button>
      </nav>
      <div class="header-auth">
        <button class="auth-btn auth-btn-secondary">Log In</button>
        <button class="auth-btn auth-btn-primary">Sign Up</button>
      </div>
    </header>
  `;

  contentContainer.innerHTML = `
    <div class="tabs-container">
      <div id="home-content" class="tab-content">
        <div class="home-content">
          <h1>Pipe Dream</h1>
          <p class="description">A real-time weather monitoring system that tracks temperature readings from multiple cities around the world.</p>
        </div>
      </div>
      
      <div id="chart-content" class="tab-content" style="display: none;">
        <div id="table-container"></div>
      </div>
      
      <div id="graph-content" class="tab-content" style="display: none;">
        <div class="graph-container">
          <div class="graph-header">
            <label for="graph-city-select">Select City: </label>
            <select id="graph-city-select">
              <option value="">Loading cities...</option>
            </select>
          </div>
          <div id="graph-canvas-container" class="chart-wrapper">
            <p class="loading-text">Loading chart...</p>
          </div>
        </div>
      </div>
      
      <div id="report-content" class="tab-content" style="display: none;">
        <p>Report section coming soon...</p>
      </div>
      
      <div id="contact-content" class="tab-content" style="display: none;">
        <p>Contact Us section coming soon...</p>
      </div>
    </div>
  `;

  function showTab(tab: Tab) {
    headerContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    contentContainer.querySelectorAll('.tab-content').forEach(content => {
      (content as HTMLElement).style.display = 'none';
    });

    const activeBtn = headerContainer.querySelector(`[data-tab="${tab}"]`);
    const activeContent = contentContainer.querySelector(`#${tab}-content`) as HTMLElement;

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.style.display = 'block';

    if (tab === 'graph') {
      initGraphComponent();
    }
  }

  headerContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as Tab;
      showTab(tab);
    });
  });

  headerContainer.querySelector('.header-logo')?.addEventListener('click', () => {
    showTab('home');
  });
}

export function getPredictionsContainer(): HTMLElement | null {
  return document.querySelector('#predictions-table-container');
}

export function getCitySelect(): HTMLSelectElement | null {
  return document.querySelector('#city-select');
}
