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
  console.log('tray-user-ready', message);
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
  initialSelect();
  console.log('hi', message)
});

ipcRenderer.on('tray-currentActivity-ready', (event, message) => {
  currentActivityCopy = message;
  if(message.startedAt) {
    started = true;
  } else {
    started = false;
  }
  initialSelectedProject();
  initialActivityNameInput();
  initialActivityLabel();
  toggleStopStartView();
});

function init() {
  setInterval(timer, 1000);
}

function initialActivityLabel() {
  if( projects[selectedProjectIndex]) {
    ActivityNameLabel = (currentActivityCopy.name ? currentActivityCopy.name : 'Untitled activity' )+ ' - ' + projects[selectedProjectIndex].name;
    u('#activityNameLabel').html(ActivityNameLabel)
  }
}

function initialActivityNameInput() {
  taskName = currentActivityCopy.name;
  document.getElementById('activityNameElm').value = taskName;
}

function initialSelect() {
  u('#select').empty();
  var index = -1;
  var cb = function(project) {
    index++;
    return "<option value=" + index + ">" + project.name + "</option>"
  };
  u('#select').append(cb, projects);
}

function initialSelectedProject() {
  if (currentActivityCopy.startedAt) {
    for (var i = 0; i < projects.length; i++) {
      if(projects[i].id === currentActivityCopy.project) {
        selectedProjectIndex = i;
      }
    }
  }
}

function selectProject() {
  selectedProjectIndex = document.getElementById("select").value;
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
    ipcRenderer.send('tray-start-or-stop', null);
  }
}

function nameActivity() {
  taskName = document.getElementById("activityNameElm").value;
  console.log('input value:', taskName);
  ipcRenderer.send('tray-rename-activity',taskName);
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
