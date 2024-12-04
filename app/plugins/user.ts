export default defineNuxtPlugin({
  async setup() {
    const user = useSupabaseUser()

    if (!user.value) {
      await useSupabaseClient().auth.signInAnonymously()
    }
  },
})
