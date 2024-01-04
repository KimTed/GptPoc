const app = require('express').Router();
const openai = require('openai');
const axios = require('axios');

const apiKey = process.env.OPENAI_API_KEY;

const aiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
  }
});

const messages1 = (data) => {
  return {
    "role": "user",
    "content": `다음 문장들을 한문장으로 요약 해줘.  \n ${data}`
  }
}

const messages2 = (data) => {
  return {
    "role": "user",
    "content": `다음 문장들 중 긍정인 문장만 골라서 한문장으로 요약 해줘.  \n ${data}`
  }
};
const messages3 = (data) => {
  return {
    "role": "user",
    "content": `다음 문장들 중 긍정인 문장만 골라서 20자 내 한문장으로 요약 해줘.  \n ${data}`
  }
};
const messages3_1 = (data) => {
  return {
    "role": "user",
    "content": `다음 문장들 중 긍정인 문장만 골라서 20자 내 한문장으로 요약 해줘.  \n ${data}, 긍정적으로 요약해줘`
  }
};
const messages4 = (data) => {
  return {
    "role": "user",
    "content": `다음 문장들 중 긍정인 문장만 골라서 20자 내 존댓말 한문장으로 요약해줘.  \n ${data}`
  }
};

const callAi = (data, ver) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const MODEL_VER4 = "gpt-4-0613"
  const MODEL_VER3 = "gpt-3.5-turbo-1106"

  const param = {
    messages: [],
    temperature: 0.9,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"]
  }

  

  // verList.forEach(ver => {
    const modelV = (ver + "").substring(0, 1);
    parseInt(modelV) === 3 ? param.model = MODEL_VER3 : param.model = MODEL_VER4;
    
    ver = parseInt((ver + "").substring(1));
    switch (ver) {
      case 1:
        param.messages.push(messages1(data));
        break;
      case 2:
        param.messages.push(messages2(data));
        break;
      case 3:
        param.messages.push(messages3(data));
        break;
      case 31:
        param.messages.push(messages3_1(data));
        break;
      case 4:
        param.messages.push(messages4(data));
        break;
      default:
        break;
    }
  // });

  return aiClient.post(API_URL, param);
}

app.post('/onerow', async (req, res) => {
  try {
    const promiseList = [];
    const verList = req.body?.ver?.split(",")?.map(e => parseInt(e));

    for (let ver  of verList) {
      const resAi =  callAi(
        req.body['reviews'].join(","),
        ver
      );
      promiseList.push(resAi);
    }
    
    const result = await Promise.all(promiseList);
console.log(result)
    res.send(result.map(r=>r?.data?.choices).flat().map(e => e?.message.content));
  } catch (e) {
    console.error(e)
  }
});


module.exports = app;