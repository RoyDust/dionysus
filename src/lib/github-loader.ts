import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
// 根据github的url获取文件列表

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken ?? "",
    branch: "main",
    ignoreFiles: [
      ".gitignore",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();
  return docs;
};

console.log(await loadGithubRepo("https://github.com/docker/genai-stack"));
