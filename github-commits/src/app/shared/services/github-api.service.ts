import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { Observable } from 'rxjs/internal/Observable';
import { zip } from 'rxjs/internal/observable/zip';
import { ICommitInfo } from '../helpers/interfaces/commit.interface';
import { IRepository } from '../helpers/interfaces/repository.interface';

@Injectable({
  providedIn: 'root',
})
export class GitHubApiService {
  octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      baseUrl: 'https://api.github.com',
      log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error,
      },
      request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0,
      },
    });
  }

  async getCommits(
    repository: IRepository[],
    startDate: string,
    endDate: string
  ) {
    return Promise.all(
      repository.map(async (repo) => {
        var commitInfo = await this.octokit.paginate(
          'GET /repos/{owner}/{repo}/commits',
          {
            owner: repo.owner,
            repo: repo.repository,
            since: startDate,
            until: endDate,
          },
          (response) => response.data
        );

        var authorsNames = commitInfo.map(
          (commitResponse) => commitResponse.commit.author.email
        );
        var authorsNamesMap = authorsNames.reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {});

        return {
          owner: repo.owner,
          repository: repo.repository,
          committers: authorsNamesMap,
          totalCommits: commitInfo.length,
        } as ICommitInfo;
      })
    );
  }
}
