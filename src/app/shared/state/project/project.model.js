"use strict";
exports.__esModule = true;
var Project = /** @class */ (function () {
    function Project() {
        this.id = null;
        this.name = null;
        this.image = null;
        this.invitedUsers = [];
        this.activities = [];
        this.recentActivityName = null;
        // [white == 0, salmon == 1, blue == 2, black == 3, yellow == 4, pink == 5, red == 6, green == 7]
        this.colorPalette = 0;
    }
    return Project;
}());
exports.Project = Project;
