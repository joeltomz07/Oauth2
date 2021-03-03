var clientId = '2796f38b-6762-4ec8-a49e-05ec24528be1';
var clientSecret = 'e72_.Wp0vw~ajti3V-.cWqe93gJQuESx33';
var redirectUri = 'http://localhost:3000/authorize';
var nJwt = require('njwt');

var scopes = [
  'openid',
  'offline_access',
  'https://outlook.office.com/calendars.read'
];

var credentials = {
  clientID: clientId,
  clientSecret: clientSecret,
  site: 'https://login.microsoftonline.com/common',
  authorizationPath: '/oauth2/v2.0/authorize',
  tokenPath: '/oauth2/v2.0/token'
}
var oauth2 = require('simple-oauth2')(credentials)

module.exports = {
  getAuthUrl: function() {
    var returnVal = oauth2.authCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
    });
    console.log('');
    console.log('Generated auth url: ' + returnVal);
    return returnVal;
  },

  getTokenFromCode: function(auth_code, callback, request, response) {
    oauth2.authCode.getToken({
      code: auth_code,
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
      }, function (error, result) {
        if (error) {
          console.log('Access token error: ', error.message);
          callback(request ,response, error, null);
        }
        else {
          var token = oauth2.accessToken.create(result);
          console.log('');
          console.log('Token created1: ', token.token);
          console.log('IDToken created1: ', token.token.id_token);
          callback(request, response, null, token);
          
        }
      });
  },

  getEmailFromIdToken: function(id_token) {
    //console.log(nJwt.verify(id_token,"secret", 'HS512'));
    // JWT is in three parts, separated by a '.'
    var token_parts = id_token.split('.');

    // Token content is in the second part, in urlsafe base64
    var encoded_token = new Buffer(token_parts[1].replace('-', '+').replace('_', '/'), 'base64');

    var decoded_token = encoded_token.toString();

    var jwt = JSON.parse(decoded_token);
    //console.log("start    "+decoded_token+"        end");
    //console.log("start    "+jwt.email+"        end");

    // Email is in the preferred_username field
    return jwt.email;
  },

  getTokenFromRefreshToken: function(refresh_token, callback, request, response) {
    var token = oauth2.accessToken.create({ refresh_token: refresh_token, expires_in: 0});
    token.refresh(function(error, result) {
      if (error) {
        console.log('Refresh token error: ', error.message);
        callback(request, response, error, null);
      }
      else {
        console.log('New token: ', result.token);
        callback(request, response, null, result);
      }
    });
  }
};