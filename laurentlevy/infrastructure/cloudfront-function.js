// CloudFront Function (viewer-request, runtime cloudfront-js-2.0).
// 1. Hôte canonique : laurent-levy.com -> www.laurent-levy.com
// 2. Racine « / » : redirection vers la langue du navigateur (fr par défaut)
// 3. Anciennes URL WordPress -> nouvelles pages (301)
// 4. Ajout du « / » final et de index.html (S3 en origine privée via OAC)

var CANONICAL_HOST = 'www.laurent-levy.com';

// Anciennes URL (contenus de démo Avada, archives, auteurs…) -> accueil de la langue.
var LEGACY = [
  [/^\/fr\/en\/?$/, '/en/'],
  [/^\/fr\/he\/?$/, '/he/'],
  [/^\/(fr|en|he)\/(author|category|tag|meetup|portfolio-items|feed|comments|wp-json|page)(\/.*)?$/, '/$1/'],
  [/^\/(en|he)\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/, '/$1/'],
  [/^\/fr\/(25-best-horror-books|istanbul-travel-guide|whats-on-your-booklist|20-creativity-tips|bonjour-tout-le-monde)\/?$/, '/fr/'],
  [/^\/(fr|en|he)\/(wp-login\.php|wp-admin|xmlrpc\.php)(\/.*)?$/, '/$1/'],
];

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location }, 'cache-control': { value: 'max-age=86400' } },
  };
}

function preferredLang(headers) {
  var al = headers['accept-language'] ? headers['accept-language'].value.toLowerCase() : '';
  var parts = al.split(',');
  for (var i = 0; i < parts.length; i++) {
    var code = parts[i].trim().slice(0, 2);
    if (code === 'fr' || code === 'en') return code;
    if (code === 'he' || code === 'iw') return 'he';
  }
  return 'fr';
}

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var host = headers.host ? headers.host.value : CANONICAL_HOST;
  var uri = request.uri;

  if (host !== CANONICAL_HOST && host.indexOf('cloudfront.net') === -1) {
    return redirect('https://' + CANONICAL_HOST + uri);
  }

  if (uri === '/' || uri === '/index.html') {
    var lang = preferredLang(headers);
    return {
      statusCode: 302,
      statusDescription: 'Found',
      headers: { location: { value: '/' + lang + '/' }, vary: { value: 'Accept-Language' }, 'cache-control': { value: 'private, max-age=0' } },
    };
  }

  for (var i = 0; i < LEGACY.length; i++) {
    if (LEGACY[i][0].test(uri)) return redirect(uri.replace(LEGACY[i][0], LEGACY[i][1]));
  }

  var last = uri.split('/').pop();
  if (last === '') {
    request.uri = uri + 'index.html';
  } else if (last.indexOf('.') === -1) {
    // /fr/torah -> /fr/torah/
    return redirect(uri + '/');
  }
  return request;
}
