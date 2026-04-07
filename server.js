const express = require("express");
const app = express();

app.use(express.json());

app.post("/chatbot", (req, res) => {
  const userMsg = req.body.userRequest.utterance;

  res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "테스트 성공: " + userMsg
          }
        }
      ]
    }
  });
});

app.listen(3000);
