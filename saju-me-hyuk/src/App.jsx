import { useState } from 'react'
import Markdown from 'react-markdown'
import { getSajuReading, cleanSajuMarkdown } from './gemini'
import './App.css'

function App() {
  // 각 입력값을 따로 상태로 보관합니다.
  const [name, setName] = useState('') // 이름
  const [birthDate, setBirthDate] = useState('') // 생년월일 (예: 1990-01-01)
  const [birthTime, setBirthTime] = useState('') // 태어난 시간 (예: 14:30)
  const [gender, setGender] = useState('') // 성별: 'male' | 'female'
  const [calendarType, setCalendarType] = useState('solar') // 양력/음력: 'solar' | 'lunar'

  // Gemini 결과 관련 상태
  const [result, setResult] = useState('') // AI가 알려준 사주 풀이
  const [loading, setLoading] = useState(false) // 요청 중이면 true
  const [error, setError] = useState('') // 에러 메시지

  // 버튼 클릭 시 Gemini API 호출
  const handleSubmit = async (e) => {
    e.preventDefault() // form 제출 시 페이지가 새로고침되지 않게 막기
    setError('')
    setResult('')

    // 간단한 필수값 검사
    if (!name.trim() || !birthDate || !gender) {
      setError('이름, 생년월일, 성별은 꼭 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const text = await getSajuReading({
        name: name.trim(),
        birthDate,
        birthTime,
        gender,
        calendarType,
      })
      setResult(text)
    } catch (err) {
      // 네트워크 오류, API 키 문제 등을 화면에 보여줍니다
      setError(err.message || '사주 풀이를 가져오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <h1>사주 입력</h1>
      <p className="subtitle">사주 정보를 입력해 주세요.</p>

      <form onSubmit={handleSubmit}>
        {/* ===== 이름 ===== */}
        <div className="field">
          <label htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            placeholder="예: 홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* ===== 생년월일 ===== */}
        <div className="field">
          <label htmlFor="birthDate">생년월일</label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        {/* ===== 태어난 시간 ===== */}
        <div className="field">
          <label htmlFor="birthTime">태어난 시간</label>
          <input
            id="birthTime"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
        </div>

        {/* ===== 성별 ===== */}
        <fieldset className="field">
          <legend>성별</legend>
          <div className="options">
            <label className="option">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={(e) => setGender(e.target.value)}
              />
              남성
            </label>
            <label className="option">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={(e) => setGender(e.target.value)}
              />
              여성
            </label>
          </div>
        </fieldset>

        {/* ===== 양력 / 음력 ===== */}
        <fieldset className="field">
          <legend>양력 / 음력</legend>
          <div className="options">
            <label className="option">
              <input
                type="radio"
                name="calendarType"
                value="solar"
                checked={calendarType === 'solar'}
                onChange={(e) => setCalendarType(e.target.value)}
              />
              양력
            </label>
            <label className="option">
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                checked={calendarType === 'lunar'}
                onChange={(e) => setCalendarType(e.target.value)}
              />
              음력
            </label>
          </div>
        </fieldset>

        {/* 사주 보기 버튼 */}
        <button type="submit" className="submit" disabled={loading}>
          {loading ? '풀이 중...' : '사주 보기'}
        </button>
      </form>

      {/* name 상태가 바뀔 때마다 아래 글자도 바로 바뀝니다 */}
      <p className="preview">{name}님의 사주</p>

      {/* 에러가 있으면 보여주기 */}
      {error && <p className="error">{error}</p>}

      {/* Gemini 결과 보여주기 (마크다운 → 제목/굵은글씨로 예쁘게 변환) */}
      {result && (
        <section className="result">
          <h2>사주 풀이</h2>
          <div className="result-text">
            <Markdown>{cleanSajuMarkdown(result)}</Markdown>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
