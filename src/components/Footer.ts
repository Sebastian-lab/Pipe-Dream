export function setupFooter(container: HTMLElement) {
  container.innerHTML = `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-row">
          <div class="footer-section contributors">
            <h4>Contributors</h4>
            <p>Sebastian Partow, Alex Akoopie, James Huang</p>
          </div>
          
          <div class="footer-section contact">
            <h4>Contact</h4>
            <p>Email: <a href="mailto:contact@pipedream.com">contact@pipedream.com</a></p>
          </div>
          
          <div class="footer-section version">
            <span class="version-badge">v1.0</span>
          </div>
        </div>
        
        <div class="attribution-section attribution">
          <button class="attribution-toggle" aria-expanded="false">
            Credits & Attribution
            <span class="toggle-icon">▼</span>
          </button>
          <div class="attribution-content" hidden>
            <p>Add credits and attribution here...</p>
          </div>
        </div>
      </div>
    </footer>
  `;

  const toggleBtn = container.querySelector('.attribution-toggle') as HTMLButtonElement;
  const attributionContent = container.querySelector('.attribution-content') as HTMLElement;
  const toggleIcon = container.querySelector('.toggle-icon') as HTMLElement;

  toggleBtn?.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    
    if (isExpanded) {
      attributionContent.hidden = true;
      toggleIcon.style.transform = 'rotate(0deg)';
    } else {
      attributionContent.hidden = false;
      toggleIcon.style.transform = 'rotate(180deg)';
    }
  });
}
