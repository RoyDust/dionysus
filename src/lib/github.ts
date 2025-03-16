import { db } from "@/server/db";
import { Octokit } from "octokit";

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
  const { data } = await octokit.rest.repos.listCommits({
    owner: "docker",
    repo: "genai-stack",
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
  console.log("unprocessedCommits", unprocessedCommits);
  return unprocessedCommits;
};

pollCommits("cm87nl7tm00005cld98opf0r7").then((res) => {
  console.log(res);
});
