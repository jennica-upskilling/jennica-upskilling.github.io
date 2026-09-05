/* ===== PostHog Init ===== */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties groupIdentify setPersonPropertiesForFlags resetGroupPropertiesForFlags setGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

posthog.init('phc_sHHdAHUqqgWNCpwaV2jLbNfrFCqSfqLKiXxeZSKrdpCF', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true
});

/* ===== Tutor Data ===== */
const TUTORS = [
  {
    id: 'tutor-1',
    name: 'Ms. Sarah Chen',
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=SarahChen&backgroundColor=fde68a',
    subjects: ['Math', 'SAT/College Prep'],
    gradeLevels: ['Middle School', 'High School'],
    rate: '$65/hr',
    slots: [
      'Mon 4:00 PM – 5:00 PM',
      'Wed 4:00 PM – 5:00 PM',
      'Fri 3:00 PM – 4:00 PM',
      'Sat 10:00 AM – 11:00 AM'
    ]
  },
  {
    id: 'tutor-2',
    name: 'Mr. James Rivera',
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=JamesRivera&backgroundColor=bfdbfe',
    subjects: ['English', 'SAT/College Prep'],
    gradeLevels: ['Elementary', 'Middle School', 'High School'],
    rate: '$55/hr',
    slots: [
      'Tue 3:30 PM – 4:30 PM',
      'Thu 3:30 PM – 4:30 PM',
      'Sat 9:00 AM – 10:00 AM',
      'Sat 11:00 AM – 12:00 PM'
    ]
  },
  {
    id: 'tutor-3',
    name: 'Dr. Priya Patel',
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=PriyaPatel&backgroundColor=d1fae5',
    subjects: ['Science', 'Math'],
    gradeLevels: ['Middle School', 'High School'],
    rate: '$75/hr',
    slots: [
      'Mon 5:00 PM – 6:00 PM',
      'Wed 5:00 PM – 6:00 PM',
      'Fri 4:00 PM – 5:00 PM',
      'Sun 2:00 PM – 3:00 PM',
      'Sun 3:00 PM – 4:00 PM'
    ]
  },
  {
    id: 'tutor-4',
    name: 'Ms. Emily Brooks',
    photo: 'https://api.dicebear.com/7.x/personas/svg?seed=EmilyBrooks&backgroundColor=fce7f3',
    subjects: ['English', 'Science'],
    gradeLevels: ['Elementary', 'Middle School'],
    rate: '$45/hr',
    slots: [
      'Mon 3:00 PM – 4:00 PM',
      'Tue 4:00 PM – 5:00 PM',
      'Thu 4:00 PM – 5:00 PM',
      'Sat 1:00 PM – 2:00 PM'
    ]
  }
];

/* ===== localStorage Helpers ===== */
const STORAGE_KEY = 'abc_tutoring_booked_slots';

function getBookedSlots() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function markSlotBooked(tutorId, slot) {
  const booked = getBookedSlots();
  if (!booked[tutorId]) booked[tutorId] = [];
  if (!booked[tutorId].includes(slot)) booked[tutorId].push(slot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(booked));
}

function isSlotBooked(tutorId, slot) {
  const booked = getBookedSlots();
  return !!(booked[tutorId] && booked[tutorId].includes(slot));
}

/* ===== State ===== */
let activeSubject = 'all';
let activeGrade = 'all';
let bookingContext = null; // { tutor, slot }

