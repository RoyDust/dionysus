import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummariseCommit, summariseCode } from "./gemini";

export const octokit: Octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = "https://github.com/docker/genai-stack";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (githubUrl: string) => {
  console.log(githubUrl);

  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort((a, b) => {
    return (
      new Date(b.commit.committer.date).getTime() -
      new Date(a.commit.committer.date).getTime()
    );
  }) as any[];

  const res = sortedCommits.slice(0, 10).map((commit) => {
    return {
      commitHash: commit.sha as string,
      commitMessage: commit.commit.message ?? "",
      commitAuthorName: commit.commit.author.name ?? "",
      commitAuthorAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit.author.date ?? "",
    };
  });

  console.log(res);

  return res;
};

export async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error("Project not found or github url not found");
  }
  return {
    project,
    githubUrl: project?.githubUrl ?? "",
  };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
  const processedCommitHashes = commitHashes.filter((commit) => {
    return !processedCommits.some((processedCommit) => {
      return processedCommit.commitHash === commit.commitHash;
    });
  });
  return processedCommitHashes;
}

// 拿到commit的diff 交给ai处理
async function summariseCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commits/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return (await aiSummariseCommit(data)) || "";
}

export const pollCommits = async (projectId: string) => {
  // 拿到项目的github url
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  // 拿到项目的commit hashes
  const commitHashes = await getCommitHashes(githubUrl);
  // 过滤掉已经处理过的commit hashes
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  // 用ai处理commit
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );

  // 遍历summaryResponses，把fulfilled的value拿出来，放到一个数组里
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return "";
  });

  // 把summaryResponses插入到数据库
  const commit = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index].commitHash,
        commitMessage: unprocessedCommits[index].commitMessage,
        commitAuthorName: unprocessedCommits[index].commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index].commitAuthorAvatar,
        commitDate: unprocessedCommits[index].commitDate,
        summary,
      };
    }),
  });

  console.log("commit", commit);
  return commit;
};

// await pollCommits("cm8bwbd0d000980vbgv91ovnp").then((res) => {
//   console.log(res);
// });
