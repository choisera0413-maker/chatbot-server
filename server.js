const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// CSV 읽기
const csv = fs.readFileSync("faq.csv", "utf-8");
const lines = csv.split("\n").slice(1);

let faqData = [];

lines.forEach(line => {
  const [question, answer, link1, link2] = line.split(",");
  faqData.push({ question, answer, link1, link2 });
});

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

app.listen(3000);
