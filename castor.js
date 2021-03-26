import Origo from 'Origo';

const Castor = function astor(options = {}) {
  const {
    buttonText = 'Default text',
    content = 'Default content'
  } = options;

  const icon = '#fa-pencil';
  let castorButton;

  let viewer;
  let target;
  let modal;

  return Origo.ui.Component({
    name: 'castor',
    onInit() {
      castorButton = Origo.ui.Button({
        cls: 'o-castor padding-small icon-smaller round light box-shadow',
        click() {
          modal = Origo.ui.Modal({
            title: buttonText,
            content,
            target: viewer.getId()
          });
          this.addComponent(modal);
        },
        icon,
        tooltipText: 'tooltipText to be shown!!',
        tooltipPlacement: 'east'
      });
    },
    onAdd(evt) {
      viewer = evt.target;
      if (!target) target = `${viewer.getMain().getNavigation().getId()}`;
      this.addComponents([castorButton]);
      this.render();
    },
    render() {
      const htmlString = castorButton.render();
      const el = Origo.ui.dom.html(htmlString);
      document.getElementById(target).appendChild(el);
      this.dispatch('render');
    }
  });
};

export default Castor;
