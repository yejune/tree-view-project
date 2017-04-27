'use babel';

import TreeViewProjectView from './tree-view-project-view';
import {
  CompositeDisposable
} from 'atom';
import {
  requirePackages
} from 'atom-utils'

export default {

  treeViewProjectView: null,
  subscriptions: null,

  activate(state) {
    console.log(state);
    requirePackages('tree-view').then((function(_this) {
      return function(arg) {

        var treeView;
        treeView = arg[0];


        _this.treeViewProjectView = new TreeViewProjectView(treeView.treeView, state.treeViewProjectViewState);

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        _this.subscriptions = new CompositeDisposable();
        //console.log(arg[0]);
        // Register command that toggles this view
        _this.subscriptions.add(atom.commands.add('atom-workspace', {
          'tree-view-project:toggle': () => _this.toggle(),
          'tree-view-project:addProject': () => _this.addProject(),
          'tree-view-project:deleteProject': () => _this.deleteProject(),
          'tree-view-project:refreshProject': () => _this.refreshProject(),
          'tree-view-project:editProjects': () => _this.editProjects()
        }));
      };
    })(this));


  },

  deactivate() {
    this.subscriptions.dispose();
    this.treeViewProjectView.destroy();
  },

  serialize() {
    return {
      //reeViewProjectViewState: this.treeViewProjectView.serialize()
    };
  },

  toggle() {
    console.log('TreeViewProject was toggled!');
    return (
      this.treeViewProjectView.isVisible() ?
      this.treeViewProjectView.hide() :
      this.treeViewProjectView.show()
    );
  },

  addProject() {
    return (
      this.treeViewProjectView.add()
    );
  },

  deleteProject() {
    return (
      this.treeViewProjectView.delete()
    );
  },
  refreshProject() {
    return (
      this.treeViewProjectView.refresh()
    );
  },
  editProjects() {
    return (
      this.treeViewProjectView.edit()
    );
  }
};