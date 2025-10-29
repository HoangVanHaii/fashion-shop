
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../interfaces/user'
import { getProfile, updateInfoAPI , verifyChangeEmailAPI, changeEmailAPI,updateAvatarAPI } from '../services/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })

  const loading = ref(false)

  const fetchProfile = async () => {
    try {
      loading.value = true
      const res = await getProfile()
      const data = res.data

      if (data.date_of_birth) {
        data.date_of_birth = new Date(data.date_of_birth)
      }

      user.value = data
    } finally {
      loading.value = false
    }
  }

  const updateInfo = async () => {
    if (!user.value) return
    try {
      loading.value = true
      await updateInfoAPI(user.value)
      await fetchProfile()
    } finally {
      loading.value = false
    }
  }

  const otpSent = ref(false)        
  const emailPending = ref<string | null>(null) 

  const changeEmail = async (newEmail: string, password: string) => {
    try {
      loading.value = true
      const res = await changeEmailAPI(newEmail, password)
      emailPending.value = newEmail
      otpSent.value = true
      return res.message
    } finally {
      loading.value = false
    }
  }

  const verifyChangeEmail = async (otp: string) => {
    if (!emailPending.value) return 'Không có email nào cần xác nhận'
    try {
      loading.value = true
      const res = await verifyChangeEmailAPI(emailPending.value, otp)
      user.value!.email = emailPending.value
      emailPending.value = null
      otpSent.value = false
      return res.message
    } finally {
      loading.value = false
    }
  }

  const updateAvatar = async (file: File) => {
    try {
      loading.value = true
      const res = await updateAvatarAPI(file)
      user.value!.avatar = res.data.avatar
      return res.message
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    loading,
    fetchProfile,
    updateInfo,
    logout,
    changeEmail,
    verifyChangeEmail,
    otpSent,
    emailPending,
    updateAvatar
  }
})
