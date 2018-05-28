import { Injectable } from '@angular/core';

@Injectable()
export class PageLoaderService {

  constructor() {}

  hideLoading() {
    if (document.getElementById('loader')) {
      document.getElementById('loader').remove();
    }
    document.getElementById('loader-wrapper').style.display = 'none';
  }

  showLoading() {
    if (document.getElementById('loader-wrapper').children.length === 0) {
      document.getElementById('loader-wrapper').style.display = 'block';
      const newNode = document.createElement('div');
      newNode.id = 'loader';
      document.getElementById('loader-wrapper').appendChild(newNode);
    }
  }
}
