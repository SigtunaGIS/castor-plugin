import Origo from 'Origo';
import CastorApi from './castorApi';

const Castor = function Castor(options = {}) {
  const { oauth2, exportLayerGroup } = options;
  console.log('oauth2', oauth2);

  const icon = '#fa-pencil';

  let viewer;
  let target;
  let isActive;

  let castorButton;
  let importButton;
  let exportButton;
  let castorButtonEl;
  let importButtonEl;
  let exportButtonEl;

  //Plugin functionality

  function importFromCastor() {
    // const filter = 'objekt_id=97c7eb4b-4bc9-42aa-823c-020599d81279';
    const filter = "[objekt_id] IN (\"97c7eb4b-4bc9-42aa-823c-020599d81279\")";
    let url = `http://localhost:9966/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=casto_fastighetsytor_urval&outputFormat=application/json&srsname=EPSG:3011&CQL_FILTER=${encodeURIComponent(filter)}`;
    console.log(url);

    console.log('import');
    CastorApi.import(oauth2).then((data) => {
      console.log('import result', data);
      let layer = new Origo.ol.layer.Vector({source: new Origo.ol.source.Vector({url: url})})
      viewer.addLayer(layer);
      console.log('filtered layer', layer)
    }).catch(console.error);
  }

  function exportToCastor() {
    console.log('export');
    const selectionManager = viewer.getSelectionManager();
    const items = selectionManager.getSelectedItemsForASelectionGroup(exportLayerGroup);
    const castorData = {
      destination: 'Castor',
      name: 'Urval från kartan med lite fastigheter',
      selectionobjects: items.map(x => ({
        addresses: [],
        // "geometry": {
        //     "x": "6569905,678",
        //     "y": "4569905,278"
        // },
        realestate: {
          key: x.feature.get('fnr_fds').toString(),
          name: x.feature.get('fastighet'),
          uuid: x.feature.get('objekt_id')
        }
      })),
      source: 'Partner',
      type: 'type'
    };

    CastorApi.export(oauth2, castorData).then(console.log).catch(console.error);
  }

  // Utils and rendering
  function toggleActive() {
    if (isActive) {
      castorButtonEl.classList.remove('active');
      importButtonEl.classList.add('hidden');
      exportButtonEl.classList.add('hidden');
    } else {
      castorButtonEl.classList.add('active');
      importButtonEl.classList.remove('hidden');
      exportButtonEl.classList.remove('hidden');
    }
    isActive = !isActive;
  }

  function renderCastor() {
    let htmlString = castorButton.render();
    let el = Origo.ui.dom.html(htmlString);
    document.getElementById(target).appendChild(el);
    castorButtonEl = document.getElementById(castorButton.getId());

    htmlString = importButton.render();
    el = Origo.ui.dom.html(htmlString);
    document.getElementById(target).appendChild(el);
    importButtonEl = document.getElementById(importButton.getId());

    htmlString = exportButton.render();
    el = Origo.ui.dom.html(htmlString);
    document.getElementById(target).appendChild(el);
    exportButtonEl = document.getElementById(exportButton.getId());
  }

  return Origo.ui.Component({
    name: 'castor',
    onInit() {
      isActive = false;
      castorButton = Origo.ui.Button({
        cls: 'padding-small icon-smaller round light box-shadow',
        click() {
          //   modal = Origo.ui.Modal({
          //     title: buttonText,
          //     content,
          //     target: viewer.getId()
          //   });
          //   this.addComponent(modal);
          toggleActive();
          console.log('clicked');
        },
        icon,
        tooltipText: 'Castor',
        tooltipPlacement: 'east'
      });
      importButton = Origo.ui.Button({
        cls: 'padding-small icon-smaller round light box-shadow hidden',
        icon: '#fa-share',
        tooltipText: 'Hämta urval från Castor',
        tooltipPlacement: 'east',
        click() {
          importFromCastor();
        }
      });

      exportButton = Origo.ui.Button({
        cls: 'padding-small icon-smaller round light box-shadow hidden',
        icon: '#fa-reply',
        tooltipText: 'Skicka urval till Castor',
        tooltipPlacement: 'east',
        click() {
          exportToCastor();
        }
      });
    },
    onAdd(evt) {
      viewer = evt.target;
      if (!target) target = `${viewer.getMain().getNavigation().getId()}`;
      this.addComponents([castorButton, importButton, exportButton]);
      this.render();
    },
    render() {
      renderCastor();
      this.dispatch('render');
    }
  });
};

export default Castor;
