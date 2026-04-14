const TASK = {
  title: 'Redesign onboarding flow for mobile users',
  description: 'Audit the current 7-step signup funnel, identify drop-off points from analytics, and prototype a streamlined 3-step version. Coordinate with marketing on copy.',
  priority: 'high',
  status: 'in-progress',
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 27),
  categories: ['design', 'mobile', 'ux', 'q2-okr'],
};

const PRIO = {
  high:   { label: 'HIGH', cls: 'high', sym: '▲' },
  medium: { label: 'MED',  cls: 'med',  sym: '◆' },
  low:    { label: 'LOW',  cls: 'low',  sym: '▼' },
};
const STATUS = {
  'in-progress': { label: 'In Progress', cls: 's-blue'  },
  'todo':        { label: 'To Do',       cls: 's-muted' },
  'blocked':     { label: 'Blocked',     cls: 's-red'   },
  'done':        { label: 'Done',        cls: 's-green' },
};

const SVG = {
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  cal:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

function fmtDue(d) {
  return 'Due ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtRemaining(d) {
  const now = Date.now(), diff = d - now;
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hrs  = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  if (diff < 0) {
    if (mins < 60) return `Overdue by ${mins}m`;
    if (hrs  < 24) return `Overdue by ${hrs}h`;
    return `Overdue by ${days}d`;
  }
  if (mins < 60) return `Due in ${mins}m`;
  if (hrs  < 24) return `Due in ${hrs}h`;
  if (days === 1) return `Due tomorrow`;
  return `Due in ${days} days`;
}

let state = {
  title:      TASK.title,
  description: TASK.description,
  completed:  false,
  editing:    false,
  deleted:    false,
  editTitle:  TASK.title,
  editDesc:   TASK.description,
};

function render() {
  const root = document.getElementById('root');

  if (state.deleted) {
    root.innerHTML = `<p class="deleted" role="status">Task deleted</p>`;
    return;
  }

  const prio    = PRIO[TASK.priority]   || PRIO.medium;
  const status  = STATUS[TASK.status]   || STATUS.todo;
  const overdue = TASK.dueDate < new Date() && !state.completed;
  const cardCls = ['card', overdue ? 'overdue' : '', state.completed ? 'done' : ''].filter(Boolean).join(' ');
  const timeLabel = fmtRemaining(TASK.dueDate);

  root.innerHTML = `
    <article data-testid="test-todo-card" class="${cardCls}">

      <header class="hd">
        <div class="meta">
          <span data-testid="test-todo-priority"
                class="badge ${prio.cls}"
                aria-label="Priority: ${prio.label}">
            <span aria-hidden="true">${prio.sym}</span>${prio.label}
          </span>
          <span data-testid="test-todo-status"
                class="status ${status.cls}"
                aria-label="Status: ${status.label}">
            <span class="pip" aria-hidden="true"></span>${status.label}
          </span>
        </div>
        <div class="actions">
          <button data-testid="test-todo-edit-button"
                  class="btn${state.editing ? ' active' : ''}"
                  id="btnEdit"
                  aria-label="${state.editing ? 'Save edits' : 'Edit task'}">
            ${state.editing ? SVG.check : SVG.edit}
          </button>
          <button data-testid="test-todo-delete-button"
                  class="btn del"
                  id="btnDel"
                  aria-label="Delete task">
            ${SVG.trash}
          </button>
        </div>
      </header>

      <div class="title-row">
        <label class="cb-wrap" aria-label="Mark task complete">
          <input data-testid="test-todo-complete-toggle"
                 type="checkbox"
                 id="cbToggle"
                 ${state.completed ? 'checked' : ''} />
          <span class="cb-custom" aria-hidden="true">
            ${state.completed ? SVG.check : ''}
          </span>
        </label>
        ${state.editing
          ? `<input class="edit-title" id="inpTitle"
                    value="${state.editTitle.replace(/"/g, '&quot;')}"
                    aria-label="Edit task title" />`
          : `<h2 data-testid="test-todo-title" class="title">${state.title}</h2>`
        }
      </div>

      ${state.editing
        ? `<textarea class="edit-desc" id="inpDesc"
                     rows="3"
                     aria-label="Edit task description">${state.editDesc}</textarea>`
        : `<p data-testid="test-todo-description" class="desc">${state.description}</p>`
      }

      <div class="divider"></div>

      <div class="dates">
        <time data-testid="test-todo-due-date"
              datetime="${TASK.dueDate.toISOString()}"
              aria-label="${fmtDue(TASK.dueDate)}">
          ${SVG.cal} ${fmtDue(TASK.dueDate)}
        </time>
        <time data-testid="test-todo-time-remaining"
              id="timeRemaining"
              datetime="${TASK.dueDate.toISOString()}"
              class="${overdue ? 'overdue' : ''}"
              aria-live="polite"
              aria-label="${timeLabel}">
          ${SVG.clock} ${timeLabel}
        </time>
      </div>

      <ul data-testid="test-todo-tags" class="tags" role="list" aria-label="Categories">
        ${TASK.categories.map(t =>
          `<li data-testid="test-todo-tag-${t}" class="tag" role="listitem">${t}</li>`
        ).join('')}
      </ul>

    </article>
  `;

  /* — wire up events — */
  document.getElementById('btnEdit').addEventListener('click', () => {
    if (state.editing) {
      const t = document.getElementById('inpTitle');
      const d = document.getElementById('inpDesc');
      state.title       = (t && t.value.trim()) || state.title;
      state.description = (d && d.value.trim()) || state.description;
      state.editTitle   = state.title;
      state.editDesc    = state.description;
    }
    state.editing = !state.editing;
    render();
    if (state.editing) {
      const t = document.getElementById('inpTitle');
      if (t) t.focus();
    }
  });

  document.getElementById('btnDel').addEventListener('click', () => {
    state.deleted = true;
    render();
  });

  const cb = document.getElementById('cbToggle');
  cb.addEventListener('change', () => {
    const wasUnchecked = !state.completed;
    state.completed = cb.checked;
    render();
    if (wasUnchecked) {
      const card = document.querySelector('.card');
      if (card) {
        card.classList.add('just-done');
        setTimeout(() => card.classList.remove('just-done'), 1800);
      }
    }
  });

  if (state.editing) {
    const t = document.getElementById('inpTitle');
    const d = document.getElementById('inpDesc');
    if (t) t.addEventListener('input', e => { state.editTitle = e.target.value; });
    if (d) d.addEventListener('input', e => { state.editDesc  = e.target.value; });
  }
}

render();

/* — tick every 30s — */
setInterval(() => {
  const el = document.getElementById('timeRemaining');
  if (!el) return;
  const label = fmtRemaining(TASK.dueDate);
  const overdue = TASK.dueDate < new Date() && !state.completed;
  el.textContent = '';
  el.insertAdjacentHTML('beforeend', SVG.clock + ' ' + label);
  el.setAttribute('aria-label', label);
  el.className = overdue ? 'overdue' : '';
}, 30000);
