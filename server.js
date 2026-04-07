const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let faqData = [];

// 🔥 GitHub CSV 불러오기
async function loadCSV() {
  const url = "https://raw.githubusercontent.com/faq.csv";

  const response = await axios.get(url);
  const csv = response.data;

  const lines = csv.split("\n").slice(1);

  faqData = lines.map(line => {
    const [question, answer, link1, link2] = line.split(",");
    return { question, answer, link1, link2 };
  });

  console.log("✅ CSV 로드 완료");
}

// 서버 시작 시 1회 로드
loadCSV();

app.post("/chatbot", (req, res) => {
  const userMsg = req.body.userRequest.utterance;

  let result = faqData[0];

  faqData.forEach(item => {
    if (userMsg.includes(item.question)) {
      result = item;
    }
  });

  res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: "📌 안내",
            description: result.answer,
            buttons: [
              {
                label: "👉 나무 앱",
                action: "webLink",
                webLinkUrl: result.link1
              },
              {
                label: "👉 N2 앱",
                action: "webLink",
                webLinkUrl: result.link2
              }
            ]
          }
        }
      ]
    }
  });
});

app.listen(3000, () => {
  console.log("🚀 서버 실행됨");
});
