import {
  Component, HostListener, Input,
  OnInit, ViewChild
} from '@angular/core';
import { cloneDeep }                      from 'lodash';
import { Store }                          from '@ngrx/store';
import { Project }                        from 'app/shared/state/project/project.model';
import { ProjectService }                 from 'app/project/project.service';
import { AppState }                       from 'app/shared/state/appState';
import { ProjectsActions }                from 'app/shared/state/project/projects.actions';
import { ErrorService }                   from 'app/core/error/error.service';
import { ModalService }                   from 'app/core/modal/modal.service';
import { environment }                    from 'environments/environment';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.sass']
})
export class ProjectDetailsComponent implements OnInit {
  @Input() project: Project;
  @Input() readOnly: boolean;
  clonedProject: Project;
  formSubmitted = false;
  @ViewChild('projectImageCanvasElem') projectImageCanvasElem;
  @ViewChild('canvasPreviewImageElem') canvasPreviewImageElem;
  @ViewChild('projectDetailsPalette') projectDetailsPalette;
  previewImage: string;
  canvasPreviewImage: string;
  fileTypeString: string;
  imageIsEdited: boolean;
  showPaletteBoollean: boolean;

  constructor(private projectServices: ProjectService,
              private store: Store<AppState>,
              private projectsAction: ProjectsActions,
              private errorService: ErrorService,
              private modalService: ModalService) {
  }

  ngOnInit(): void {
    this.clonedProject = cloneDeep(this.project);
    if (this.clonedProject.image) {
      this.previewImage = environment.imagesEndpoint + '/projects/' + this.clonedProject.image;
    }
  }

  togglePalette() {
    this.showPaletteBoollean = !this.showPaletteBoollean;
  }

  selectColor(colorIndex) {
    this.clonedProject.colorPalette = colorIndex;
    this.togglePalette();
  }

  updateProject() {
    if (!this.clonedProject.name || /^\s*$/.test(this.clonedProject.name) || !this.clonedProject.name.trim()) {
      this.showError('The project name is empty');
    } else {
      if (!this.formSubmitted) {
        this.formSubmitted = true;
        this.clonedProject.name = this.clonedProject.name.trim();
        const formData = new FormData();
        formData.append('project', JSON.stringify({name: this.clonedProject.name, colorPalette: this.clonedProject.colorPalette}));
        this.projectImageCanvasElem.nativeElement.toBlob(blob => {
          if (blob.size > 500000) {
            this.formSubmitted = false;
            this.showError('The image size exceeds from 500KB');
            return;
          }
          if (this.imageIsEdited) {
            formData.append('image', blob);
            this.showError('The project image was updated');
          }
          this.projectServices.update(formData, this.project.id).then((response) => {
            this.showError('The project was edited successfully');
            this.clonedProject.image = response[0].image;
            this.store.dispatch(this.projectsAction.updateProject(this.clonedProject))
            this.formSubmitted = false;
            this.modalService.close();
          })
            .catch(error => {
              this.formSubmitted = false;
              console.log('error is:', error);
              this.showError('Server communication error.');
            });
        }, this.fileTypeString, 0.90);
      }
    }
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
    reader.onerror = (error) => {
      console.log('Error: ', error);
      this.showError('Failed to upload file.');
    }
    const fileType = file['type'];
    console.log('fileType', fileType)
    const validImageTypes = ['image/jpeg', 'image/png'];
    if (validImageTypes.includes(fileType)) {
      this.fileTypeString = file['type'];
      this.imageIsEdited = true;
      console.log('fileType', this.fileTypeString);
    } else {
      this.imageIsEdited = false;
      console.log('File type is not supported!');
      this.showError('File type is not supported!');
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

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (this.showPaletteBoollean && !this.projectDetailsPalette.nativeElement.contains(event.target)
      && event.target.id !== 'id2') {
      this.togglePalette();
    }
  }
}
