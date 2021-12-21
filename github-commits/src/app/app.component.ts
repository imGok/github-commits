import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ICommitInfo } from './shared/helpers/interfaces/commit.interface';
import { IRepository } from './shared/helpers/interfaces/repository.interface';
import { GitHubApiService } from './shared/services/github-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  addRepoFormGroup: FormGroup;
  addTokenFormGroup: FormGroup;

  repositories: IRepository[] = [];

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  result: ICommitInfo[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private gitHubApiService: GitHubApiService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.addRepoFormGroup = this.formBuilder.group({
      owner: [null, [Validators.required]],
      repository: [null, [Validators.required]],
    });

    this.addTokenFormGroup = this.formBuilder.group({
      token: [null, [Validators.required]],
    });
  }

  addRepository() {
    this.repositories.push({
      owner: this.addRepoFormGroup.value['owner'],
      repository: this.addRepoFormGroup.value['repository'],
    } as IRepository);
  }

  onSubmit() {
    const unique: IRepository[] = [];
    this.repositories.map((x) =>
      unique.filter((a) => a.owner == x.owner && a.repository == x.repository)
        .length > 0
        ? null
        : unique.push(x)
    );

    this.gitHubApiService
      .getCommits(
        unique,
        JSON.stringify(this.range.value['start']),
        JSON.stringify(this.range.value['end'])
      )
      .then((commitsInfo) => {
        this.result = commitsInfo;
      });
  }

  onAuth() {
    this.gitHubApiService.authenticate(this.addTokenFormGroup.value['token']);
  }

  onDeleteRepo(repository: IRepository) {
    this.repositories = this.repositories.filter((repo) => repo !== repository);
  }
}
