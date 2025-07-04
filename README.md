# Castor plugin

Plugin for Castor using rest-API for Castor. Requires Origo 2.1.1 or later and Castor API. The plugin must be used with the plugin for OpenID connect for authorization.
With this plugin a user can send selected real estates in Origo to Castor for further handling. Selections made in Castor can be sent and viewed as a layer in Origo. 

#### Example usage of Castor plugin

**index.html:**
```html
<!--Add in header-->
  <link href="plugins/castor.css" rel="stylesheet">

<!--Add in body-->
  <script src="plugins/castor.min.js"></script>

    <script type="text/javascript">
    	....
      //Init origo
      var origo = Origo('index.json');
      var oidcComponent = Oidc.OidcComponent(client);
        origo.on('load', function (viewer) {
         //Init castor-plugin
          var castorPlugin = Castor({
            oauth2: client,
            exportLayer: 'layer_name',
            exportGroupLayer: 'group_name',
            exportAttributes = ['attribut 1', 'attribut 2', 'attribut 3'],
            realestatePropertyName: 'uuid',
            filterPropertyName: 'attribute 3',
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
            castorNoSelection: 'Ingen fastighet vald',
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
      ....
    </script>
```
## Settings
### Plugin component settings (in html file)
Option | Type | Description
---|---|---
`oauth2` | object | Set to `client` provided in oidc-plugin init callback - Required
`exportLayer` | string | Origo layer used for exporting data to Castor. A layer with attributes for uuid or fnr to match with Castors API is required. - Required
`exportGroupLayer` | string | Group layer containing exportLayer. Only if the export layer belongs to a origo group layer. - Optional
`exportAttributes` | array | Attribute in exportLayer to match with Castors API properties ['key', 'name', 'uuid']. Empty string if omitted. - Required
`importLayerPadding` | array | Padding for added layer extent. Defaults to 200. - Optional
`realestatePropertyName` | string | Property name in Castor API used to match with filterPropertyName from import layer. - Required
`filterPropertyName` | string | Attribute name in import layer to match with realestatePropertyName from Castor, for example 'uuid'. - Required
`mainIcon` | string | Icon showed in left menu, expands import/export features when clicked.
`importIcon` | string | Icon for import from Castor.
`exportIcon` | string | Icon for export to Castor.
`castorImportGroupOptions` | object | Origo group options, this group is created on first import, if not defined in json. - Required
`castorImportLayerOptions` | object | Origo layer options, layer name is suffixed with a number increased by 1 `_${castorLayerNumber}` for every import. - Required
`castorEndpoint` | string | Url to Castor api endpoint. - Required
`castorNoSelection` | string | Message showed in toaster if there is no selection. - Required
`castorImportSuccessMessage` | string | Message showed in toaster on successful import. - Required
`castorImportFailMessage` | string | Message showed in toaster on failed import. - Required
`castorImportNotFoundMessage` | string | Message showed in toaster when import does not exist in Castor. - Required
`castorExportSuccessMessage` | string | Message showed in toaster on successful export. - Required
`castorExportFailMessage` | string | Message showed in toaster on failed export. - Required
`castorExportNotFoundMessage` | string | Message showed in toaster when export does not exist in Castor. - Required
`castorUnauthorizedMessage` | string | Message showed in toaster when access token for currently logged in user is not authprized. - Required

## Example of Castor API properties
  realestate: 
    {
      key: "fnr"
      name: "fastighet"
      uuid: "uuid"
    }
