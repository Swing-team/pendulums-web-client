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
var projTest = {
    "teamMembers": [
      {
        "id": "58c029c748f21b100025d15d",
        "email": "test@test.com",
        "name": "Mr Pendulum",
        "profileImage": "seed/member-profile.png",
        "currentActivity": null
      }
    ],
    "admins": [],
    "activities": [
      {
        "createdAt": 1534663972963,
        "updatedAt": 1534663973152,
        "id": "5b791d2462c48400255cfa8d",
        "name": "untitled activity",
        "startedAt": "1534659662341",
        "stoppedAt": "1534659675444",
        "project": "5b5edcde733088001edd8b41",
        "user": "58c029c748f21b100025d15d"
      },
      {
        "createdAt": 1534663972956,
        "updatedAt": 1534663973162,
        "id": "5b791d2462c48400255cfa8c",
        "name": "untitled activity",
        "startedAt": "1534659596958",
        "stoppedAt": "1534659602026",
        "project": "5b5edcde733088001edd8b41",
        "user": "58c029c748f21b100025d15d"
      },
      {
        "createdAt": 1534663972943,
        "updatedAt": 1534663973149,
        "id": "5b791d2462c48400255cfa89",
        "name": "untitled activity",
        "startedAt": "1534659146501",
        "stoppedAt": "1534659366764",
        "project": "5b5edcde733088001edd8b41",
        "user": "58c029c748f21b100025d15d"
      },
      {
        "createdAt": 1534663972954,
        "updatedAt": 1534663973159,
        "id": "5b791d2462c48400255cfa8b",
        "name": "untitled activity",
        "startedAt": "1534659021517",
        "stoppedAt": "1534659027533",
        "project": "5b5edcde733088001edd8b41",
        "user": "58c029c748f21b100025d15d"
      },
      {
        "createdAt": 1534663972966,
        "updatedAt": 1534663973145,
        "id": "5b791d2462c48400255cfa8e",
        "name": "untitled activity",
        "startedAt": "1534658758348",
        "stoppedAt": "1534658772180",
        "project": "5b5edcde733088001edd8b41",
        "user": "58c029c748f21b100025d15d"
      }
    ],
    "createdAt": 1532943582884,
    "updatedAt": 1533028787191,
    "id": "5b5edcde733088001edd8b41",
    "name": "cv",
    "image": "",
    "colorPalette": 1,
    "invitedUsers": [],
    "owner": {
      "id": "58c029c748f21b100025d15d",
      "email": "test@test.com",
      "name": "Mr Pendulum",
      "profileImage": "seed/member-profile.png",
      "currentActivity": null
    },
    "recentActivityName": "untitled activity"
  };

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

ipc.on('projects_ready', (event, message) => {

});

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
  if (toggleStopStartBoolean) {
    // just for test
    u('#loading').addClass("is-loading");
    setTimeout(function () {
      u('#loading').removeClass("is-loading");
    }, 1500);
    // end of test

    // ui logic
    u('i#stopButton').removeClass("ps-hide-item");
    u('i#playButton').addClass("ps-hide-item");

    u('#selectContainer').addClass("ps-hide-item");
    u('#timeSpan').addClass("ps-show-time");

    u('#inputContainer').removeClass("ps-hide-item");

    // data flow logic
    ipc.send('startOrStop',
      {
        activity: {name: "khodam", project: "5b5edcde733088001edd8b41", startedAt: "1534659146501"},
        project : this.projTest
      });

  } else {
    // just for test
    u('#loading').addClass("is-loading");
    setTimeout(function () {
      u('#loading').removeClass("is-loading");
    }, 1500);
    // end of test

    // ui logic
    u('i#stopButton').addClass("ps-hide-item");
    u('i#playButton').removeClass("ps-hide-item");

    u('#selectContainer').removeClass("ps-hide-item");
    u('#timeSpan').removeClass("ps-show-time");

    u('#inputContainer').addClass("ps-hide-item");

    // data flow logic
    ipc.send('startOrStop', null);
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
