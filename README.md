# Castor plugin

PLEASE NOTE THAT THIS IS A BETA VERSION.

Plugin for Castor using rest-API for Castor. Requires Origo 2.1.1 or later. The plugin must be used with the plugin for OpenID connect for authorization.
With this plugin a user can send selected real estates in Origo to Castor for further handling. Selections made in Castor can be sent and viewed as a layer in Origo. 

#### Example usage of Castor plugin

**index.html:**
```
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
          externalSessionUrl: 'https://xxx',
          updateSessionOnRefresh: true,
          sessionRefreshTimeout: 59,
          tokenEndpoint: '/origoserver/auth/access_token',
          authorizeEndpoint: '/origoserver/auth/authorize'
        },
        client => {
          if (client.getUser().authenticated) {
            var origo = Origo('index.json');
            var oidcComponent = Oidc.OidcComponent(client);
            origo.on('load', function (viewer) {
              //init castor-plugin
			  var castorPlugin = Castor({
                oauth2: client,
                exportLayerGroup: 'xxx',
                filterPropertyName: 'objekt_id',
                mainIcon: 'img/png/castor.png',
                importIcon: '#fa-share',
                exportIcon: '#fa-reply',
                castorImportGroupOptions: {
                  name: 'castor',
                  title: 'Castor import',
                  expanded: false
                    },
                castorImportLayerOptions: {
                  name: 'xxx',
                  title: 'Castor import',
                  group: 'castor',
                  source: 'xxx',
                  style: 'default',
                  geometryName: 'the_geom',
                  type: 'WFS',
                  visible: true,
                  legend: true,
                  removable: true
                },
                castorEndpoint: 'url...'
                  });

              viewer.addComponent(oidcComponent);
              viewer.addComponent(castorPlugin);
              });
            }
            else {
                client.authorize();
              }
            }
          );
    </script>
```

