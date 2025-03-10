"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const onSubmit = (data: FormInput) => {
    // window.alert(JSON.stringify(data, null, 2));
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
            <Button type="submit">Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
