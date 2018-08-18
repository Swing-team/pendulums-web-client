const { remote } = require('electron');
const { Menu } = remote;
const ipc = require('electron').ipcRenderer;

var projects = [{name: 'hi', id: 0},{name: 'mahsa', id: 1},{name: 'jonn', id: 2}];
var currentActivityCopy = {name: 'kar daram', id: 0, startedAt: '1533123280273'};
var selectedProjectIndex = 0;
var ActivityNameLabel = '';
var taskName = '';
var timeDuration = 0;
var toggleStopStartBoolean = false;

// top menu
let menu = new Menu();
const trayMenuTemplate = [
  {
    label: 'Open App',
    id: 'color-scale',
    enabled: false,
    click: function () {
      console.log('Clicked on settings');
      updateTrayMenu()
    }
  },

  {
    label: 'Open web',
    click: function () {
      updateTrayMenu();
      console.log('Clicked on settings')
    }
  },

  {
    label: 'Quit',
    click: function () {
      console.log('Clicked on Help')
    }
  }
];
menu = Menu.buildFromTemplate(trayMenuTemplate);

document.addEventListener('DOMContentLoaded', function() {
  init();
}, false);

function init() {
  setInterval(timer, 1000);
  initialSelect();
  initialActivityLabel();
  initialActivityNameInput();
}

function initialActivityLabel() {
  ActivityNameLabel = currentActivityCopy.name + ' - ' + (projects[selectedProjectIndex].name ? projects[selectedProjectIndex].name : '');
  u('#activityNameLabel').html(ActivityNameLabel)
}

function initialActivityNameInput() {
  taskName = currentActivityCopy.name;
  document.getElementById('activityNameElm').value = taskName;
}

function initialSelect() {
  var index = -1;
  var cb = function(project) {
    index++;
    return "<option value=" + index + ">" + project.name + "</option>"
  };
  u('#select').append(cb, projects);
}

function selectProject() {
  selectedProjectIndex = document.getElementById("select").value;
  console.log('selected value:', selectedProjectIndex)
}

function openTopMenu() {
  menu.popup(remote.getCurrentWindow())
}

function toggleStopStart() {
  toggleStopStartBoolean = !toggleStopStartBoolean;
  console.log('started', toggleStopStartBoolean);
  ipc.send('playOrStop', null);
  if (toggleStopStartBoolean) {
    // just for test
    u('#loading').addClass("is-loading");
    setTimeout(function () {
      u('#loading').removeClass("is-loading");
    }, 1500);
    // end of test

    u('i#stopButton').removeClass("ps-hide-item");
    u('i#playButton').addClass("ps-hide-item");

    u('#selectContainer').addClass("ps-hide-item");
    u('#timeSpan').addClass("ps-show-time");

    u('#inputContainer').removeClass("ps-hide-item");
  } else {
    // just for test
    u('#loading').addClass("is-loading");
    setTimeout(function () {
      u('#loading').removeClass("is-loading");
    }, 1500);
    // end of test

    u('i#stopButton').addClass("ps-hide-item");
    u('i#playButton').removeClass("ps-hide-item");

    u('#selectContainer').removeClass("ps-hide-item");
    u('#timeSpan').removeClass("ps-show-time");

    u('#inputContainer').addClass("ps-hide-item");
  }
}

function nameActivity() {
  selectedProjectIndex = document.getElementById("activityNameElm").value;
  console.log('input value:', selectedProjectIndex)
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
