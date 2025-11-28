# Google Keep API Library for Google Apps Script

This library allows you to interact with the Google Keep API directly from Google Apps Script using a Service Account.

## Setup

1.  **Enable Google Keep API**:
    -   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    -   Select your project.
    -   Enable the "Google Keep API".

2.  **Create Service Account**:
    -   Go to **IAM & Admin** > **Service Accounts**.
    -   Create a new Service Account.
    -   Create a JSON key for this service account and download it.
    -   *Note: If you need to access user data (Domain-Wide Delegation), enable it for this service account and grant scopes in the Admin Console.*

3.  **Add OAuth2 Library**:
    -   Open your Apps Script project.
    -   Click **Libraries** > **Add a library**.
    -   Enter Script ID: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`
    -   Select the latest version and click **Add**.

4.  **Install Library**:
    -   Copy the content of `Keep.js` into a new script file in your project (e.g., `Keep.gs`).

## Usage

### Initialize Service

```javascript
// Paste your JSON key content here
var jsonKey = {
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
};

// Initialize service (Service Account)
var service = Keep.newService(jsonKey);

// OR Initialize service with Domain-Wide Delegation (Impersonation)
// var userEmail = 'user@example.com';
// var service = Keep.newService(jsonKey, userEmail);
```

### Notes

#### List Notes
```javascript
var notes = Keep.Notes(service).list({
  pageSize: 10
});
console.log(notes);
```

#### Create a Note
```javascript
var newNote = Keep.Notes(service).create({
  title: "My New Note",
  body: {
    text: {
      text: "This is the content of the note."
    }
  }
});
console.log(newNote);
```

#### Get a Note
```javascript
var note = Keep.Notes(service).get(newNote.name);
console.log(note);
```

#### Delete a Note
```javascript
Keep.Notes(service).delete(newNote.name);
```

### Permissions

#### Add Permission (Share Note)
```javascript
var permissions = [{
  role: 'WRITER',
  email: 'friend@example.com'
}];
Keep.Notes(service).Permissions.batchCreate(newNote.name, permissions);
```

### Media

#### Download Attachment
```javascript
var attachmentName = 'notes/123/attachments/456';
var blob = Keep.Media(service).download(attachmentName, 'image/png');
DriveApp.createFile(blob); // Save to Drive
```
