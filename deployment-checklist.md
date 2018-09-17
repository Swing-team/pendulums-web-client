## Web app
* Update change log
* Update the version in package.json
* Set the correct API, Socket, Image endpoint and httpOptions attributes in environment.prod.ts
* Make sure if any data migrations are written, work as expected
* Build and test the app locally with npm run build
* Commit and push version tag
* Pull app on server and do `npm install` if needed and then `npm run build`

## Desktop app
* Do every steps from the web app building instruction, instead of the last part (`npm run build`)
* Update the version in electon-app/package.json
* Build desktop app for your platform using `npm run electron:build` or build for other platforms using their corresponding script:


    | Platform | Script |
    | ------------- |:-------------:|
    | Linux | `npm run electron:build:linux` |
    | Mac | `npm run electron:build:mac` |
    | Windows | `npm run electron:build:win` |

* The built desktop app will be placed in `electron-app/dist/` directory

## Mobile app
* Do every steps from the web app building instruction, instead of the last part (`npm run build`)
* Update the version and android-versionCode in mobile-app/package.json and mobile-app/config.xml
* Build android app using `npm run cordova:build:android`
