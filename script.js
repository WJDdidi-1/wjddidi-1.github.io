'use strict';
// Native links and disclosures work without JavaScript. Filtering is optional.
const filters = document.querySelector('.filters');
const projects = [...document.querySelectorAll('.project[data-category]')];
if (filters && projects.length) {
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const category = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    let count = 0;
    projects.forEach(project => {
      const visible = category === 'all' || project.dataset.category === category;
      project.hidden = !visible;
      if (visible) count += 1;
    });
    document.querySelector('#filter-status').textContent = `${count} projects shown.`;
  });
}
