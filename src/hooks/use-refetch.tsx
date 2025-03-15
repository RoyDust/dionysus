// 这个hook是用来让trpc缓存失效，从而重新获取数据的
import { useQueryClient } from "@tanstack/react-query";

const useRefetch = () => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      type: "active",
    });
  };
};
export default useRefetch;
