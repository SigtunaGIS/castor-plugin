import Origo from 'Origo';
import CastorApi from './castorApi';

const Castor = function Castor(options = {}) {
  const {
    oauth2,
    exportLayerGroup,
    castorImportGroupOptions,
    castorImportLayerOptions,
    realestatePropertyName,
    filterPropertyName,
    mainIcon = '#fa-pencil',
    importIcon = '#fa-share',
    exportIcon = '#fa-reply',
    castorEndpoint,
    castorImportSuccessMessage,
    castorImportFailMessage,
    castorImportNotFoundMessage,
    castorExportSuccessMessage,
    castorExportFailMessage,
    castorExportNotFoundMessage,
    castorUnauthorizedMessage
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

  if (
    !oauth2 ||
    !exportLayerGroup ||
    !castorImportGroupOptions ||
    !castorImportLayerOptions ||
    !realestatePropertyName ||
    !filterPropertyName ||
    !castorEndpoint
  )
    return undefined;

  CastorApi.init({ castorEndpoint });

  //Plugin functionality

  function createToaster(status, message) {
    const parentElement = document.getElementById(viewer.getId());
    let msg = message;
    const toaster = document.createElement('div');
    toaster.style.fontSize = '12px';
    // It cannot be appended to infowindow bcuz in mobile tranform:translate is used css, and it causes that position: fixed loses its effect.
    parentElement.appendChild(toaster);
    setTimeout(() => {
      // message must be added here inside timeout otherwise it will be shown 50 ms before it take the effect of the css
      toaster.textContent = msg;
      toaster.classList.add('toaster');
      if (status === 'ok') {
        toaster.classList.add('toaster-successful');
      } else {
        toaster.classList.add('toaster-unsuccessful');
      }
    }, 50);

    setTimeout(() => {
      toaster.parentNode.removeChild(toaster);
    }, 5000);
  }

  function importFromCastor() {
    CastorApi.import(oauth2)
      .then(data => {
        if (!legendGroupAdded && castorImportGroupOptions && castorImportGroupOptions.name) {
          viewer.addGroup(castorImportGroupOptions);
          legendGroupAdded = true;
        }
        const ids = data.selectionobjects.map(s => "'" + s.realestate[realestatePropertyName] + "'");
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
        createToaster('ok', castorImportSuccessMessage);
      })
      .catch(error => {
        switch (error.status) {
          case 401:
            createToaster('fail', castorUnauthorizedMessage);
            break;
          case 404:
            createToaster('fail', castorImportNotFoundMessage);
            break;
          default:
            createToaster('fail', castorImportFailMessage);
            break;
        }
      });
  }

  function exportToCastor() {
    const selectionManager = viewer.getSelectionManager();
    const items = selectionManager.getSelectedItemsForASelectionGroup(exportLayerGroup);
    const castorData = {
      destination: 'Castor',
      name: 'Urval fr??n kartan med lite fastigheter',
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

    CastorApi.export(oauth2, castorData)
      .then(() => {
        createToaster('ok', castorExportSuccessMessage);
      })
      .catch(error => {
        switch (error.status) {
          case 401:
            createToaster('fail', castorUnauthorizedMessage);
            break;
          case 404:
            createToaster('fail', castorExportNotFoundMessage);
            break;
          default:
            createToaster('fail', castorExportFailMessage);
            break;
        }
      });
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
        tooltipText: 'H??mta urval fr??n Castor',
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
