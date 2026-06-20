# Backend Setup

This backend stores dashboard data, users, contacts, campaigns, notifications, OTPs, and email logs in MongoDB.
It sends login OTP emails, password reset emails, and campaign emails through SMTP. It can also send SMS to contacts through an SMS provider. Campaign and SMS send results are stored in MongoDB.

1. Create `backend/.env` from `backend/.env.example`.
2. Set `MONGO_URI` to your MongoDB connection string.
3. Run the backend:

```bash
npm run backend
```

For local MongoDB:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mailnova_dashboard
JWT_SECRET=change_this_to_a_long_random_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Mail Nova <your_email@gmail.com>
CAMPAIGN_DEFAULT_RECIPIENTS=test1@example.com,test2@example.com
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FAST2SMS_API_KEY=
FAST2SMS_ROUTE=q
```

For MongoDB Atlas:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/mailnova_dashboard
```

When the database is empty, starter campaigns and notifications are inserted automatically.

For Gmail, `EMAIL_PASS` must be a Gmail App Password, not your normal Gmail password.
If recipients are not entered in the campaign form, the backend uses `CAMPAIGN_DEFAULT_RECIPIENTS`.
The same email settings are used for OTP login and password reset emails.

For SMS testing, keep `SMS_PROVIDER=mock`; messages will be printed in the backend terminal and saved in MongoDB.
For real SMS, set either:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sender_number
```

or:

```env
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your_fast2sms_api_key
FAST2SMS_ROUTE=q
```

Contact routes are protected with the login JWT token:

```text
GET    /api/contacts
GET    /api/contacts?search=name
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id
GET    /api/contacts/stats
POST   /api/contacts/:id/sms
POST   /api/contacts/sms
```
