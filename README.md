# Google Keep API Library for Google Apps Script

This library allows you to interact with the Google Keep API directly from Google Apps Script.

## Setup

1.  **Enable Google Keep API**:
    -   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    -   Select your project.
    -   Enable the "Google Keep API".

2.  **Add Scopes**:
    -   Open your Apps Script project.
    -   Go to **Project Settings** > **Show "appsscript.json" manifest file in editor**.
    -   Add the following scopes to `appsscript.json`:
        ```json
        "oauthScopes": [
          "https://www.googleapis.com/auth/keep",
          "https://www.googleapis.com/auth/script.external_request"
        ]
        ```
        *(Note: `script.external_request` is needed for `UrlFetchApp`)*

3.  **Install Library**:
    -   Copy the content of `Keep.js` into a new script file in your project (e.g., `Keep.gs`).
    -   *Alternatively, if this were published as a library, you would add it by Script ID.*

## Usage

### Initialize Service

```javascript
var service = Keep.newService();
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
