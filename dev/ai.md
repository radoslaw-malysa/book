## db
Propose a database structure (MySQL) for an appointment booking system for a service salon: hairdressing, beauty salon, etc. The salon employs several employees, and each employee can perform different services. I'd like the system to be relatively universal and usable across multiple industries.

## app structure
You are a professional React / Typescript developer.
You are building Administrator Dashboard for this Appointment booking system. 
Give me structure and key building blocks for frontend React + React Router Application that working with external php rest API and offers the following features:
- User authentication
- Authenticated user can see list of appointments
- Authenticated user can edit appointments
- Authenticated user can add appointment
- Authenticated user can add Services
- Authenticated user can add Employees

Dont generate any code, just givem e the key building block and structure.

https://www.youtube.com/watch?v=ZxGEJMSrmdE

https://www.shadcn.io/blocks/calendar-weekly-planner

moonlight_88888

## date
function parseYmd(str) {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-based
}

const date = parseYmd("2023-10-05"); // local midnight

year, month, day are numbers.
month - 1 because JavaScript months are 0–11.

ex:
new Date("2023-10-05");                    // UTC
new Date(2023, 9, 5);                      // local (month 9 = October)
new Date(... "2023-10-05".split("-").map(Number).map((v,i) => i===1 ? v-1 : v));


1. Local date (recommended in most cases)

function toYmd(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-based
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const str = toYmd(new Date()); // e.g. "2026-09-10"

2. UTC date

function toYmdUTC(date) {
  return date.toISOString().slice(0, 10);
}

const str = toYmdUTC(new Date()); // e.g. "2026-09-10"

One-liners

// Local
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`

// UTC
d.toISOString().slice(0, 10)