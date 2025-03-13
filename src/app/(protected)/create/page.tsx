"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  // 从trpc里拿到创建项目方法
  const createProject = api.project.createProject.useMutation();

  // 点击提交
  const onSubmit = (data: FormInput) => {
    // window.alert(JSON.stringify(data, null, 2));
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          reset();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
    console.log(data);
    return true;
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="#" alt="" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your Github Repository to link your Dionysus
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="ProjectName"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="ProjectName"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken", { required: true })}
              placeholder="Github Token(Optional)"
              required
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
