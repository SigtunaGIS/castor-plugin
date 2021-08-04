# Castor plugin

PLEASE NOTE THAT THIS IS A BETA VERSION.

Plugin for Castor using rest-API for Castor. Requires Origo 2.1.1 or later. The plugin must be used with the plugin for OpenID connect for authorization.
With this plugin a user can send selected real estates in Origo to Castor for further handling. Selections made in Castor can be sent och viewed as a layer in Origo. 

#### Example usage of Castor plugin

**index.html:**
```html
    <head>
    	<meta charset="utf-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    	<meta http-equiv="X-UA-Compatible" content="IE=Edge;chrome=1">
    	<title>Origo exempel</title>
    	<link href="css/style.css" rel="stylesheet">
    	<link href="plugins/castor.css" rel="stylesheet">
    </head>
    <body>
    <div id="app-wrapper">
    </div>
    <script src="js/origo.js"></script>
    <script src="plugins/oidc.min.js"></script>
    <script src="plugins/castor.min.js"></script>

    <script type="text/javascript">
    	//Init origo
      Oidc.createOidcAuth(
        {
          externalSessionUrl: 'url',
          updateSessionOnRefresh: true,
          sessionRefreshTimeout: 59,
          tokenEndpoint: '/origoserver/auth/access_token',
          authorizeEndpoint: '/origoserver/auth/authorize',
          signOutUrl: 'url'
        },
        client => {
          if (client.getUser().authenticated) {
            var origo = Origo('index.json');
            var oidcComponent = Oidc.OidcComponent(client);
            origo.on('load', function (viewer) {
              //Init castor-plugin
              var castorPlugin = Castor({
                oauth2: client,
                exportLayerGroup: 'layer_group',
                realestatePropertyName: 'key',
                filterPropertyName: 'fnr_fds',
                mainIcon: '/plugins/castor-icon.png',
                importIcon: '#fa-share',
                exportIcon: '#fa-reply',
                castorImportGroupOptions: {
                  name: 'castor',
                  title: 'Castor import',
                  expanded: false
                },
                castorImportLayerOptions: {
                  name: 'layer_name',
                  title: 'Castor import',
                  group: 'castor',
                  source: 'origo_source',
                  style: 'default',
                  geometryName: 'the_geom',
                  type: 'WFS',
                  visible: true,
                  legend: true,
                  removable: true
                },
                castorEndpoint: 'url',
                castorImportSuccessMessage: 'Urval hämtat från Castor',
                castorImportFailMessage: 'Okänt fel, kunde inte hämta urval från Castor',
                castorImportNotFoundMessage: 'Inget urval från Castor hittades',
                castorExportSuccessMessage: 'Urval skickat till Castor',
                castorExportFailMessage: 'Okänt fel, kunde inte skicka urval till Castor',
                castorExportNotFoundMessage: 'Hittade ingen användare att skicka urval till',
                castorUnauthorizedMessage: 'Behörighet saknas'
              });
              viewer.addComponent(oidcComponent);
              viewer.addComponent(castorPlugin);
            });
          } else {
            client.authorize();
          }
        }
      );
    </script>
```
## Settings
### Plugin component settings (in html file)
Option | Type | Description
---|---|---
`oauth2` | object | Set to `client` provided in oidc-plugin init callback - Required
`exportLayerGroup` | string | Enable castor export for this Origo layer group - Required
`realestatePropertyName` | string | Property name in Castor import used to match with Origo source - Required
`filterPropertyName` | string | Property name in CQL enabled Origo source to match with Castor import - Required
`mainIcon` | string | Icon showed in left menu, expands import/export features when clicked
`importIcon` | string | Icon for import feature
`exportIcon` | string | Icon for export feature
`castorImportGroupOptions` | object | Origo group options, this group is created on first import - Required
`castorImportLayerOptions` | object | Origo layer options, layer name is suffixed with `__castor_${castorLayerNumber}` - Required
`castorEndpoint` | string | Url to Castor api endpoint - Required
`castorImportSuccessMessage` | string | Message showed in toaster on successful import - Required
`castorImportFailMessage` | string | Message showed in toaster on failed import - Required
`castorImportNotFoundMessage` | string | Message showed in toaster when import does not exist in Castor - Required
`castorExportSuccessMessage` | string | Message showed in toaster on successful export - Required
`castorExportFailMessage` | string | Message showed in toaster on failed export - Required
`castorExportNotFoundMessage` | string | Message showed in toaster when export does not exist in Castor - Required
`castorUnauthorizedMessage` | string | Message showed in toaster when access token for currently logged in user is not authprized - Required
