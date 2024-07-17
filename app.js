// app.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

let aiData = {}; // 파일 데이터를 저장할 변수
const aiFilePath = path.join(__dirname, 'ai.json'); // ai.json 파일 경로 설정

// cors 미들웨어 사용
app.use(cors());

// 파일 변경 감지 및 데이터 제공
async function watchFileChanges() {
  try {
    const rawData = await fs.readFile(aiFilePath, 'utf8');
    aiData = JSON.parse(rawData);
    console.log('Updated AI data:', aiData);
  } catch (err) {
    console.error('Error reading AI data file:', err);
  }
}

// 주기적으로 파일 감지
setInterval(watchFileChanges, 5000); // 5초마다 파일 변경 감지

// 클라이언트에 날씨 데이터 제공하는 엔드포인트
app.get('/api/weather', (req, res) => {
  res.json(aiData.weather); // 클라이언트에 데이터 전송
});

// 클라이언트에 코디 데이터 제공하는 엔드포인트 추가
app.get('/api/codi', (req, res) => {
  res.json(aiData.codi); // 클라이언트에 데이터 전송
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*
// App.js

import React, { useState, useEffect } from 'react';

function App() {
  const [weatherData, setWeatherData] = useState(null); // 날씨 데이터를 저장할 상태
  const [codiData, setCodiData] = useState(null); // 코디 정보를 저장할 상태
  const [error, setError] = useState(null); // 에러 메시지를 저장할 상태

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // 날씨 데이터 가져오기
      const weatherResponse = await fetch('http://localhost:3001/api/weather');
      if (!weatherResponse.ok) {
        throw new Error('Weather data - Network response was not ok');
      }
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // 코디 데이터 가져오기
      const codiResponse = await fetch('http://localhost:3001/api/codi');
      if (!codiResponse.ok) {
        throw new Error('Codi data - Network response was not ok');
      }
      const codiData = await codiResponse.json();
      setCodiData(codiData);

    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(error.message); // 에러 발생 시 에러 메시지 상태 업데이트
    }
  }

  return (
    <div className="App">
      <h1>Weather and Codi Data</h1>
      {error ? (
        <p>Error fetching data: {error}</p>
      ) : (
        <>
          {weatherData && (
            <div>
              <h2>Weather Data</h2>
              <p>{weatherData}</p>
            </div>
          )}

          {codiData && (
            <div>
              <h2>Codi Data</h2>
              <p>{codiData}</p>
            </div>
          )}

          {!weatherData && !codiData && <p>Loading...</p>}
        </>
      )}
    </div>
  );
}

export default App;

*/