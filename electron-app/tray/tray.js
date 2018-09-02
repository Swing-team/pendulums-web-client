const ipcRenderer = require('electron').ipcRenderer;

var taskName = '';
var timeDuration = 0;
var currentActivityCopy = {};

document.addEventListener('DOMContentLoaded', function() {
  init();
}, false);

ipcRenderer.on('tray-currentActivity-ready', (event, message) => {
  currentActivityCopy = message.currentActivity;
  initialActivityNameInput();
  initialActivityLabel();
});

function init() {
  setInterval(timer, 1000);
}

function initialActivityLabel() {
  if(currentActivityCopy.project) {
    activityNameLabel = currentActivityCopy.name ? currentActivityCopy.name : 'Untitled Activity';
    u('#activityNameLabel').html(activityNameLabel)
  }
}

function initialActivityNameInput() {
  taskName = currentActivityCopy.name;
  document.getElementById('activityNameElm').value = taskName;
}

function nameActivity() {
  taskName = document.getElementById("activityNameElm").value;
  ipcRenderer.send('tray-rename-activity',
    {
      taskName: taskName,
      project : currentActivityCopy.project,
    });
}

function timer() {
  if (currentActivityCopy.startedAt) {
    let startedAt = Number(currentActivityCopy.startedAt);
    let now = Date.now();
    let duration = now - startedAt;
    timeDuration = getTime(duration);
    ipcRenderer.send('timer-changed', timeDuration);
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