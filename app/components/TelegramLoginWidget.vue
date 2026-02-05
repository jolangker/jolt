<script setup lang="ts">
import { onMounted } from 'vue'
import { useCookie } from '#app'
import type { TelegramAuthData } from '~~/shared/types/auth'

const emit = defineEmits<{
  callback: []
  loaded: []
}>()

const userCookie = useCookie('tg_user', {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
})

const setCookie = (payload: TelegramAuthData) => {
  userCookie.value = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))))
}

function onTelegramAuth(payload: TelegramAuthData) {
  setCookie(payload)
  $fetch('/api/auth/telegram').then(() => {
    emit('callback')
  })
}

onMounted(() => {
  if (import.meta.client) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'

    script.setAttribute('data-telegram-login', 'jollexpenser_bot')
    script.setAttribute('data-request-access', 'read')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-radius', '8')

    // @ts-ignore
    window.onTelegramAuth = onTelegramAuth
    script.setAttribute('data-onauth', 'window.onTelegramAuth(user)')

    document.querySelector('#telegram')!.appendChild(script)
    emit('loaded')
  }
})
</script>

<template>
  <div id="telegram" />
</template>
