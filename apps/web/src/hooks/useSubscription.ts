import { env } from "@/env";
import { queryClient } from "@/lib/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSubscription(handle: string) {
	const query = useQuery({
		queryKey: ["subscription", handle],
		queryFn: async () => {
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/channels/${handle}/subscribed`,
				{
					headers: {
						Authorization: "Bearer test_token",
					},
				},
			);
			if (!res.ok) return { subscribed: false };
			return (await res.json()) as { subscribed: boolean };
		},
		staleTime: 30000,
	});

	const mutation = useMutation({
		mutationFn: async (currentlySubscribed: boolean) => {
			const method = currentlySubscribed ? "DELETE" : "POST";
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/channels/${handle}/subscribe`,
				{
					method,
					headers: {
						Authorization: "Bearer test_token",
					},
				},
			);
			if (!res.ok) throw new Error("Subscription action failed");
			return (await res.json()) as { subscribed: boolean };
		},
		onMutate: async (currentlySubscribed: boolean) => {
			await queryClient.cancelQueries({ queryKey: ["subscription", handle] });
			const previous = queryClient.getQueryData<{ subscribed: boolean }>([
				"subscription",
				handle,
			]);

			queryClient.setQueryData(["subscription", handle], {
				subscribed: !currentlySubscribed,
			});

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["subscription", handle], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription", handle] });
			queryClient.invalidateQueries({ queryKey: ["channel", handle] });
		},
	});

	return {
		isSubscribed: !!query.data?.subscribed,
		isLoading: query.isLoading,
		toggleSubscription: () => mutation.mutate(!!query.data?.subscribed),
		isToggling: mutation.isPending,
	};
}
