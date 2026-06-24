// ─── Directors ───────────────────────────────────────────────────────────────
export const DIRS = {
  ameen:   { id:'ameen',   name:'Ameen',      entity:'APML',              color:'#1565a8', initials:'AM', role:'Director' },
  junaid:  { id:'junaid',  name:'Junaid',      entity:'Herbal Park',       color:'#0f6e56', initials:'JU', role:'Director' },
  praveen: { id:'praveen', name:'Praveen',     entity:'Atomic Drugstore',  color:'#c0392b', initials:'PR', role:'Director' },
  sajeed:  { id:'sajeed',  name:'Sajeed',      entity:'Pine Pharmacy',     color:'#993556', initials:'SA', role:'Director' },
  suhail:  { id:'suhail',  name:'Suhail',      entity:'Al Jebal Opticals', color:'#854f0b', initials:'SU', role:'Director' },
  admin:   { id:'admin',   name:'Admin / PA',  entity:'HiFive Holdings',   color:'#0a2240', initials:'PA', role:'Admin / PA' }
}

export const DIR_ORDER = ['ameen', 'junaid', 'praveen', 'sajeed', 'suhail']

// ─── Entry types ──────────────────────────────────────────────────────────────
export const TYPES = {
  meeting:     { label:'Meeting',     bg:'#eeedfe', fg:'#3c3489' },
  task:        { label:'Task',        bg:'#f1efe8', fg:'#444441' },
  sitevisit:   { label:'Site visit',  bg:'#e1f5ee', fg:'#085041' },
  appointment: { label:'Appointment', bg:'#e6f1fb', fg:'#0c447c' },
  deadline:    { label:'Deadline',    bg:'#faeeda', fg:'#633806' }
}

// ─── Status ───────────────────────────────────────────────────────────────────
export const STATUS = {
  scheduled: { label:'Scheduled', bg:'#eaf3de', fg:'#27500a' },
  completed: { label:'Completed', bg:'#f1efe8', fg:'#444441' },
  cancelled: { label:'Cancelled', bg:'#fcebeb', fg:'#501313' }
}

// ─── Priority ─────────────────────────────────────────────────────────────────
export const PRIORITY = {
  high:   { label:'High',   bg:'#fcebeb', fg:'#501313' },
  medium: { label:'Medium', bg:'#f0f0f0', fg:'#555555' },
  low:    { label:'Low',    bg:'#f8f8f8', fg:'#888888' }
}

// ─── Entities ─────────────────────────────────────────────────────────────────
export const ENTITIES = [
  'APML',
  'Herbal Park',
  'Atomic Drugstore',
  'Pine Pharmacy',
  'Al Jebal Opticals',
  'Group / HiFive'
]

// ─── Reminder options ─────────────────────────────────────────────────────────
export const REMINDERS = [
  { id:'1h',    label:'1 hour before' },
  { id:'amday', label:'Same day AM'   },
  { id:'none',  label:'None'          }
]

// ─── Seed data ────────────────────────────────────────────────────────────────
export const SEED_ENTRIES = [
  { id:'e0',  dir:'ameen',   title:'MOH licence renewal meeting',    time:'10:00 AM', location:'APML HQ',          type:'appointment', status:'scheduled', date:'2026-06-22', priority:'medium', entity:'APML',              reminder:'1h'    },
  { id:'e1',  dir:'ameen',   title:'Submit Q2 lab performance report',time:'End of day',location:'APML',           type:'deadline',    status:'scheduled', date:'2026-06-22', priority:'medium', entity:'APML',              reminder:'amday' },
  { id:'e2',  dir:'ameen',   title:'Vendor contract review — reagents',time:'3:00 PM', location:'Office',          type:'task',        status:'cancelled', date:'2026-06-22', priority:'medium', entity:'APML',              reminder:'none'  },
  { id:'e3',  dir:'junaid',  title:'Herbal Park site inspection',     time:'9:30 AM',  location:'Herbal Park',     type:'sitevisit',   status:'scheduled', date:'2026-06-22', priority:'medium', entity:'Herbal Park',       reminder:'1h'    },
  { id:'e4',  dir:'junaid',  title:'Ayurveda practitioner interview', time:'4:00 PM',  location:'Herbal Park',     type:'meeting',     status:'scheduled', date:'2026-06-22', priority:'medium', entity:'Herbal Park',       reminder:'1h'    },
  { id:'e5',  dir:'praveen', title:'Supplier negotiation',            time:'10:00 AM', location:'Atomic Drugstore',type:'meeting',     status:'scheduled', date:'2026-06-22', priority:'medium', entity:'Atomic Drugstore',  reminder:'1h'    },
  { id:'e6',  dir:'sajeed',  title:'DHA audit prep',                  time:'11:30 AM', location:'Pine Pharmacy',   type:'appointment', status:'scheduled', date:'2026-06-22', priority:'medium', entity:'Pine Pharmacy',     reminder:'1h'    },
  { id:'e7',  dir:'suhail',  title:'Kalba branch review',             time:'2:00 PM',  location:'Al Jebal Opticals',type:'sitevisit', status:'scheduled', date:'2026-06-22', priority:'medium', entity:'Al Jebal Opticals', reminder:'1h'    },
  { id:'e8',  dir:'ameen',   title:'Staff grievance review — lab team',time:'11:00 AM',location:'APML',            type:'meeting',     status:'scheduled', date:'2026-06-24', priority:'medium', entity:'APML',              reminder:'1h'    },
  { id:'e9',  dir:'ameen',   title:'ISO documentation submission',    time:'End of day',location:'APML',           type:'deadline',    status:'scheduled', date:'2026-06-26', priority:'high',   entity:'APML',              reminder:'amday' },
  { id:'e10', dir:'sajeed',  title:'Pine Pharmacy DHA inspection',    time:'9:00 AM',  location:'Pine Pharmacy',   type:'appointment', status:'scheduled', date:'2026-06-29', priority:'medium', entity:'Pine Pharmacy',     reminder:'1h'    },
  { id:'e11', dir:'junaid',  title:'Herbal Park inventory audit',     time:'2:00 PM',  location:'Herbal Park',     type:'task',        status:'completed', date:'2026-06-14', priority:'medium', entity:'Herbal Park',       reminder:'none'  },
  { id:'e12', dir:'praveen', title:'Supplier visit',                  time:'10:00 AM', location:'Atomic Drugstore',type:'sitevisit',   status:'completed', date:'2026-06-09', priority:'medium', entity:'Atomic Drugstore',  reminder:'none'  },
  { id:'e13', dir:'sajeed',  title:'Branch meeting',                  time:'1:00 PM',  location:'Pine Pharmacy',   type:'meeting',     status:'completed', date:'2026-06-09', priority:'medium', entity:'Pine Pharmacy',     reminder:'none'  },
  { id:'e14', dir:'suhail',  title:'Optician licence renewal',        time:'10:00 AM', location:'Al Jebal Opticals',type:'appointment',status:'scheduled', date:'2026-06-30', priority:'high',   entity:'Al Jebal Opticals', reminder:'amday' },
  { id:'e15', dir:'praveen', title:'New product formulary review',    time:'3:00 PM',  location:'Atomic Drugstore',type:'task',        status:'scheduled', date:'2026-06-25', priority:'medium', entity:'Atomic Drugstore',  reminder:'1h'    },
]
