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
  'pending':     { label: 'Pending',     cls: 's-muted' },
  'in-progress': { label: 'In Progress', cls: 's-blue'  },
  'done':        { label: 'Done',        cls: 's-green' },
};

const COLLAPSE_THRESHOLD = 150;

const SVG = {
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  cal:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronDown: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronUp:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
};

function fmtDue(d) {
  return 'Due ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtRemaining(d, isDone) {
  if (isDone) return 'Completed';
  const now = Date.now(), diff = d - now;
  const abs  = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hrs  = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  if (diff < 0) {
    if (mins < 60) return `Overdue by ${mins} minute${mins !== 1 ? 's' : ''}`;
    if (hrs  < 24) return `Overdue by ${hrs} hour${hrs !== 1 ? 's' : ''}`;
    return `Overdue by ${days} day${days !== 1 ? 's' : ''}`;
  }
  if (mins < 60) return `Due in ${mins} minute${mins !== 1 ? 's' : ''}`;
  if (hrs  < 24) return `Due in ${hrs} hour${hrs !== 1 ? 's' : ''}`;
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

function toDateInputValue(d) {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let state = {
  title:        TASK.title,
  description:  TASK.description,
  priority:     TASK.priority,
  status:       TASK.status,
  dueDate:      TASK.dueDate,
  completed:    TASK.status === 'done',
  editing:      false,
  deleted:      false,
  expanded:     TASK.description.length <= COLLAPSE_THRESHOLD,
  editTitle:    TASK.title,
  editDesc:     TASK.description,
  editPriority: TASK.priority,
  editDueDate:  new Date(TASK.dueDate),
};

function render() {
  const root = document.getElementById('root');

  if (state.deleted) {
    root.innerHTML = `<p class="deleted" role="status">Task deleted</p>`;
    return;
  }

  const prio         = PRIO[state.priority]   || PRIO.medium;
  const status       = STATUS[state.status]   || STATUS.pending;
  const isDone       = state.status === 'done';
  const overdue      = state.dueDate < new Date() && !isDone;
  const needsCollapse = state.description.length > COLLAPSE_THRESHOLD;
  const timeLabel    = fmtRemaining(state.dueDate, isDone);

  const cardCls = [
    'card',
    overdue ? 'overdue' : '',
    isDone  ? 'done'    : '',
    `prio-${state.priority}`,
    state.status === 'in-progress' ? 'in-progress' : '',
  ].filter(Boolean).join(' ');

  root.innerHTML = `
    <article data-testid="test-todo-card" class="${cardCls}">

      <header class="hd">
        <div class="meta">
          <span data-testid="test-todo-priority-indicator"
                class="prio-dot prio-dot--${prio.cls}"
                aria-hidden="true"></span>
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
                  aria-label="Edit task"
                  aria-pressed="${state.editing}">
            ${SVG.edit}
          </button>
          <button data-testid="test-todo-delete-button"
                  class="btn del"
                  id="btnDel"
                  aria-label="Delete task">
            ${SVG.trash}
          </button>
        </div>
      </header>

      <div class="status-row">
        <span class="status-label" id="statusLabel">Status</span>
        <select data-testid="test-todo-status-control"
                id="statusControl"
                class="status-select ${status.cls}"
                aria-labelledby="statusLabel"
                aria-label="Change task status">
          ${Object.entries(STATUS).map(([key, val]) =>
            `<option value="${key}"${state.status === key ? ' selected' : ''}>${val.label}</option>`
          ).join('')}
        </select>
      </div>

      ${state.editing ? `
      <form data-testid="test-todo-edit-form"
            id="editForm"
            class="edit-form"
            novalidate>
        <div class="form-field">
          <label class="form-label" for="editTitleInp">Title</label>
          <input data-testid="test-todo-edit-title-input"
                 id="editTitleInp"
                 class="edit-title"
                 type="text"
                 value="${state.editTitle.replace(/"/g, '&quot;')}"
                 aria-label="Edit task title" />
        </div>
        <div class="form-field">
          <label class="form-label" for="editDescInp">Description</label>
          <textarea data-testid="test-todo-edit-description-input"
                    id="editDescInp"
                    class="edit-desc"
                    rows="4"
                    aria-label="Edit task description">${state.editDesc}</textarea>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label" for="editPriorityInp">Priority</label>
            <select data-testid="test-todo-edit-priority-select"
                    id="editPriorityInp"
                    class="edit-select"
                    aria-label="Edit task priority">
              ${Object.entries(PRIO).map(([key, val]) =>
                `<option value="${key}"${state.editPriority === key ? ' selected' : ''}>${val.label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label" for="editDueDateInp">Due Date</label>
            <input data-testid="test-todo-edit-due-date-input"
                   id="editDueDateInp"
                   class="edit-date"
                   type="date"
                   value="${toDateInputValue(state.editDueDate)}"
                   aria-label="Edit due date" />
          </div>
        </div>
        <div class="form-actions">
          <button data-testid="test-todo-save-button"
                  id="btnSave"
                  type="button"
                  class="btn-action btn-save">
            ${SVG.check} Save
          </button>
          <button data-testid="test-todo-cancel-button"
                  id="btnCancel"
                  type="button"
                  class="btn-action btn-cancel">
            Cancel
          </button>
        </div>
      </form>
      ` : `
      <div class="title-row">
        <label class="cb-wrap" aria-label="Mark task complete">
          <input data-testid="test-todo-complete-toggle"
                 type="checkbox"
                 id="cbToggle"
                 ${isDone ? 'checked' : ''} />
          <span class="cb-custom" aria-hidden="true">
            ${isDone ? SVG.check : ''}
          </span>
        </label>
        <h2 data-testid="test-todo-title" class="title">${state.title}</h2>
      </div>

      <div data-testid="test-todo-collapsible-section"
           id="collapsibleSection"
           class="collapsible${state.expanded || !needsCollapse ? ' expanded' : ''}">
        <p data-testid="test-todo-description" class="desc">${state.description}</p>
      </div>

      ${needsCollapse ? `
      <button data-testid="test-todo-expand-toggle"
              id="btnExpand"
              class="expand-toggle"
              type="button"
              aria-expanded="${state.expanded}"
              aria-controls="collapsibleSection">
        ${state.expanded ? SVG.chevronUp + ' Show less' : SVG.chevronDown + ' Show more'}
      </button>
      ` : ''}
      `}

      <div class="divider"></div>

      <div class="dates">
        <time data-testid="test-todo-due-date"
              datetime="${state.dueDate.toISOString()}"
              aria-label="${fmtDue(state.dueDate)}">
          ${SVG.cal} ${fmtDue(state.dueDate)}
        </time>
        <time data-testid="test-todo-time-remaining"
              id="timeRemaining"
              datetime="${state.dueDate.toISOString()}"
              class="${overdue ? 'overdue' : ''}"
              aria-live="polite"
              aria-label="${timeLabel}">
          ${isDone ? SVG.check + ' Completed' : SVG.clock + ' ' + timeLabel}
        </time>
        ${overdue ? `
        <span data-testid="test-todo-overdue-indicator"
              class="overdue-badge"
              role="alert">Overdue</span>
        ` : ''}
      </div>

      <ul data-testid="test-todo-tags" class="tags" role="list" aria-label="Categories">
        ${TASK.categories.map(t =>
          `<li data-testid="test-todo-tag-${t}" class="tag" role="listitem">${t}</li>`
        ).join('')}
      </ul>

    </article>
  `;

  /* — wire events — */

  document.getElementById('btnEdit').addEventListener('click', () => {
    state.editTitle    = state.title;
    state.editDesc     = state.description;
    state.editPriority = state.priority;
    state.editDueDate  = new Date(state.dueDate);
    state.editing      = true;
    render();
    const inp = document.getElementById('editTitleInp');
    if (inp) inp.focus();
  });

  document.getElementById('btnDel').addEventListener('click', () => {
    state.deleted = true;
    render();
  });

  document.getElementById('statusControl').addEventListener('change', e => {
    state.status    = e.target.value;
    state.completed = state.status === 'done';
    render();
  });

  if (state.editing) {
    const titleInp = document.getElementById('editTitleInp');
    const descInp  = document.getElementById('editDescInp');
    const prioInp  = document.getElementById('editPriorityInp');
    const dateInp  = document.getElementById('editDueDateInp');

    titleInp.addEventListener('input',  e => { state.editTitle    = e.target.value; });
    descInp.addEventListener('input',   e => { state.editDesc     = e.target.value; });
    prioInp.addEventListener('change',  e => { state.editPriority = e.target.value; });
    dateInp.addEventListener('change',  e => {
      const d = new Date(e.target.value + 'T00:00:00');
      if (!isNaN(d)) state.editDueDate = d;
    });

    document.getElementById('btnSave').addEventListener('click', () => {
      state.title       = state.editTitle.trim()  || state.title;
      state.description = state.editDesc.trim()   || state.description;
      state.priority    = state.editPriority;
      state.dueDate     = state.editDueDate;
      state.expanded    = state.description.length <= COLLAPSE_THRESHOLD;
      state.editing     = false;
      render();
      document.getElementById('btnEdit').focus();
    });

    document.getElementById('btnCancel').addEventListener('click', () => {
      state.editing = false;
      render();
      document.getElementById('btnEdit').focus();
    });

  } else {
    const cb = document.getElementById('cbToggle');
    cb.addEventListener('change', () => {
      state.completed = cb.checked;
      state.status    = cb.checked ? 'done' : 'pending';
      render();
      if (cb.checked) {
        const card = document.querySelector('.card');
        if (card) {
          card.classList.add('just-done');
          setTimeout(() => card.classList.remove('just-done'), 1800);
        }
      }
    });

    const expandBtn = document.getElementById('btnExpand');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        state.expanded = !state.expanded;
        render();
      });
    }
  }
}

render();

/* — tick every 30s — */
setInterval(() => {
  if (state.editing) return;
  const el = document.getElementById('timeRemaining');
  if (!el) return;
  const isDone  = state.status === 'done';
  const overdue = state.dueDate < new Date() && !isDone;
  const label   = fmtRemaining(state.dueDate, isDone);
  el.innerHTML  = isDone ? SVG.check + ' Completed' : SVG.clock + ' ' + label;
  el.setAttribute('aria-label', label);
  el.className  = overdue ? 'overdue' : '';

  const card = document.querySelector('[data-testid="test-todo-card"]');
  if (card) {
    card.classList.toggle('overdue', overdue);
  }

  const datesDiv = el.closest('.dates');
  const existingBadge = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
  if (overdue && !existingBadge && datesDiv) {
    const badge = document.createElement('span');
    badge.setAttribute('data-testid', 'test-todo-overdue-indicator');
    badge.className = 'overdue-badge';
    badge.setAttribute('role', 'alert');
    badge.textContent = 'Overdue';
    datesDiv.appendChild(badge);
  } else if (!overdue && existingBadge) {
    existingBadge.remove();
  }
}, 30000);
