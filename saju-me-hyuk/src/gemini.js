// Gemini API를 호출하는 도우미 파일입니다.
import { GoogleGenAI } from '@google/genai'

// 프로젝트 루트 `.env` 파일의 VITE_GEMINI_API_KEY 값을 읽습니다.
// (파일 이름에 점(.)이 꼭 있어야 합니다: env ❌ / .env ⭕)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

// API 클라이언트 만들기 (브라우저에서도 apiKey를 직접 넘겨야 합니다)
const ai = new GoogleGenAI({ apiKey })

/**
 * 사주 기본 차트 해석용 프롬프트 만들기
 * 백틱(`) 문자열 + ${변수} = 템플릿 리터럴 (사용자 입력을 프롬프트에 넣는 표준 방법)
 */
export function buildSajuPrompt({ name, birth, time, gender, calendar }) {
  return `return only Korean.
당신은 세계 최고의 사주 해석 전문가다. 논리와 구조 중심으로 해석하며,
수천 명의 인생을 분석해 온 경험이 있다. 매우 냉정하고 직설적이지만 ,
인간 내면에 대한 깊은 통찰로 장점과 단점을 모두 말한다.
먼저 아래 출생 정보로 사주 명식(년주·월주·일주·시주, 오행 분포, 십신)을 세워라.
그 다음 질문에 답하라: 이 사람의 전반적인 성격, 기질, 재능을 분석해 주세요.
사주 용어에 익숙하지 않다고 가정하고 쉽고 명확하게, 핵심 근거를 밝혀서.
1) 차분하지만 흥미롭게 2) 특이한 점 언급 3) 약점도 솔직하게
4) 돋보이는 특징 최소 1가지 5) 마지막은 사용자가 궁금해할 질문으로
이름: ${name} / 성별: ${gender} / ${calendar} ${birth} ${time} 생

출력 형식 규칙(반드시 지킬 것):
- Markdown 제목(###)과 목록은 사용해도 된다.
- 강조할 때는 **별표**를 쓰지 말고 따옴표를 쓴다. 예: '금', '무술'
- **'금'** 처럼 별표와 따옴표를 함께 쓰지 않는다.
return only Korean.`
}

/**
 * AI 결과에서 ** 강조 표시만 제거하고, 따옴표는 그대로 둡니다.
 * 예: **'금'** → '금'  /  **무술** → 무술
 */
export function cleanSajuMarkdown(text) {
  let s = text ?? ''

  // 전각 별표(＊) → 일반 별표
  s = s.replace(/\uFF0A/g, '*')

  // **내용** → 내용  (따옴표는 내용 안에 있으면 그대로 남음)
  s = s.replace(/\*\*(.+?)\*\*/g, '$1')

  // 남은 단독 ** 제거
  s = s.replace(/\*\*/g, '')

  return s
}

/**
 * 입력한 사주 정보로 Gemini에게 해석을 요청합니다.
 * @param {{ name: string, birthDate: string, birthTime: string, gender: string, calendarType: string }} form
 * @returns {Promise<string>} 사주 해석 텍스트
 */
export async function getSajuReading(form) {
  if (!apiKey) {
    throw new Error(
      '.env 파일에 VITE_GEMINI_API_KEY가 없습니다. 키를 넣고 개발 서버를 다시 시작해 주세요.'
    )
  }

  // form 값을 프롬프트 함수가 기대하는 이름으로 맞춤
  const prompt = buildSajuPrompt({
    name: form.name,
    birth: form.birthDate,
    time: form.birthTime || '시간 모름',
    gender: form.gender, // 'male' | 'female'
    calendar: form.calendarType === 'lunar' ? '음력' : '양력',
  })

  // models.generateContent: 텍스트 생성 API 호출
  // 새 계정은 gemini-2.5-flash 를 쓸 수 없어서 최신 모델로 호출합니다
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  })

  // response.text 에 AI가 만든 글이 들어있습니다
  const raw = response.text ?? '결과를 받지 못했습니다.'
  return cleanSajuMarkdown(raw)
}
