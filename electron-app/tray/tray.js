const { remote } = require('electron');
const { Menu } = remote;
const ipcRenderer = require('electron').ipcRenderer;

var projects = [];
var user = {};
var currentActivityCopy = {};
var selectedProjectIndex = 0;
var ActivityNameLabel = '';
var taskName = '';
var timeDuration = 0;
var started = false;

// top menu
let menu = new Menu();
const trayMenuTemplate = [
  {
    label: 'Open App',
    click: function () {
      openApp();
    }
  },

  {
    label: 'Open web',
    click: function () {
      ipcRenderer.send('tray-open-website');
    }
  },

  {
    label: 'Quit',
    click: function () {
      ipcRenderer.send('tray-close-app');
    }
  }
];
menu = Menu.buildFromTemplate(trayMenuTemplate);

document.addEventListener('DOMContentLoaded', function() {
  init();
}, false);

ipcRenderer.on('tray-user-ready', (event, message) => {
  user = message;
  if (user.id) {
    u('#tray').removeClass('ps-hide-item');
    u('#logInNeeded').addClass('ps-hide-item');
  } else {
    u('#logInNeeded').removeClass('ps-hide-item');
    u('#tray').addClass('ps-hide-item');
  }
});

ipcRenderer.on('tray-projects-ready', (event, message) => {
  projects = message;
});

ipcRenderer.on('tray-selected-project-ready', (event, message) => {
  initialSelectedProjectIndex(message);
});

ipcRenderer.on('tray-currentActivity-ready', (event, message) => {
  currentActivityCopy = message;
  if(message.startedAt) {
    started = true;
  } else {
    started = false;
  }
  initialActivityNameInput();
  initialActivityLabel();
  toggleStopStartView();
});

function init() {
  setInterval(timer, 1000);
}

function initialActivityLabel() {
  if( projects[selectedProjectIndex]) {
    ActivityNameLabel = (currentActivityCopy.name ? currentActivityCopy.name : 'Untitled Activity' )+ ' - ' + projects[selectedProjectIndex].name;
    u('#activityNameLabel').html(ActivityNameLabel)
  }
}

function initialActivityNameInput() {
  taskName = currentActivityCopy.name;
  document.getElementById('activityNameElm').value = taskName;
}

function initialSelectedProjectIndex(selectedProjectId) {
  for (var i = 0; i < projects.length; i++) {
    if(projects[i].id === selectedProjectId) {
      selectedProjectIndex = i;
    }
  }
  initialProjects();
}

function initialProjects() {
  let tempItem = projects[selectedProjectIndex];
  projects.splice(selectedProjectIndex, 1);
  projects.unshift(tempItem);
  initialSelect();
}

function initialSelect() {
  u('#select').empty();
  var index = -1;
  var cb = function(project) {
    if(project) {
      index++;
      return "<option value=" + index + ">" + project.name + "</option>"
    }
  };
  u('#select').append(cb, projects);

}

function selectProject() {
  selectedProjectIndex = document.getElementById("select").value;
  ipcRenderer.send('tray-project-selected', projects[selectedProjectIndex].id);
}

function openTopMenu() {
  menu.popup(remote.getCurrentWindow())
}

function toggleStopStartView() {
  if (started) {
    u('i#stopButton').removeClass("ps-hide-item");
    u('i#playButton').addClass("ps-hide-item");

    u('#selectContainer').addClass("ps-hide-item");
    u('#timeSpan').addClass("ps-show-time");

    u('#inputContainer').removeClass("ps-hide-item");

  } else {
    u('i#stopButton').addClass("ps-hide-item");
    u('i#playButton').removeClass("ps-hide-item");

    u('#selectContainer').removeClass("ps-hide-item");
    u('#timeSpan').removeClass("ps-show-time");

    u('#inputContainer').addClass("ps-hide-item");
  }
}

function toggleStopStartFunction() {
  // just for test
  // u('#loading').addClass("is-loading");
  // setTimeout(function () {
  //   u('#loading').removeClass("is-loading");
  // }, 1500);
  // end of test

  currentActivityCopy = {
    name: projects[selectedProjectIndex].recentActivityName ? projects[selectedProjectIndex].recentActivityName: 'Untitled Activity',
    project: projects[selectedProjectIndex].id,
    startedAt: new Date().getTime().toString()
  };
  if (!started) {
    ipcRenderer.send('tray-start-or-stop',
      {
        activity: currentActivityCopy,
        project : projects[selectedProjectIndex],
      });
  } else {
    ipcRenderer.send('tray-start-or-stop',
      {
        activity: null,
        project : projects[selectedProjectIndex],
      });
  }
}

function nameActivity() {
  taskName = document.getElementById("activityNameElm").value;
  console.log('input value:', taskName);
  ipcRenderer.send('tray-rename-activity',
    {
      taskName: taskName,
      project : projects[selectedProjectIndex],
    });
}

function timer() {
  if (currentActivityCopy.startedAt) {
    let startedAt = Number(currentActivityCopy.startedAt);
    let now = Date.now();
    let duration = now - startedAt;
    timeDuration = getTime(duration);
    u('#timeValue').html(timeDuration);
  } else {
    timeDuration = '0';
  }
}

function  getTime(duration) {
  let result = '';
  let x = duration / 1000;
  const seconds = Math.floor(x % 60);
  // minutes
  x /= 60;
  const minutes = Math.floor(x % 60);
  // hours
  x /= 60;
  const hours = Math.floor(x);

  let tempMinutes = '' ;
  let tempSeconds = '' ;
  let tempHours = '' ;
  if (minutes < 10) {
    tempMinutes = '0' + minutes;
  } else {
    tempMinutes = '' + minutes;
  }
  if (seconds < 10) {
    tempSeconds = '0' + seconds;
  } else {
    tempSeconds = '' + seconds;
  }
  if (hours < 10) {
    tempHours = '0' + hours;
  } else {
    tempHours = '' + hours;
  }

  result = tempHours + ':' + tempMinutes + ':' + tempSeconds;



  if (minutes === 0 && hours === 0) {
    result = seconds + ' sec';
  }
  return result;
}

function  openApp() {
  ipcRenderer.send('tray-open-app');
}
