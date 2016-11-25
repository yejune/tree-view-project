'use babel';

import {
  each
} from 'underscore-plus';
import CSON from 'season';
import $ from 'jquery';
import fs from 'fs';

export default class TreeViewProjectView {
  templates = [];

  constructor(treeView, serializedState) {
    this.treeView = treeView;
    fs.exists(this.getPath(), (exists) => {
      //console.log(exists);
      if (exists) {
        this.observeFile();
      } else {
        this.save([]);
        this.observeFile();
      }
    });
    this.initialize();
  }

  save(projects) {
    const store = projects.concat(this.templates);
    try {
      CSON.writeFileSync(this.getPath(), store);
    } catch (e) {
      console.log(e);
    }
  }

  observeFile() {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    try {
      this.fileWatcher = fs.watch(this.getPath(), () => {
        this.refresh(true);
      });
    } catch (error) {
      //console.log(error);
    }
  }

  initialize() {
    //this.treeView.treeView.find('.tree-view-scroller').css('background', this.treeView.treeView.find('.tree-view').css('background'));
    //this.treeView.treeView.prepend(_this.treeView);

    //this.treeView = document.getElementsByClassName('tree-view-resizer tool-panel')[0];
    //
    //

    treeView = document.getElementsByClassName('tree-view-resizer tool-panel')[0];
    if (treeView.getElementsByClassName('tree-view-project')[0]) {
      treeView.removeChild(treeView.getElementsByClassName('tree-view-project')[0]);

    }

    this.message = this.render(this.getProjects());
    this.message.classList.add('tree-view-project');
    this.treeView.treeView.prepend(this.message);


    this.treeView.treeView.find('.tree-view-project > .list-tree.has-collapsable-children .list-nested-item > .list-item').on("click", function() {
      $(this).parent().toggleClass('expanded');
      $(this).parent().toggleClass('collapsed');
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.treeView.remove();
  }

  getElement() {
    return this.treeView;
  }

  isVisible() {
    body = document.getElementsByClassName('tree-view-project')[0];
    return body.classList.contains('show');
  }

  show() {
    this.message.classList.remove('hide');
    this.message.classList.add('show');
    this.message.style.display = 'show';
  }

  hide() {
    this.message.classList.remove('show');
    this.message.classList.add('hide');
    this.message.style.display = 'hide';
  }

  getPath() {
    const filedir = atom.getConfigDirPath();
    const envSettings = atom.config.get('project-manager.environmentSpecificProjects');
    let filename = 'projects.cson';

    if (envSettings) {
      const hostname = os.hostname().split('.').shift().toLowerCase();
      filename = `projects.${hostname}.cson`;
    }

    return `${filedir}/${filename}`;
  }

  getProjects() {
    projects = CSON.readFileSync(this.getPath());
    this.projects = {};
    each(projects, (row) => {
      this.projects[row.title] = row;
    }, this);
    return projects;
  }

  onClick(name) {
    roots = document.getElementsByClassName('tree-view-project');
    elements = roots[0].getElementsByClassName('file list-item selected');
    while (elements.length > 0) {
      elements[0].classList.remove('selected');
    }

    elements = roots[0].getElementsByClassName('file list-item');
    each(elements, (row) => {
      if (row.getElementsByClassName('name icon icon-code')[0].textContent == name) {
        row.classList.add('selected');
      }
    });
    onSelect(this.projects[name]);
  }

  getGroup(obj) {
    group = [];
    each(obj, (row) => {
      group.push(row.group);
    });

    return group.filter(function(x, i, a) {
      return a.indexOf(x) == i;
    });
  }

  edit() {
    atom.workspace.open(this.getPath());
  }

  add() {
    ele = atom.contextMenu.activeElement;

    filepath = ele.getAttribute('data-path');
    name = ele.getAttribute('data-name');
    if (!filepath || !name) {
      return;
    }

    this.projects[name] = {
      'group': 'default',
      'paths': [
        filepath
      ],
      'title': name
    };
    /*
        this.treeView = document.getElementsByClassName('tree-view-resizer tool-panel')[0];

        this.treeView.removeChild(document.getElementsByClassName('tree-view-project')[0]);
        //this.treeView = document.createElement('div');
        //this.treeView.classList.add('treeview-project');
        // Create message element
        this.message = this.render(this.projects);
        this.message.classList.add('tree-view-project');
        this.treeView.appendFirst(this.message);
    */
    projects = [];
    each(this.projects, (row) => {
      projects.push(row);
    });

    this.save(projects);
    atom.notifications.addSuccess("add success");
  }

  refresh(isObserve) {
    //this.treeView = document.getElementsByClassName('tree-view-resizer tool-panel')[0];
    //this.treeView.removeChild(document.getElementsByClassName('tree-view-project')[0]);
    //console.log('refresh');
    this.initialize();
    if (isObserve == true) {} else {
      atom.notifications.addSuccess("refresh success");
    }
  }

  delete() {
    ele = $(atom.contextMenu.activeElement);

    group = ele.closest('.list-nested-item').children('.list-item').children('.name').text();
    name = ele.text();
    /*
        count = ele.closest('.list-tree').children('.file').length;

        if (1 === count) {
          ele.closest('.list-nested-item').remove();
          delete this.projects[name];
        } else {
          ele.closest('.file').remove();
          delete this.projects[name];
        }
    */
    delete this.projects[name];
    projects = [];
    each(this.projects, (row) => {
      projects.push(row);
    });

    this.save(projects);
    atom.notifications.addSuccess("delete success");
  }

  render(obj) {
    group = this.getGroup(obj);

    projects = document.createElement('div');
    projects.classList.add('show');

    ul = document.createElement('ul');
    ul.classList.add('list-tree', 'has-collapsable-children');

    li = document.createElement('li');
    li.classList.add('list-nested-item', 'expanded');

    title = document.createElement('div');
    title.classList.add('list-item');

    tit = document.createElement('span');
    tit.classList.add('name', 'icon', 'icon-gift');
    tit.textContent = 'Projects';

    title.appendChild(tit);
    // projects refresh, config 버튼 감춤
    /*
        btn = document.createElement('button');
        btn.classList.add('icon-project-refresh');
        btn.classList.add('name', 'icon');

        btn2 = document.createElement('button');
        btn2.classList.add('icon-project-edit');
        btn2.classList.add('name', 'icon');

        title.appendChild(btn2);
        title.appendChild(btn);

        btn2.addEventListener("click", function(e) {
          executeCallback('project-manager:edit-projects');
          e.stopPropagation();
        }, false);

        btn.addEventListener("click", function(e) {
          this.refresh();
          e.stopPropagation();
        }.bind(this), false);
    */
    li.appendChild(title);

    group_ul = document.createElement('ul');
    group_ul.classList.add('list-tree', 'has-collapsable-children');
    group_li = {};
    tree = {};

    each(group, (row) => {

      group_li[row] = document.createElement('li');
      group_li[row].classList.add('list-nested-item', 'expanded');

      group_title = document.createElement('div');
      group_title.classList.add('list-item');

      group_tit = document.createElement('span');
      group_tit.classList.add('name', 'icon', 'icon-file-directory');
      group_tit.textContent = row;

      group_title.appendChild(group_tit);

      group_li[row].appendChild(group_title);

      tree[row] = document.createElement('ul');
      tree[row].classList.add('list-tree', 'has-collapsable-children');
    });

    each(obj, (row, index) => {
      project = document.createElement('li');
      project.classList.add('file', 'list-item');

      span = document.createElement('span');
      span.classList.add('name', 'icon', 'icon-code');
      span.textContent = row.title;

      project.appendChild(span);

      project.addEventListener("click", function() {
        this.onClick(row.title);
      }.bind(this), false);

      tree[row.group].appendChild(project);
    }, this);

    each(group, (row) => {
      group_li[row].appendChild(tree[row]);
      group_ul.appendChild(group_li[row]);
    });

    li.appendChild(group_ul);
    ul.appendChild(li);
    projects.appendChild(ul);

    return projects;
  }
}

HTMLElement.prototype.appendFirst = function(childNode) {
  if (this.firstChild) this.insertBefore(childNode, this.firstChild);
  else this.appendChild(childNode);
};

function toggleClass(element, className) {
  if (!element || !className) {
    return;
  }
  var classString = element.className,
    nameIndex = classString.indexOf(className);
  if (nameIndex == -1) {
    classString += (classString.length) ? ' ' + className : className;
  } else {
    classString = classString.replace(' ' + className, '');
    classString = classString.replace(className, '');
  }
  element.className = classString;
}

function onSelect(project) {
  // remove all current directories that do not belong to the
  // selected project.
  atom.project.getDirectories().filter(function(directory) {
    return project.paths.indexOf(directory.path) === -1;
  }).forEach(function(directory) {
    atom.project.removePath(directory.path);
  });

  // next add all remaining project directories
  project.paths.forEach(function(eachPath) {
    if (!atom.project.contains(eachPath)) {
      atom.project.addPath(eachPath);
    }
  });
}

function executeCallback(callback) {
  if (typeof callback === 'string') {
    atom.commands.dispatch(atom.views.getView(atom.workspace), callback);
  }
}