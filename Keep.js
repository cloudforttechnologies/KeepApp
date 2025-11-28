/**
 * Google Keep API Library for Google Apps Script
 * 
 * @see https://developers.google.com/keep/api/reference/rest
 */

var Keep = (function () {

  var BASE_URL = 'https://keep.googleapis.com/';

  /**
   * Service class to handle API requests
   * @param {Object} jsonKey Service Account JSON key
   * @param {string} [userEmail] Email to impersonate (for Domain-Wide Delegation)
   */
  var Service = function (jsonKey, userEmail) {
    this.service = this.getOAuthService_(jsonKey, userEmail);
  };

  Service.prototype.getOAuthService_ = function (jsonKey, userEmail) {
    return OAuth2.createService('GoogleKeep')
      .setTokenUrl('https://oauth2.googleapis.com/token')
      .setPrivateKey(jsonKey.private_key)
      .setIssuer(jsonKey.client_email)
      .setSubject(userEmail)
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope('https://www.googleapis.com/auth/keep');
  };

  Service.prototype.reset = function () {
    this.service.reset();
  };

  Service.prototype.fetch = function (endpoint, method, payload, params) {
    if (!this.service.hasAccess()) {
      throw new Error('Google Keep API: Access denied. ' + this.service.getLastError());
    }

    var url = BASE_URL + endpoint;

    if (params) {
      var paramString = Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
      if (paramString) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + paramString;
      }
    }

    var options = {
      method: method || 'get',
      headers: {
        Authorization: 'Bearer ' + this.service.getAccessToken(),
        Accept: 'application/json'
      },
      muteHttpExceptions: true
    };

    if (payload) {
      options.contentType = 'application/json';
      options.payload = JSON.stringify(payload);
    }

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      if (responseBody) {
        return JSON.parse(responseBody);
      }
      return null;
    } else {
      throw new Error('Google Keep API Error (' + responseCode + '): ' + responseBody);
    }
  };

  Service.prototype.fetchMedia = function (endpoint, mimeType) {
    if (!this.service.hasAccess()) {
      throw new Error('Google Keep API: Access denied. ' + this.service.getLastError());
    }

    var url = BASE_URL + endpoint;
    // For media download, we might need to append alt=media if not handled by endpoint construction
    if (url.indexOf('alt=media') === -1) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'alt=media';
    }

    if (mimeType) {
      url += '&mimeType=' + encodeURIComponent(mimeType);
    }

    var options = {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + this.service.getAccessToken()
      },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode >= 200 && responseCode < 300) {
      return response.getBlob();
    } else {
      throw new Error('Google Keep API Error (' + responseCode + '): ' + response.getContentText());
    }
  };

  /**
   * Notes Resource
   */
  var Notes = function (service) {
    this.service = service;
    this.Permissions = new Permissions(service);
  };

  /**
   * Creates a new note.
   * @param {Object} note The note resource to create.
   * @returns {Object} The created note.
   */
  Notes.prototype.create = function (note) {
    return this.service.fetch('v1/notes', 'post', note);
  };

  /**
   * Gets a note.
   * @param {string} name The resource name of the note (e.g., 'notes/123').
   * @returns {Object} The note.
   */
  Notes.prototype.get = function (name) {
    return this.service.fetch('v1/' + name, 'get');
  };

  /**
   * Lists notes.
   * @param {Object} optionalArgs Optional arguments (pageSize, pageToken, filter).
   * @returns {Object} ListNotesResponse
   */
  Notes.prototype.list = function (optionalArgs) {
    return this.service.fetch('v1/notes', 'get', null, optionalArgs);
  };

  /**
   * Deletes a note.
   * @param {string} name The resource name of the note to delete.
   * @returns {Object} Empty response.
   */
  Notes.prototype.delete = function (name) {
    return this.service.fetch('v1/' + name, 'delete');
  };

  /**
   * Permissions Resource (Sub-collection of Notes)
   */
  var Permissions = function (service) {
    this.service = service;
  };

  /**
   * Batch creates permissions on a note.
   * @param {string} parent The parent resource name (e.g., 'notes/123').
   * @param {Array<Object>} permissions The list of permissions to create.
   * @returns {Object} BatchCreatePermissionsResponse
   */
  Permissions.prototype.batchCreate = function (parent, permissions) {
    var requests = permissions.map(function (p) {
      return {
        parent: parent,
        permission: p
      };
    });

    return this.service.fetch('v1/' + parent + '/permissions:batchCreate', 'post', { requests: requests });
  };

  /**
   * Batch deletes permissions on a note.
   * @param {string} parent The parent resource name (e.g., 'notes/123').
   * @param {Array<string>} permissionNames The list of permission resource names to delete.
   * @returns {Object} Empty response.
   */
  Permissions.prototype.batchDelete = function (parent, permissionNames) {
    var names = permissionNames; // Array of strings
    return this.service.fetch('v1/' + parent + '/permissions:batchDelete', 'post', { names: names });
  };


  /**
   * Media Resource
   */
  var Media = function (service) {
    this.service = service;
  };

  /**
   * Downloads an attachment.
   * @param {string} name The resource name of the attachment (e.g., 'notes/1/attachments/2').
   * @param {string} mimeType The MIME type to download.
   * @returns {Blob} The attachment data as a Blob.
   */
  Media.prototype.download = function (name, mimeType) {
    return this.service.fetchMedia('v1/' + name, mimeType);
  };

  // --- Main Library Object ---

  return {
    newService: function (jsonKey, userEmail) {
      return new Service(jsonKey, userEmail);
    },
    /**
     * @param {Service} service
     */
    Notes: function (service) {
      return new Notes(service);
    },
    /**
     * @param {Service} service
     */
    Media: function (service) {
      return new Media(service);
    }
  };

})();

/**
 * Creates a new Keep Service.
 * @param {Object} jsonKey Service Account JSON key
 * @param {string} [userEmail] Email to impersonate (for Domain-Wide Delegation)
 * @returns {Service}
 */
function newService(jsonKey, userEmail) {
  return Keep.newService(jsonKey, userEmail);
}

/**
 * Access the Notes resource.
 * @param {Service} service
 * @returns {Notes}
 */
function Notes(service) {
  return Keep.Notes(service);
}

/**
 * Access the Media resource.
 * @param {Service} service
 * @returns {Media}
 */
function Media(service) {
  return Keep.Media(service);
}
