import {Component, ViewChild} from '@angular/core';
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {ModalService} from '../../core/modal/modal.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../shared/state/appState';
import {UserActions} from '../../shared/state/user/user.actions';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.sass'],
})
export class ImgCropperComponent {
  profileData: any;
  croppedImageFile: any;
  cropperSettings: CropperSettings;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;
  disableButtons = false;

  constructor(private modalService: ModalService,
              private store: Store<AppState>,
              private userActions: UserActions,
              private userService: UserService) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.rounded = true;
    this.cropperSettings.keepAspect = true;
    this.profileData = {};
  }

  fileChangeListener($event) {
    const image: any = new Image();
    const file: File = $event.target.files[0];
    const myReader: FileReader = new FileReader();
    const that = this;
    console.log('mahsa:', image)
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);
    };
    myReader.readAsDataURL(file);
  }

  cancel() {
    if (!this.disableButtons) {
      this.modalService.close();
    }
  }

  save() {
    this.croppedImageFile = this.base64ToFile(this.profileData.image);
    if (!this.disableButtons && this.croppedImageFile) {
      this.disableButtons = true;

      const formData = new FormData();
      formData.append('user', JSON.stringify({}));
      formData.append('image', this.croppedImageFile);
      this.userService.update(formData).then((user) => {
        this.store.dispatch(this.userActions.updateUserImage(user.profileImage));
        this.disableButtons = false;
        this.modalService.close();
      })
        .catch(error => {
          console.log('error is: ', error);
          this.disableButtons = false;
          this.modalService.close();
        });
    }
  }

  base64ToFile(inputBase64) {
    let base64String = inputBase64.split(',')[1];
    let binaryString = atob(base64String);
    let len = binaryString.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new File([bytes.buffer], 'image.jpg');
  }

  getBase64(file, callBack) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callBack(reader.result);
    reader.onerror = (error) => console.log('Error: ', error);
  }
}
