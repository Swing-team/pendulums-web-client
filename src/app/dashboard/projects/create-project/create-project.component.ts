import {Component, ViewChild} from '@angular/core';
import {Project} from '../../../shared/state/project/project.model';
import * as _ from 'lodash';
import {Md5} from 'ts-md5/dist/md5';
import {ProjectService} from '../../shared/projects.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../shared/state/appState';
import {ProjectsActions} from '../../../shared/state/project/projects.actions';
import {ModalService} from '../../../core/modal/modal.service';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.sass'],
})

export class CreateProjectComponent {
  roles = ['team member', 'admin'];
  private project: Project = new Project();
  private user = {email: null, role: this.roles[0], hash: null};
  private errorMessage: string;
  @ViewChild('projectImageCanvasElem') projectImageCanvasElem;
  @ViewChild('canvasPreviewImageElem') canvasPreviewImageElem;
  previewImage: string;
  canvasPreviewImage: string;
  userSubmitted = false;
  formSubmitted = false;
  md5: any;

  constructor(private projectServices: ProjectService,
              private store: Store<AppState>,
              private projectsActions: ProjectsActions,
              private modalService: ModalService) {
    this.md5 = new Md5();
  }

  createProject() {
    if (!this.project.name || /^\s*$/.test(this.project.name) || !this.project.name.trim()) {
      console.log('error is: ', 'name is empty!');
    } else {
      this.formSubmitted = true;
      delete this.project['_id'];
      delete this.project['image'];
      const formData = new FormData();
      formData.append('project', JSON.stringify(this.project));
      // FIXME: arminghm 19 Jul 2017 mozGetAsFile() method is deprecated
      formData.append('image', this.projectImageCanvasElem.nativeElement.mozGetAsFile('projectImage.png'));

      this.projectServices.create(formData).then((project) => {
        this.store.dispatch(this.projectsActions.addProject(project));
        console.log('project added successfully');
        this.project = new Project();
        this.modalService.close();
      })
        .catch(error => {
          this.formSubmitted = false;
          console.log('error is: ', error);
        });
      this.formSubmitted = false;
    }
  }

  invite() {
    this.userSubmitted = true;
    if (this.validateInvitedUser()) {
      this.user.hash = Md5.hashStr(this.user.email);
      this.project.invitedUsers.push(_.cloneDeep(this.user));
      this.user = {email: null, role: this.roles[0], hash: null};
    }
    this.userSubmitted = false;
  }

  delete(invitedUserId) {
    this.project.invitedUsers.splice(invitedUserId, 1);
  }

  getFiles(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.getBase64(fileInput.target.files[0], (base64) => {
        this.canvasPreviewImage = base64;
      });
    }
  }

  getBase64(file, callBack) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callBack(reader.result);
    reader.onerror = (error) => console.log('Error: ', error);
  }

  validateInvitedUser() {
    if (!EMAIL_REGEX.test(this.user.email)) {
      this.errorMessage = 'please enter correct email address';
      console.log('error:', this.errorMessage);
      return false;
    }
    for (let i = 0; i < this.project.invitedUsers.length; i++) {
      if (this.project.invitedUsers[i].email === this.user.email) {
        this.errorMessage = 'email address is duplicated';
        console.log('error:', this.errorMessage);
        return false;
      }
    }
    return true;
  }

  resizeImage() {
    // FIXME: arminghm 19 Jul 2017 Resized jpeg images has larger size than nonResized jpeg
    const MAX_WIDTH = 500;
    const MAX_HEIGHT = 500;
    let context = this.projectImageCanvasElem.nativeElement.getContext('2d');
    context.drawImage(this.canvasPreviewImageElem.nativeElement, 0, 0);
    let width = this.canvasPreviewImageElem.nativeElement.width;
    let height = this.canvasPreviewImageElem.nativeElement.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    this.projectImageCanvasElem.nativeElement.width = width;
    this.projectImageCanvasElem.nativeElement.height = height;
    context = this.projectImageCanvasElem.nativeElement.getContext('2d');
    context.drawImage(this.canvasPreviewImageElem.nativeElement, 0, 0, width, height);
    this.previewImage = this.projectImageCanvasElem.nativeElement.toDataURL('image/png');
  }
}
