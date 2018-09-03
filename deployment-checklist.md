## Web app
* Update the version in package.json
* Set the correct API, Socket, Image endpoint and httpOptions attributes in app.config.ts
* Make sure if any data migrations are written, work as expected
* Build and test the app locally with ng build -prod
* Commit and push version tag
* Pull app on server and do `npm install` if needed and then `ng build -prod`
## Desktop app
* For desktop app uncomment `httpOptions: { withCredentials: true, responseType: 'json' }` in `src/app/app.config.json`, then do every steps from the web app building instruction, instead of the last part (`ng build -prod`)
* Build desktop app for your platform using `npm run electron:build` or build for other platform using thier correspond script:

    
    | Platform | Script |
    | ------------- |:-------------:|
    | Linux | `npm run electron:build:linux` |
    | Mac | `npm run electron:build:mac` |
    | Windows | `npm run electron:build:win` |

* The built desktop app will be placed in `electron-app/dist/` directory