/* ===== DOM Refs ===== */
const tutorGrid = document.getElementById('tutor-grid');
const subjectFilter = document.getElementById('subject-filter');
const gradeFilter = document.getElementById('grade-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const noResults = document.getElementById('no-results');
const modalOverlay = document.getElementById('modal-overlay');
const bookingForm = document.getElementById('booking-form');
const confirmationPanel = document.getElementById('confirmation-panel');
const modalCloseBtn = document.getElementById('modal-close');

/* ===== Render Tutors ===== */
function renderTutors() {
  tutorGrid.innerHTML = '';

  TUTORS.forEach(tutor => {
    const card = document.createElement('div');
    card.className = 'tutor-card';
    card.dataset.tutorId = tutor.id;
    card.dataset.subjects = tutor.subjects.join(',');
    card.dataset.grades = tutor.gradeLevels.join(',');

    const subjectTags = tutor.subjects.map(s => `<span class="tag">${s}</span>`).join('');
    const gradeTags = tutor.gradeLevels.map(g => `<span class="tag grade">${g}</span>`).join('');

    const slotButtons = tutor.slots.map(slot => {
      const slotBooked = isSlotBooked(tutor.id, slot);
      return `<button class="slot-btn ${slotBooked ? 'booked' : ''}"
        data-tutor-id="${tutor.id}"
        data-slot="${slot}"
        ${slotBooked ? 'disabled aria-disabled="true"' : ''}
        aria-label="${slotBooked ? 'Slot booked: ' : 'Book slot: '}${slot}"
      >${slot}</button>`;
    }).join('');

    card.innerHTML = `
      <div class="card-top">
        <img class="tutor-photo" src="${tutor.photo}" alt="Photo of ${tutor.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random&size=72'">
        <div class="tutor-info">
          <h3>${tutor.name}</h3>
          <div class="tutor-rate">${tutor.rate}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="tag-group">
          <div class="tag-group-label">Subjects</div>
          <div class="tags">${subjectTags}</div>
        </div>
        <div class="tag-group">
          <div class="tag-group-label">Grade Levels</div>
          <div class="tags">${gradeTags}</div>
        </div>
        <div class="slots-section">
          <div class="slots-label">Available Times — click to book</div>
          <div class="slots">${slotButtons}</div>
        </div>
      </div>
    `;

    tutorGrid.appendChild(card);
  });

  applyFilters();
  attachSlotListeners();
}

/* ===== Filter Logic ===== */
function applyFilters() {
  const cards = tutorGrid.querySelectorAll('.tutor-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const subjects = card.dataset.subjects.split(',');
    const grades = card.dataset.grades.split(',');

    const subjectMatch = activeSubject === 'all' || subjects.includes(activeSubject);
    const gradeMatch = activeGrade === 'all' || grades.includes(activeGrade);

    if (subjectMatch && gradeMatch) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  noResults.classList.toggle('visible', visibleCount === 0);

  const filtersActive = activeSubject !== 'all' || activeGrade !== 'all';
  clearFiltersBtn.classList.toggle('hidden', !filtersActive);
}

subjectFilter.addEventListener('change', () => {
  activeSubject = subjectFilter.value;
  applyFilters();

  if (activeSubject !== 'all') {
    posthog.capture('subject_filter_selected', { subject: activeSubject });
  }
});

gradeFilter.addEventListener('change', () => {
  activeGrade = gradeFilter.value;
  applyFilters();

  if (activeGrade !== 'all') {
    posthog.capture('grade_filter_selected', { grade_level: activeGrade });
  }
});

clearFiltersBtn.addEventListener('click', () => {
  activeSubject = 'all';
  activeGrade = 'all';
  subjectFilter.value = 'all';
  gradeFilter.value = 'all';
  applyFilters();
});

/* ===== Slot Listeners ===== */
function attachSlotListeners() {
  tutorGrid.querySelectorAll('.slot-btn:not(.booked)').forEach(btn => {
    btn.addEventListener('click', () => {
      const tutorId = btn.dataset.tutorId;
      const slot = btn.dataset.slot;
      const tutor = TUTORS.find(t => t.id === tutorId);
      openBookingModal(tutor, slot);
    });
  });
}

/* ===== Booking Modal ===== */
function openBookingModal(tutor, slot) {
  bookingContext = { tutor, slot };

  // Populate summary
  document.getElementById('summary-photo').src = tutor.photo;
  document.getElementById('summary-photo').alt = `Photo of ${tutor.name}`;
  document.getElementById('summary-name').textContent = tutor.name;
  document.getElementById('summary-slot').textContent = slot;
  document.getElementById('summary-rate').textContent = tutor.rate;

  // Reset form state
  bookingForm.reset();
  bookingForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  bookingForm.querySelectorAll('.field-error').forEach(el => el.classList.remove('visible'));

  // Populate subject dropdown after reset
  const subjectSelect = document.getElementById('form-subject');
  subjectSelect.innerHTML = '';
  tutor.subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    subjectSelect.appendChild(opt);
  });

  // Show form, hide confirmation
  bookingForm.style.display = '';
  document.querySelector('.modal-header').style.display = '';
  confirmationPanel.classList.remove('visible');

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  posthog.capture('booking_started', {
    tutor_name: tutor.name,
    tutor_id: tutor.id,
    subject: tutor.subjects[0],
    time_slot: slot
  });
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  bookingContext = null;
}

modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ===== Form Validation & Submit ===== */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.add('invalid');
  error.textContent = message;
  error.classList.add('visible');
  return false;
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.remove('invalid');
  error.classList.remove('visible');
}

bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  const parentName = document.getElementById('form-parent-name').value.trim();
  const parentEmail = document.getElementById('form-parent-email').value.trim();
  const studentName = document.getElementById('form-student-name').value.trim();
  const studentGrade = document.getElementById('form-student-grade').value;
  const subject = document.getElementById('form-subject').value;

  let valid = true;

  // Clear all errors first
  ['form-parent-name', 'form-parent-email', 'form-student-name', 'form-student-grade', 'form-subject']
    .forEach((id, i) => clearError(id, ['err-parent-name','err-parent-email','err-student-name','err-student-grade','err-subject'][i]));

  if (!parentName) { showError('form-parent-name', 'err-parent-name', 'Please enter your name.'); valid = false; }
  if (!parentEmail) { showError('form-parent-email', 'err-parent-email', 'Please enter your email.'); valid = false; }
  else if (!validateEmail(parentEmail)) { showError('form-parent-email', 'err-parent-email', 'Please enter a valid email address.'); valid = false; }
  if (!studentName) { showError('form-student-name', 'err-student-name', "Please enter your student's first name."); valid = false; }
  if (!studentGrade) { showError('form-student-grade', 'err-student-grade', 'Please select a grade level.'); valid = false; }

  if (!valid) return;

  const { tutor, slot } = bookingContext;

  // Mark slot booked
  markSlotBooked(tutor.id, slot);

  // PostHog event — no PII
  posthog.capture('booking_completed', {
    tutor_name: tutor.name,
    tutor_id: tutor.id,
    requested_subject: subject,
    student_grade: studentGrade,
    time_slot: slot
  });

  // Show confirmation
  document.getElementById('confirm-tutor-name').textContent = tutor.name;
  document.getElementById('confirm-slot').textContent = slot;
  document.getElementById('confirm-subject').textContent = subject;

  bookingForm.style.display = 'none';
  document.querySelector('.modal-header').style.display = 'none';
  confirmationPanel.classList.add('visible');

  // Re-render cards to update booked state
  renderTutors();
});

document.getElementById('close-confirmation').addEventListener('click', closeModal);

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderTutors();
  document.getElementById('hero-cta').addEventListener('click', () => {
    document.getElementById('tutors').scrollIntoView({ behavior: 'smooth' });
  });
});
