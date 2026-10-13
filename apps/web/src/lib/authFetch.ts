import { useAuth } from "@clerk/nextjs";

/**
 * Returns a fetch wrapper that injects the current Clerk session token as a
 * Bearer header. Use inside React components or hooks that already have Clerk
 * context. Returns null when the user is not signed in so callers can skip
 * authenticated requests gracefully.
 */
export function useAuthFetch() {
	const { getToken } = useAuth();

	return async (input: RequestInfo | URL, init: RequestInit = {}) => {
		const token = await getToken();
		return fetch(input, {
			...init,
			headers: {
				...(init.headers ?? {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});
	};
}
