import type { MaybeRefOrGetter } from "vue";

/**
 * Composable to set dynamic page titles with reactive updates
 * @param title - Static string, ref, or computed value for the page title
 * @param fallback - Optional fallback title if the main title is empty
 *
 * @example
 * ```ts
 * // Static title
 * usePageTitle('Dashboard')
 *
 * // Dynamic title with reactive data
 * const beat = ref({ title: 'My Beat' })
 * usePageTitle(() => beat.value?.title, 'Beat')
 *
 * // With computed
 * const username = computed(() => userData.value?.username)
 * usePageTitle(() => username.value ? `${username.value}'s Profile` : undefined, 'Profile')
 * ```
 */
export function usePageTitle(
  title: MaybeRefOrGetter<string | undefined>,
  fallback?: string,
) {
  const resolvedTitle = computed(() => {
    const value = toValue(title);
    return value || fallback || "";
  });

  watch(
    resolvedTitle,
    (newTitle) => {
      if (newTitle) {
        useHead({
          title: newTitle,
        });
      }
    },
    { immediate: true },
  );
}
