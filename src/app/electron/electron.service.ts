import { Injectable } from '@angular/core';
import { StopStartActivityService } from '../core/services/stop-start-activity.service';
const { ipcRenderer } = (<any>window).require('electron');

@Injectable()
export class ElectronService {
  constructor(
    private stopStartActivityService: StopStartActivityService
  ) {
    ipcRenderer.on('playOrStop', () => {
      console.log('hhhhhhhhhhhhhhhhhhhh')
      // this.stopStartActivityService.startActivity()
    })
  }

}
