import { IRepository } from "./repository.interface";

export interface ICommitter {
  email: string
}

export interface ICommitInfo extends IRepository{
  committers: {[email: string]: number},
  totalCommits: number
}