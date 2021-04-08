import Origo from 'Origo';
import CastorApi from './castorApi';

const Castor = function Castor(options = {}) {
  const {
    oauth2,
    exportLayerGroup,
    castorImportGroupOptions,
    castorImportLayerOptions,
    filterPropertyName,
    mainIcon = '#fa-pencil',
    importIcon = '#fa-share',
    exportIcon = '#fa-reply'
  } = options;

  let viewer;
  let target;
  let isActive;

  let castorButton;
  let importButton;
  let exportButton;
  let castorButtonEl;
  let importButtonEl;
  let exportButtonEl;

  let castorLayerNumber = 1;
  let legendGroupAdded = false;

  if (!oauth2 || !exportLayerGroup || !castorImportGroupOptions || !castorImportLayerOptions || !filterPropertyName)
    return undefined;

  //Plugin functionality

  function importFromCastor() {
    CastorApi.import(oauth2)
      .then(data => {
        if (!legendGroupAdded && castorImportGroupOptions && castorImportGroupOptions.name) {
          viewer.addGroup(castorImportGroupOptions);
          legendGroupAdded = true;
        }
        const ids = data.selectionobjects.map(s => "'" + s.realestate.uuid + "'");
        const filter = `${filterPropertyName} in (${ids.join(',')})`;
        viewer.addLayer({
          ...castorImportLayerOptions,
          name: castorImportLayerOptions.name + `__castor_${castorLayerNumber}`,
          title:
            castorLayerNumber > 1
              ? castorImportLayerOptions.title + ` ${castorLayerNumber}`
              : castorImportLayerOptions.title,
          filter
        });
        castorLayerNumber++;
      })
      .catch(console.error);
  }

  function exportToCastor() {
    const selectionManager = viewer.getSelectionManager();
    const items = selectionManager.getSelectedItemsForASelectionGroup(exportLayerGroup);
    const castorData = {
      destination: 'Castor',
      name: 'Urval från kartan med lite fastigheter',
      selectionobjects: items.map(x => ({
        addresses: [],
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
          toggleActive();
        },
        icon: mainIcon,
        tooltipText: 'Castor',
        tooltipPlacement: 'east'
      });
      importButton = Origo.ui.Button({
        cls: 'padding-small icon-smaller round light box-shadow hidden',
        icon: importIcon,
        tooltipText: 'Hämta urval från Castor',
        tooltipPlacement: 'east',
        click() {
          importFromCastor();
        }
      });

      exportButton = Origo.ui.Button({
        cls: 'padding-small icon-smaller round light box-shadow hidden',
        icon: exportIcon,
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
