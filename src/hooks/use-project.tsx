// 这个hook的作用是获取当前项目的信息，包括项目列表，当前项目，当前项目ID，设置当前项目ID等
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery(); // 项目列表

  const [projectId, setProjectId] = useLocalStorage("dionysus-projectId", ""); // 项目ID

  const project = projects?.find((item) => item.id === projectId); // 当前项目

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;
