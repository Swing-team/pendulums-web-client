import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';
import {ProjectService} from '../../../shared/projects.service';
import {cloneDeep} from 'lodash';
import {APP_CONFIG} from '../../../../app.config';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.sass']
})
export class ProjectDetailsComponent implements OnInit {
  @Input() project: Project;
  private clonedProject: Project;
  formSubmitted = false;
  @ViewChild('projectImageCanvasElem') projectImageCanvasElem;
  @ViewChild('canvasPreviewImageElem') canvasPreviewImageElem;
  previewImage: String;
  canvasPreviewImage: string;

  constructor(private projectServices: ProjectService, @Inject(APP_CONFIG) private config) {
  }

  ngOnInit(): void {
    this.clonedProject = cloneDeep(this.project);
    this.previewImage = this.config.imagesEndpoint + '/projects/' + this.project.image;
  }

  updateProject() {
    const formData = new FormData();
    let nameIsDirty = false;
    let imageIsDirty = false;
    if (this.clonedProject.name !== this.project.name) {
      formData.append('project', JSON.stringify({name: this.project.name}));
      nameIsDirty = true;
    }

    if (this.clonedProject.image !== this.previewImage) {
      formData.append('image', this.projectImageCanvasElem.nativeElement.mozGetAsFile('projectImage.png'));
      imageIsDirty = true;
    }

    if (nameIsDirty || imageIsDirty) {
      this.projectServices.update(formData, this.project.id).then((response) => {
        // TODO: arminghm 19 Jul 2017 show a success message
        this.formSubmitted = false;
      })
        .catch(error => {
          this.formSubmitted = false;
          // TODO: arminghm 19 Jul 2017 show a error message
          console.log('error is: ', error);
        });
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
    reader.onerror = (error) => console.log('Error: ', error);
  }

  resizeImage() {
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
