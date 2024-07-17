import('node-fetch').then(fetchModule => {
    const fetch = fetchModule.default;
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const fs = require('fs');
  
    async function start() {
      const weatherApiKey = "db928b98cbaf6c237b58dae8e3a905ee";
      const geminiApiKey = "AIzaSyBNKCDOXaLw_P5dOWHRNqhu0FxMiyYdFJ4";
  
      const genAI = new GoogleGenerativeAI(geminiApiKey);
  
      async function getWeather(location) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=metric&lang=kr`;
  
        try {
          const response = await fetch(weatherUrl);
          if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`날씨 데이터를 가져오는데 실패했습니다: ${errorDetails.message}`);
          }
          const weatherData = await response.json();
          const temperature = weatherData.main.temp;
          const weatherDescription = weatherData.weather[0].description;
          return `온도: ${temperature}도, 날씨: ${weatherDescription}`;
        } catch (error) {
          console.error(`날씨 데이터를 가져오는 중 오류 발생: ${error.message}`);
          throw error;
        }
      }
      
      

      async function getOutfitRecommendation(context) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `
            나이: ${context.age}, 성별: ${context.gender}, 키: ${context.height}cm, 몸무게: ${context.weight}kg
            상황: ${context.situation}인 ${context.location} 지역의 날씨에 적합한 옷을 간단하게 추천해주세요.
          `;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = await response.text();
  
          const recommendationStart = text.indexOf("추천:");
          if (recommendationStart !== -1) {
            text = text.substring(recommendationStart + 3).trim();
          }
  
          return text;
        } catch (error) {
          console.error("의상 추천 생성 중 오류 발생:", error.message);
          throw error;
        }
      }
  
      async function generateOutfitRecommendation(context) {
        try {
          const weather = await getWeather(context.location);
          const outfitRecommendations = await getOutfitRecommendation(context);
  
          console.log(`지역: ${context.location}, 날씨: ${weather}, 추천 의상: ${outfitRecommendations}`);
  
          const aiData = {
            weather: weather,
            codi: outfitRecommendations
          };
  
          fs.writeFile('ai.json', JSON.stringify(aiData, null, 2), 'utf8', (err) => {
            if (err) {
              console.error('ai.json 파일 쓰기 중 오류 발생:', err);
            } else {
              console.log('ai.json 파일이 성공적으로 작성되었습니다.');
            }
          });
        } catch (error) {
          console.error("오류:", error.message);
        }
      }
  
      fs.readFile('send.json', 'utf8', (err, data) => {
        if (err) {
          console.error('send.json 파일을 읽는 중 오류 발생:', err);
          return;
        }
  
        try {
          const context = JSON.parse(data);
          generateOutfitRecommendation(context);
        } catch (parseError) {
          console.error('JSON 데이터 파싱 중 오류 발생:', parseError);
        }
      });
    }
  
    start();
  }).catch(err => {
    console.error('node-fetch 모듈을 가져오는 중 오류 발생:', err);
  });
  