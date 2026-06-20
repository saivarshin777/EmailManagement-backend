# MailNova Pro API

Base URL: `http://localhost:5000/api`

## Authentication

- `POST /auth/register` creates a user.
- `POST /auth/login` verifies email/password and sends an OTP.
- `POST /auth/verify-otp` returns a JWT token.

JWT payload includes `id`, `email`, `name`, and `role`.

Roles:

- `Admin`: full access.
- `Manager`: campaign, contacts, templates, analytics, and automation access.
- `Viewer`: read-only reporting access.

## Campaigns

- `GET /campaigns` lists campaigns.
- `POST /campaigns` creates a draft or sends a campaign.

`POST /campaigns` requires JWT, `Admin` or `Manager`, validation, and campaign rate limiting.

## Contacts

- `GET /contacts` lists contacts.
- `POST /contacts` creates a contact.
- `GET /contacts/lists` lists contact folders.
- `POST /contacts/lists` creates a contact folder.
- `POST /contacts/lists/:listId/contacts` adds contacts to a folder.
- `DELETE /contacts/lists/:listId/contacts` removes contacts from a folder.

Contact writes require JWT and `Admin` or `Manager`.

## SMS

- `POST /contacts/:id/sms` sends SMS to one contact.
- `POST /contacts/sms` sends SMS to filtered contacts.

SMS sends are role-gated and rate-limited.

## Templates

- `GET /templates` lists templates.
- `POST /templates` creates templates.
- `PUT /templates/:id` updates templates.
- `DELETE /templates/:id` deletes templates.

## Analytics And Dashboard

- `GET /dashboard` returns executive dashboard data.
- `GET /dashboard/analytics` returns analytics data.
- `GET /notifications` returns notifications.
- `PATCH /notifications/:id/read` marks one notification read.
- `PATCH /notifications/read-all` marks all notifications read.

## Activity Logs

- `GET /activity` returns the latest 100 activity logs.

Requires JWT and `Admin` or `Manager`.

## Production Notes

- Set a long random `JWT_SECRET`.
- Use SendGrid, Mailgun, Amazon SES, or another transactional provider instead of Gmail for bulk production sending.
- `EMAIL_QUEUE_PROVIDER=inline` works locally. Replace the inline adapter in `services/emailQueueService.js` with BullMQ/Redis for large-volume production sending.
