import Origo from 'Origo';
import CastorApi from './castorApi';
import {extend, getCenter} from 'ol/extent';

const Castor = function Castor(options = {}) {
  const {
    oauth2,
    exportLayer,
    exportAttributes = ['1', '2', '3'],
    castorImportGroupOptions,
    castorImportLayerOptions,
    realestatePropertyName,
    filterPropertyName,
    mainIcon = '#fa-pencil',
    importIcon = '',
    exportIcon = '',
    castorEndpoint,
    castorNoSelection,
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
  const max_center_on_added_layer_retries = 10;
  
  let tries = 0;

  if (
    !oauth2 ||
    !exportLayer ||
    !castorImportGroupOptions ||
    !castorImportLayerOptions ||
    !realestatePropertyName ||
    !filterPropertyName ||
    !castorEndpoint
  ) {
    if (!oauth2) console.error('Castor plugin: Missing config oath2');
    if (!exportLayer) console.error('Castor plugin: Missing config exportLayer');
    if (!castorImportGroupOptions) console.error('Castor plugin: Missing config castorImportGroupOptions');
    if (!castorImportLayerOptions) console.error('Castor plugin: Missing config castorImportLayerOptions');
    if (!realestatePropertyName) console.error('Castor plugin: Missing config realestatePropertyName');
    if (!filterPropertyName) console.error('Castor plugin: Missing config filterPropertyName');
    if (!castorEndpoint) console.error('Castor plugin: Missing config castorEndpoint');
    return undefined;
  }

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
        const layerName = castorImportLayerOptions.name + `__castor_${castorLayerNumber}`;
        viewer.addLayer({
          ...castorImportLayerOptions,
          name: layerName,
          title:
            castorLayerNumber > 1
              ? castorImportLayerOptions.title + ` ${castorLayerNumber}`
              : castorImportLayerOptions.title,
          filter,
          strategy: castorImportLayerOptions.strategy === undefined 
                    ? 'all' 
                    : castorImportLayerOptions.strategy,
        });
        castorLayerNumber++;
        createToaster('ok', castorImportSuccessMessage);

        if (castorImportLayerOptions.visible) {
          tries = 0;
          setTimeout(() => { centerOnAddedLayer(viewer, layerName); }, 1000);
        }
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

  function centerOnAddedLayer(viewer, layerName) {
    const addedLayer = viewer.getLayer(layerName);
    const features = addedLayer.getSource().getFeatures();
    let baseExtent;

    if (features && features.length) {
      let baseExtent = features.pop().getGeometry().getExtent();
      features.forEach((feature) => {
        extend(baseExtent, feature.getGeometry().getExtent());
      });

    const view = viewer.getMap().getView();
    const center = getCenter(baseExtent);
    const padding = 10; // Padding around the extent
    const duration = 1000; // Animation duration in milliseconds
    
  // Animate to the center of the extent first
  view.animate({
    center: center,
    duration: duration
  }, () => {
    // After the animation, fit the view to the extent with padding
    view.fit(baseExtent, {
      padding: padding,
      duration: duration
    });
  });
    
    return;
  }

    if (tries < max_center_on_added_layer_retries) {
      tries++;
      console.log(`Castor - center try number ${tries}`);
      setTimeout(() => { centerOnAddedLayer(viewer, layerName); }, 1000);
    }
  }

  function exportToCastor() {
    const selectionManager = viewer.getSelectionManager();
    const items = selectionManager.getSelectedItemsForASelectionGroup(exportLayer);

    // Check if no items are selected
    if (!items || items.length === 0) {
      createToaster('fail', castorNoSelection);
      return;
  }

    const castorData = {
      destination: 'Castor',
      name: 'Selekterade fastigheter från kartan',
      selectionobjects: items.map(x => ({
        addresses: [],
        realestate: {
          key: x.feature.get(exportAttributes[0]).toString(),
          name: x.feature.get(exportAttributes[1]),
          uuid: x.feature.get(exportAttributes[2])
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

  function addSvgIcons() {
    const svgIcons = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <symbol id="file_download" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </symbol>
      <symbol id="publish" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z"/>
    </symbol>
    </svg>
    `;
    const div = document.createElement('div');
    div.innerHTML = svgIcons;
    document.body.insertBefore(div, document.body.childNodes[0]);
  }

  return Origo.ui.Component({
    name: 'castor',
    onInit() {
      addSvgIcons();
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
      if (!target) target = `${viewer.getMain().getMapTools().getId()}`;
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
