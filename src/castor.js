import Origo from 'Origo';

const Castor = function astor(options = {}) {
  const { buttonText = 'Default text', content = 'Default content' } = options;

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
    console.log('import')
  }

  function exportFromCastor() {
    console.log('export')
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
          exportFromCastor();
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
