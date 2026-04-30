import { ref } from 'vue'

const snackbarMessage = ref('')
const snackbarVisible = ref(false)

export function useSnackbar() {
    function showSnackbar(msg: string) {
        snackbarMessage.value = msg
        snackbarVisible.value = true
    }

    function closeSnackbar() {
        snackbarVisible.value = false
    }

    return {
        snackbarMessage,
        snackbarVisible,
        showSnackbar,
        closeSnackbar,
    }
}
