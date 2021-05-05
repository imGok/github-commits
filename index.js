const { Octokit } = require("@octokit/rest");
const { repositories, parameters } = require('./config.json');

if (parameters.monthsDuration) {
  var currentDate = new Date(Date.now());
  currentDate = new Date(currentDate.setMonth(currentDate.getMonth() - parameters.monthsDuration));
}

const octokit = new Octokit({
  baseUrl: 'https://api.github.com',
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error
  },
  request: {
    agent: undefined,
    fetch: undefined,
    timeout: 0
  }
})

async function getCommitsResponse(owner, repo) {
  return await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
    owner: owner,
    repo: repo,
    since: parameters.monthsDuration ? currentDate.toISOString() : null,
  }, (response) => response.data);
}

function parseCommitResponse(commitResponse) {
  var numberOfCommits = commitResponse.length;
  var authorsNames = commitResponse.map((commitResponse) => commitResponse.commit.author.email);
  var authorsNamesMap = authorsNames.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  return `Monthly Committers :\r\n${JSON.stringify(authorsNamesMap, null, 2)} \r\n\r\nNumber of commits since ${currentDate.toDateString()} :\r\n${numberOfCommits}`;
}

repositories.forEach((repository) => {
  getCommitsResponse(repository.owner, repository.repository).then((commitResponse) => {
    console.log(`[Owner: ${repository.owner} | Repository: ${repository.repository}]`);
    parseCommitResponse(commitResponse);
    console.log(parseCommitResponse(commitResponse));
    console.log("_______")
  })
});
