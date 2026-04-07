const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let faqData = [];

// ✅ CSV 로드 함수
async function loadCSV() {
  try {
    // 🔥 본인 GitHub 경로로 수정 필수
    const url = "https://raw.githubusercontent.com/choisera0413-maker/chatbot-server/main/faq.csv";

    const response = await axios.get(url);
    const csv = response.data;

    const lines = csv.split("\n").slice(1);

    faqData = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [question, answer, link1, link2, keywords] = line.split(",");

        return {
          question: question?.trim(),
          answer: answer?.trim(),
          link1: link1?.trim(),
          link2: link2?.trim(),
          keywords: keywords ? keywords.split("|").map(k => k.trim()) : []
        };
      });

    console.log("✅ CSV 로드 완료:", faqData.length);
    console.log(faqData); // 🔥 디버깅용
  } catch (err) {
    console.error("❌ CSV 로드 실패:", err.message);
  }
}

// ✅ 서버 실행 시 CSV 로드
app.listen(3000, async () => {
  console.log("🚀 서버 실행됨");
  await loadCSV();
});

// ✅ 챗봇 API
app.post("/chatbot", (req, res) => {
  const userMsg = req.body.userRequest?.utterance || "";

  const cleanMsg = userMsg.replace(/\s/g, "").toLowerCase();

  let result = faqData.find(item => {
    if (!item.question) return false;

    const cleanQ = item.question.replace(/\s/g, "").toLowerCase();

    // 질문 매칭
    if (cleanMsg.includes(cleanQ)) return true;

    // 키워드 매칭
    if (item.keywords.some(k =>
      cleanMsg.includes(k.replace(/\s/g, "").toLowerCase())
    )) return true;

    return false;
  });

  // ✅ 매칭 실패 시 기본값
  if (!result) {
    result = {
      answer: "❗ 관련 답변을 찾지 못했습니다.",
      link1: "https://example.com",
      link2: "https://example.com"
    };
  }

  res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: "📌 안내",
            description: result.answer || "내용 없음",
            buttons: [
              {
                label: "👉 나무 앱",
                action: "webLink",
                webLinkUrl: result.link1 || "https://example.com"
              },
              {
                label: "👉 N2 앱",
                action: "webLink",
                webLinkUrl: result.link2 || "https://example.com"
              }
            ]
          }
        }
      ]
    }
  });
});
