import { Injectable } from '@angular/core';

@Injectable()
export class PageLoaderService {

  constructor() {}

  hideLoading() {
    document.getElementById('loader').remove();
    document.getElementById('loader-wrapper').style.display = 'none';
  }

  showLoading() {
    document.getElementById('loader-wrapper').style.display = 'block';
    const newNode = document.createElement('div');
    newNode.id = 'loader';
    document.getElementById('loader-wrapper').appendChild(newNode);
  }
}
