// src/services/qr-ics.service.js

export const generateQRCodePayload = (eventId, userId, registrationId) => {
  return JSON.stringify({
    eventId,
    userId,
    registrationId,
    timestamp: new Date().toISOString()
  });
};

export const generateICSCalendar = (event) => {
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
  };

  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusHub//EN
BEGIN:VEVENT
UID:${event.id}@campushub.local
DTSTAMP:${formatDate(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
};
