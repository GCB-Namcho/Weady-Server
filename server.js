const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

// view 엔진 설정
app.set('view engine', 'ejs');

let db;
const url = 'mongodb+srv://2023060:happy1060!@cluster0.gowbchn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

new MongoClient(url).connect().then((client) => {
  console.log('DB 연결 성공');
  db = client.db('weady');
}).catch((err) => {
  console.log(err);
});

// body-parser 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 세션 설정
app.use(session({
  secret: '암호화에 쓸 비번',
  resave: false,
  saveUninitialized: false,
}));

// Passport 초기화 및 세션 설정
app.use(passport.initialize());
app.use(passport.session());

// 기본 라우트
app.get('/', (req, res) => {
  res.send('굿');
});

// 로그인 페이지 라우트
app.get('/login', (req, res) => {
  res.render('login'); // .ejs 확장자는 생략 가능
});

// 회원가입 페이지 라우트
app.get('/signup', (req, res) => {
  res.render('signup'); // .ejs 확장자는 생략 가능
});

// Passport LocalStrategy 설정
passport.use(new LocalStrategy(async (username, password, done) => {
  let result;
  try {
    result = await db.collection('user').findOne({ username: username });
  } catch (error) {
    return done(error);
  }

  if (!result) {
    return done(null, false, { message: '아이디 DB에 없음' });
  }

  if (result.password === password) {
    return done(null, result);
  } else {
    return done(null, false, { message: '비번불일치' });
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.collection('user').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 로그인 처리 라우트
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  })(req, res, next);
});

// 회원가입 처리 라우트
app.post('/signup', async (req, res) => {
  const { username, password, age, gender, height, weight } = req.body;

  try {
    const existingUser = await db.collection('user').findOne({ username: username });

    if (existingUser) {
      return res.status(400).send('이미 사용 중인 아이디입니다.');
    }

    const result = await db.collection('user').insertOne({ username: username, password: password, age: age, gender: gender, height: height, weight: weight });
    res.redirect('/login'); // 회원가입 후 로그인 페이지로 이동
  } catch (error) {
    console.log(error);
    res.status(500).send('회원가입 중 오류가 발생했습니다.');
  }
});

app.post('/question', async (req, res) => {
    const { location, situation } = req.body;
    const existingUser = await db.collection('user').findOne({ username: "test" });
    const sendJson = {
        age : existingUser.age,
        gender : existingUser.gender,
        height : existingUser.height,
        weight : existingUser.weight,
        location : location,
        situation : situation
    }
    console.log(sendJson)
})
// 서버 시작
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
