import * as _ from 'lodash';
import {Component, HostListener, Input, ViewChild} from '@angular/core';
import { Project }                      from '../../../shared/state/project/project.model';
import { Md5 }                          from 'ts-md5/dist/md5';
import { ProjectService }               from '../../shared/projects.service';
import { Store }                        from '@ngrx/store';
import { AppState }                     from '../../../shared/state/appState';
import { ProjectsActions }              from '../../../shared/state/project/projects.actions';
import { ModalService }                 from '../../../core/modal/modal.service';
import { ErrorService }                 from '../../../core/error/error.service';
import { User }                         from '../../../shared/state/user/user.model';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;

@Component({
  selector: 'create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.sass'],
})

export class CreateProjectComponent {
  @ViewChild('projectImageCanvasElem') projectImageCanvasElem;
  @ViewChild('canvasPreviewImageElem') canvasPreviewImageElem;
  @ViewChild('projectCreatePalette') projectCreatePalette;
  @Input() currentUser: User;
  roles = ['team member', 'admin'];
  project: Project = new Project();
  user = {email: null, role: this.roles[0]};
  previewImage: string;
  canvasPreviewImage: string;
  fileTypeString: string;
  formSubmitted = false;
  showPaletteBoolean = false;
  md5: any;

  constructor(private projectServices: ProjectService,
              private store: Store<AppState>,
              private projectsActions: ProjectsActions,
              private modalService: ModalService,
              private errorService: ErrorService) {
    this.md5 = new Md5();
  }

  createProject() {
    if (this.user.email) {
      this.invite();
    }
    if (!this.project.name || /^\s*$/.test(this.project.name) || !this.project.name.trim()) {
      this.showError('Project name is empty');
    } else {
      if (!this.formSubmitted) {
        this.formSubmitted = true;
        // todo: please create dto model in order to use in interactions with server
        delete this.project['id'];
        delete this.project['recentActivityName'];
        delete this.project['image'];
        delete this.project['activities'];
        const formData = new FormData();
        formData.append('project', JSON.stringify(this.project));
        this.projectImageCanvasElem.nativeElement.toBlob(blob => {
          if (blob.size > 500000) {
            this.formSubmitted = false;
            this.showError('Image size exceeded from 500KB');
            return;
          }
          // check whether image has been changed or not
          if (this.previewImage) {
            formData.append('image', blob);
          }
          this.projectServices.create(formData).then((project) => {
            project.activities = [];
            this.store.dispatch(this.projectsActions.addProject(project));
            this.showError('The project was created successfully');
            this.project = new Project();
            this.formSubmitted = false;
            this.modalService.close();
          })
            .catch(error => {
              this.formSubmitted = false;
              console.log('error is: ', error);
              this.showError('Server communication error');
            });
        }, this.fileTypeString, 0.90);
      }
    }
  }

  invite() {
    if (this.validateInvitedUser()) {
      this.user.email = this.user.email.toLowerCase();
      this.project.invitedUsers.push(_.cloneDeep(this.user));
      this.user = {email: null, role: this.roles[0]};
    }
  }

  togglePalette() {
    this.showPaletteBoolean = !this.showPaletteBoolean;
  }

  selectColor(colorIndex) {
    this.project.colorPalette = colorIndex;
    this.togglePalette();
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  delete(invitedUserId) {
    this.project.invitedUsers.splice(invitedUserId, 1);
  }

  getFiles(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.getBase64(fileInput.target.files[0], (base64) => {
        this.canvasPreviewImage = base64;
        console.log('base64: ', base64);
      });
    }
  }

  getBase64(file, callBack) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => callBack(reader.result);
    reader.onerror = (error) => {
      console.log('Error: ', error);
      this.showError('Failed to upload the image');
    };
    const fileType = file['type'];
    console.log('fileType', fileType);
    const validImageTypes = ['image/jpeg', 'image/png'];
    if (validImageTypes.includes(fileType)) {
      this.fileTypeString = file['type'];
      console.log('fileType', this.fileTypeString);
    } else {
      console.log('File type is not supported!');
      this.showError('Picture did no upload. File type is not supported!');
    }
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

  validateInvitedUser() {
    if (!EMAIL_REGEX.test(this.user.email)) {
      this.showError('Invalid email address');
      return false;
    }
    for (let i = 0; i < this.project.invitedUsers.length; i++) {
      if (this.project.invitedUsers[i].email === this.user.email) {
        this.showError('You have already entered this email address');
        return false;
      }
    }
    if (this.user.email === this.currentUser.email) {
      console.log('error:', 'you can not invite your self as a team member.');
      this.showError('you can not invite your self as a team member.');
      return false;
    }
    return true;
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (this.showPaletteBoolean && !this.projectCreatePalette.nativeElement.contains(event.target)
      && event.target.id !== 'id2') {
      this.togglePalette();
    }
  }

    showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
