<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      >
        <!-- Backdrop - light blur so dashboard is still visible -->
        <div class="absolute inset-0 bg-black/10 backdrop-blur-sm" />

        <!-- Modal - 75% of screen, responsive -->
        <div
          class="relative w-full md:w-[85vw] lg:w-[75vw] max-w-[1600px] bg-[#161b33] border border-gray-700/50 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div
            class="bg-gradient-to-br from-[#0d1230] via-[#161b33] to-[#0d1230] px-6 md:px-12 py-6 md:py-8 border-b border-gray-700/50 flex-shrink-0"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 md:gap-6 min-w-0">
                <div
                  class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30"
                >
                  <Icon
                    name="ph:check-circle-fill"
                    class="text-green-400"
                    size="32"
                  />
                </div>
                <div class="min-w-0">
                  <h2
                    class="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-1 truncate"
                  >
                    Beat Published Successfully!
                  </h2>
                  <p class="text-sm md:text-base text-gray-400">
                    Your track is now live on the marketplace
                  </p>
                </div>
              </div>
              <button
                @click="close"
                class="text-gray-500 hover:text-gray-300 transition-colors outline-none flex-shrink-0"
              >
                <Icon name="ph:x" size="24" />
              </button>
            </div>
          </div>

          <!-- Body - scrollable if needed -->
          <div class="overflow-y-auto flex-1">
            <div class="p-6 md:p-10 lg:p-12">
              <div class="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
                <!-- Artwork + Tags -->
                <div
                  class="flex flex-col items-center lg:items-start justify-center h-full gap-4"
                >
                  <img
                    :src="beat.coverImage"
                    :alt="beat.title"
                    class="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-xl md:rounded-2xl object-cover shadow-2xl border border-gray-700/50"
                  />
                  <!-- Tags under image -->
                  <div
                    v-if="beat.tags && beat.tags.length"
                    class="flex flex-wrap gap-2 justify-center lg:justify-start"
                  >
                    <span
                      v-for="tag in beat.tags"
                      :key="tag"
                      class="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30"
                      >#{{ tag }}</span
                    >
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0 space-y-5 md:space-y-6">
                  <div>
                    <h3
                      class="text-2xl md:text-3xl font-semibold text-white mb-2 md:mb-3"
                    >
                      {{ beat.title }}
                    </h3>
                    <p
                      v-if="beat.description"
                      class="text-gray-400 text-base md:text-lg leading-relaxed"
                    >
                      {{ beat.description }}
                    </p>
                  </div>

                  <!-- Quick stats -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div
                      class="bg-[#0d1230] border border-gray-700/50 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4"
                    >
                      <p
                        class="text-gray-500 text-xs uppercase tracking-wider mb-1.5 md:mb-2"
                      >
                        Genre
                      </p>
                      <p
                        class="text-white text-base md:text-lg font-medium truncate"
                      >
                        {{ beat.genre || "—" }}
                      </p>
                    </div>
                    <div
                      class="bg-[#0d1230] border border-gray-700/50 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4"
                    >
                      <p
                        class="text-gray-500 text-xs uppercase tracking-wider mb-1.5 md:mb-2"
                      >
                        BPM
                      </p>
                      <p class="text-white text-base md:text-lg font-medium">
                        {{ beat.bpm || "—" }}
                      </p>
                    </div>
                    <div
                      class="bg-[#0d1230] border border-gray-700/50 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4"
                    >
                      <p
                        class="text-gray-500 text-xs uppercase tracking-wider mb-1.5 md:mb-2"
                      >
                        Key
                      </p>
                      <p class="text-white text-base md:text-lg font-medium">
                        {{ beat.key || "—" }}
                      </p>
                    </div>
                    <div
                      class="bg-[#0d1230] border border-gray-700/50 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4"
                    >
                      <p
                        class="text-gray-500 text-xs uppercase tracking-wider mb-1.5 md:mb-2"
                      >
                        Status
                      </p>
                      <p
                        :class="
                          beat.isPublished
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        "
                        class="text-base md:text-lg font-medium"
                      >
                        {{ beat.isPublished ? "Public" : "Draft" }}
                      </p>
                    </div>
                  </div>

                  <!-- Pricing -->
                  <div
                    class="bg-[#0d1230] border border-gray-700/50 rounded-xl md:rounded-2xl p-5 md:p-6"
                  >
                    <p
                      class="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-3 md:mb-4 font-medium"
                    >
                      Pricing Tiers
                    </p>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                    >
                      <div
                        class="bg-[#161b33] rounded-lg md:rounded-xl p-5 md:p-6 text-center"
                      >
                        <p
                          class="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2"
                        >
                          Basic
                        </p>
                        <p
                          class="text-white text-2xl md:text-3xl font-semibold"
                        >
                          €{{ beat.priceBasic ?? "—" }}
                        </p>
                        <p class="text-gray-500 text-xs mt-2">Tagged MP3</p>
                      </div>
                      <div
                        class="bg-[#161b33] rounded-lg md:rounded-xl p-5 md:p-6 text-center"
                      >
                        <p
                          class="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2"
                        >
                          Premium
                        </p>
                        <p
                          class="text-white text-2xl md:text-3xl font-semibold"
                        >
                          €{{ beat.pricePremium ?? "—" }}
                        </p>
                        <p class="text-gray-500 text-xs mt-2">WAV + MP3</p>
                      </div>
                      <div
                        class="bg-[#161b33] rounded-lg md:rounded-xl p-5 md:p-6 text-center"
                      >
                        <p
                          class="text-gray-400 text-xs md:text-sm uppercase tracking-wider mb-2"
                        >
                          Exclusive
                        </p>
                        <p
                          class="text-white text-2xl md:text-3xl font-semibold"
                        >
                          €{{ beat.priceExclusive ?? "—" }}
                        </p>
                        <p class="text-gray-500 text-xs mt-2">
                          Full exclusive rights
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 md:px-12 py-4 md:py-6 bg-[#0d1230] border-t border-gray-700/50 flex flex-col items-center justify-center gap-4 flex-shrink-0"
          >
            <p class="text-xs md:text-sm text-gray-500 text-center">
              You can manage this beat from your dashboard anytime
            </p>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <NuxtLink
                :to="`/dashboard/beat/${beat.id}/edit`"
                @click="close"
                class="px-8 md:px-10 py-2.5 md:py-3.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-colors outline-none select-none shadow-lg text-center"
              >
                Edit Beat
              </NuxtLink>
              <button
                @click="close"
                class="px-8 md:px-10 py-2.5 md:py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-colors outline-none select-none shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Beat {
  id?: string;
  title: string;
  description?: string;
  coverImage: string;
  genre?: string;
  bpm?: number | null;
  key?: string;
  duration?: string | null;
  priceBasic?: number | null;
  pricePremium?: number | null;
  priceExclusive?: number | null;
  tags?: string[];
  isPublished?: boolean;
}

// Use global state
const showModal = useState("showBeatPublishedModal", () => false);
const beat = useState<Beat>("publishedBeatData", () => ({
  title: "",
  coverImage: "",
}));

const close = () => {
  showModal.value = false;
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
