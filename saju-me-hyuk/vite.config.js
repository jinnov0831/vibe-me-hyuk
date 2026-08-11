import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 프로젝트 루트의 `.env` 파일에서 VITE_ 로 시작하는 값을 읽습니다.
  // (파일 이름이 env 가 아니라 .env 이어야 Vite가 자동으로 인식합니다)
  loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    // .env 파일이 있는 폴더 = 이 프로젝트 루트
    envDir: '.',
  }
})
