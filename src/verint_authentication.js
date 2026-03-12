const crypto = require('crypto-js');
const { URL } = require('url');

class VerintAuthGenerator {
  constructor(apiKeyId, apiKey) {
    this.apiKeyId = apiKeyId;
    this.apiKey = apiKey;
  }

  // Get ISO date string
  ISODateString(d) {
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + 
      pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + 
      pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
  }

  // Generate base64url by using cryptojs
  base64url(input) {
    var base64String = crypto.enc.Base64.stringify(input);
    return this.urlConvertBase64(base64String);
  }

  // Convert base64url to base64
  debase64url(str) {
    return (str + '==='.slice((str.length + 3) % 4))
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  }

  // Convert to base 64 url
  urlConvertBase64(input) {
    var output = input.replace(/=+$/, '');
    output = output.replace(/\+/g, '-');
    output = output.replace(/\//g, '_');
    return output;
  }

  // Replace variables in string (for Insomnia environment variables)
  replaceVars(string, environment = {}, globals = {}) {
    return string.toString().replace(/{{.+?}}/g, (match) => {
      var varName = match.substr(2, match.length - 4);
      var varValue = environment[varName] || globals[varName];
      return varValue ? this.replaceVars(varValue, environment, globals) : match; // recursive!
    });
  }

  // Generate authorization header
  generateAuthHeader(request, environment = {}, globals = {}) {
    // Get 32 bytes random
    var random = crypto.lib.WordArray.random(16);

    // Get path expanding any variables that exist
    var fullPath = this.replaceVars(request.url, environment, globals);
    var urlObj = new URL(fullPath);
    var path = urlObj.pathname + urlObj.search;

    // Generate canonicalizedHeader
    var ref = request.headers || {};
    var canonicalizedHeader = "";

    for (var key in ref) {
      // Only headers with "verint-" prefix can be used
      if (key.substring(0, 7).toLowerCase() != "verint-") continue;

      canonicalizedHeader += (key + ":");
      var value = ref[key];
      canonicalizedHeader += value;
      canonicalizedHeader += "\n";
    }

    // Make canonicalizedHeader it lower case
    canonicalizedHeader = canonicalizedHeader.toLowerCase();

    // Get String to sign
    var salt = this.base64url(random);
    var method = request.method;
    var issuedAt = this.ISODateString(new Date());

    var stringToSign = salt + "\n" + method + "\n" + path + "\n" + issuedAt +
      "\n" + canonicalizedHeader + "\n";

    var hash = crypto.HmacSHA256(stringToSign, 
      crypto.enc.Base64.parse(this.debase64url(this.apiKey)));

    // Get an signature
    var signature = crypto.enc.Base64.stringify(hash);

    // String prefix
    var verintAuthId = "Vrnt-1-HMAC-SHA256";

    // Generate Authorization Header Value
    var authHeaderValue = verintAuthId + " " + "salt=" + salt + "," + "iat=" + 
      issuedAt + "," + "kid=" + this.apiKeyId + "," + "sig=" + 
      this.urlConvertBase64(signature);

    return authHeaderValue;
  }
}

module.exports = VerintAuthGenerator;
