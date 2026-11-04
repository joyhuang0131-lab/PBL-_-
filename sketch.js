// ===================================================
// 全局變數宣告
// ===================================================

// 測驗題目資料庫（教育心理學 認知主義簡易測驗，共5題）
const quizData = [
  {
    question: "1. 認知心理學主要研究人類的什麼過程？",
    options: ["A. 經典條件反射與刺激回應", "B. 訊息處理與內部心理過程", "C. 潛意識衝突與防衛機制", "D. 觀察學習與榜樣模仿"],
    correct: 1
  },
  {
    question: "2. 皮亞傑（Piaget）提出兒童認知發展的第二個階段是什麼？",
    options: ["A. 感官動作期 (Sensorimotor)", "B. 具體運思期 (Concrete Operational)", "C. 前運思期 (Preoperational)", "D. 形式運思期 (Formal Operational)"],
    correct: 2
  },
  {
    question: "3. 提出「鷹架理論 (Scaffolding)」與「最近發展區 (ZPD)」的學者是？",
    options: ["A. 維高斯基 (Vygotsky)", "B. 斯金納 (Skinner)", "C. 班杜拉 (Bandura)", "D. 奧蘇貝爾 (Ausubel)"],
    correct: 0
  },
  {
    question: "4. 人類訊息處理模型中，容量極有限且維持時間約 15-30 秒的是？",
    options: ["A. 感官記憶 (Sensory Memory)", "B. 短期/工作記憶 (Short-term/Working)", "C. 長期記憶 (Long-term Memory)", "D. 內隱記憶 (Implicit Memory)"],
    correct: 1
  },
  {
    question: "5. 奧蘇貝爾（Ausubel）提倡的「有意義學習」核心概念是什麼？",
    options: ["A. 嘗試錯誤法 (Trial and Error)", "B. 前導組織 (Advance Organizer)", "C. 代幣制度 (Token Economy)", "D. 隨機強化 (Random Reinforcement)"],
    correct: 1
  }
];

let currentQuestion = 0;   // 當前題目索引 (0 到 4)
let score = 0;             // 答對總題數
let selectedOption = -1;   // 使用者點選的選項 (-1 表示尚未選擇)
let answered = false;       // 當前題目是否已回答

// 響應式版面佈局尺寸與邊界
let layoutParams = {};     // 儲存動態計算的字體大小與間距
let optionButtons = [];    // 儲存四個選項按鈕的位置範圍
let nextBtnBounds = {};    // 下一題按鈕的位置範圍

// 動畫與特效變數
let confettiParticles = []; // 彩帶粒子陣列
let explosionSparks = [];   // 爆炸火花陣列
let animTimer = 0;          // 動畫計時器

// ===================================================
// p5.js 設定與主循環
// ===================================================

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定 p5.js 文字繪製字體 (優先使用 Redaction 35，中文則自動對應 Noto Serif TC)
  textFont("'Redaction 35', 'Noto Serif TC', serif");
  
  // 設定文字對齊與繪圖模式
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  
  // 計算響應式版面尺寸與按鈕邊界
  calculateLayout();
}

function windowResized() {
  // 當瀏覽器視窗大小改變時（包含手機旋轉橫/直向），自動重新調整畫布與佈局
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function draw() {
  // 1. 設定背景顏色 (HEX: #ffafcc)
  background('#ffafcc');
  
  // 更新計時器用於選項浮動與晃動計算
  animTimer += 0.05;

  // 2. 判斷是否已完成所有題目
  if (currentQuestion < quizData.length) {
    drawQuizScreen();
  } else {
    drawResultScreen();
  }

  // 3. 更新並繪製動態特效 (彩帶與爆炸符號)
  updateAndDrawParticles();
}

// ===================================================
// 響應式版面配置計算 (Responsive Layout Calculation)
// ===================================================

function calculateLayout() {
  optionButtons = [];

  // 根據視窗寬高動態調配元件大小與字體
  let minDim = min(width, height);
  let isLandscapeMobile = (width > height) && (height < 500); // 判斷是否為手機橫向模式

  // 動態設定字體大小
  layoutParams.titleSize = constrain(minDim * 0.04, 14, 20);
  layoutParams.questionSize = constrain(minDim * 0.045, 16, 24);
  layoutParams.optionTextSize = constrain(minDim * 0.035, 13, 18);
  
  // 動態設定選項按鈕尺寸
  let btnWidth = min(width * 0.88, 650);
  
  // 手機橫態特別縮減高度以防擠壓出畫面
  let btnHeight = isLandscapeMobile ? constrain(height * 0.11, 36, 50) : constrain(height * 0.08, 44, 65);
  let spacing = isLandscapeMobile ? btnHeight * 1.25 : btnHeight * 1.28;
  
  // 計算起始 Y 座標
  let startY = isLandscapeMobile ? height * 0.28 : height * 0.28;

  // 計算 4 個選項區域
  for (let i = 0; i < 4; i++) {
    optionButtons.push({
      x: width / 2 - btnWidth / 2,
      y: startY + i * spacing,
      w: btnWidth,
      h: btnHeight
    });
  }

  // 計算「下一題」按鈕區域
  let nextWidth = min(width * 0.5, 220);
  let nextHeight = constrain(height * 0.07, 40, 55);
  let lastBtnY = optionButtons[3].y + btnHeight;
  
  nextBtnBounds = {
    x: width / 2 - nextWidth / 2,
    y: min(lastBtnY + (isLandscapeMobile ? 10 : 20), height - nextHeight - 15),
    w: nextWidth,
    h: nextHeight
  };
}

// ===================================================
// 畫面繪製邏輯
// ===================================================

// 繪製測驗主介面
function drawQuizScreen() {
  let q = quizData[currentQuestion];

  // 繪製頂部進度 (例如：第 1 / 5 題)
  fill(50);
  noStroke();
  textSize(layoutParams.titleSize);
  text(`第 ${currentQuestion + 1} / ${quizData.length} 題`, width / 2, height * 0.08);

  // 繪製題目文字 (包含範圍自動適應與調排)
  textSize(layoutParams.questionSize);
  textStyle(BOLD);
  fill(30);
  let maxQWidth = min(width * 0.9, 700);
  text(q.question, width / 2 - maxQWidth / 2, height * 0.13, maxQWidth, height * 0.12);
  textStyle(NORMAL);

  // 繪製四個選項
  for (let i = 0; i < 4; i++) {
    let btn = optionButtons[i];
    let drawX = btn.x;
    let drawY = btn.y;
    let bgColor = color(255); // 預設選項背景顏色：白色

    // 檢查作答狀態並應用動畫與顏色
    if (answered) {
      if (i === q.correct) {
        // 【正確答案選項】：加上 76c893 背景顏色，並上下移動
        bgColor = color('#76c893');
        drawY += sin(animTimer * 4) * 6; // 上下震盪浮動效果
      } else if (i === selectedOption && selectedOption !== q.correct) {
        // 【答錯的選項】：採用 e63946 背景顏色，並左右晃動
        bgColor = color('#e63946');
        drawX += sin(animTimer * 15) * 8; // 左右快速晃動效果
      }
    }

    // 繪製選項卡片外框與背景
    stroke(200);
    strokeWeight(1);
    fill(bgColor);
    rect(drawX, drawY, btn.w, btn.h, 10);

    // 繪製選項文字 (左右貼齊，防止文字溢出)
    noStroke();
    fill(answered && i === selectedOption && selectedOption !== q.correct ? 255 : 40);
    textSize(layoutParams.optionTextSize);
    textAlign(LEFT, CENTER);
    text(q.options[i], drawX + 15, drawY + btn.h / 2, btn.w - 30);
    textAlign(CENTER, CENTER); // 恢復中央對齊模式
  }

  // 答題後顯示「下一題」按鈕
  if (answered) {
    fill('#3a86ff');
    noStroke();
    rect(nextBtnBounds.x, nextBtnBounds.y, nextBtnBounds.w, nextBtnBounds.h, 25);
    
    fill(255);
    textSize(layoutParams.optionTextSize * 1.1);
    textStyle(BOLD);
    text("下一題", width / 2, nextBtnBounds.y + nextBtnBounds.h / 2);
    textStyle(NORMAL);
  }
}

// 繪製最後結算畫面
function drawResultScreen() {
  fill(40);
  textSize(layoutParams.questionSize * 1.5);
  textStyle(BOLD);
  text("測驗結束！", width / 2, height * 0.3);

  textSize(layoutParams.questionSize * 1.2);
  fill('#2a9d8f');
  text(`您的最終得分：${score} / ${quizData.length}`, width / 2, height * 0.45);

  // 評語顯示
  textSize(layoutParams.optionTextSize * 1.2);
  fill(80);
  let feedback = score === 5 ? "太棒了！您對認知主義完全掌握！" : "再接再厲！繼續加油！";
  text(feedback, width / 2, height * 0.58);
}

// ===================================================
// 事件處理 (滑鼠點擊與觸控支援)
// ===================================================

function mousePressed() {
  // 若已結束測驗則忽略點擊
  if (currentQuestion >= quizData.length) return;

  // 1. 尚未答題時：判斷點擊哪一個選項
  if (!answered) {
    for (let i = 0; i < 4; i++) {
      let btn = optionButtons[i];
      if (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h) {
        
        selectedOption = i;
        answered = true;

        let correctOpt = quizData[currentQuestion].correct;
        
        if (selectedOption === correctOpt) {
          // 答對：增加分數並在選項位置冒出彩帶
          score++;
          spawnConfetti(btn.x + btn.w / 2, btn.y + btn.h / 2);
        } else {
          // 答錯：在答錯選項處產生爆炸，並在正確答案處冒出彩帶
          let wrongBtn = optionButtons[selectedOption];
          let correctBtn = optionButtons[correctOpt];
          
          spawnExplosion(wrongBtn.x + wrongBtn.w / 2, wrongBtn.y + wrongBtn.h / 2);
          spawnConfetti(correctBtn.x + correctBtn.w / 2, correctBtn.y + correctBtn.h / 2);
        }
        break;
      }
    }
  } 
  // 2. 已答題時：判斷是否點擊「下一題」按鈕
  else {
    if (mouseX > nextBtnBounds.x && mouseX < nextBtnBounds.x + nextBtnBounds.w &&
        mouseY > nextBtnBounds.y && mouseY < nextBtnBounds.y + nextBtnBounds.h) {
      
      // 切換至下一題，重置狀態與特效陣列
      currentQuestion++;
      answered = false;
      selectedOption = -1;
      confettiParticles = [];
      explosionSparks = [];
    }
  }
}

// ===================================================
// 特效產生與更新邏輯
// ===================================================

// 產生彩帶粒子 (對題或提示正確答案時使用)
function spawnConfetti(x, y) {
  let colors = ['#f72585', '#7209b7', '#3f37c9', '#4cc9f0', '#ffb703'];
  for (let i = 0; i < 50; i++) {
    confettiParticles.push({
      x: x,
      y: y,
      vx: random(-6, 6),
      vy: random(-10, -3),
      size: random(6, 12),
      c: color(random(colors)),
      life: 255
    });
  }
}

// 產生爆炸符號與火花粒子 (錯題時使用)
function spawnExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    let angle = random(TWO_PI);
    let speed = random(3, 9);
    explosionSparks.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(8, 20),
      c: color(random(['#e63946', '#ffb703', '#d62828'])),
      life: 255
    });
  }
}

// 更新並繪製粒子動畫
function updateAndDrawParticles() {
  // 1. 繪製並更新彩帶粒子
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    let p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // 重力效果
    p.life -= 4; // 漸漸消失

    noStroke();
    fill(red(p.c), green(p.c), blue(p.c), p.life);
    rect(p.x, p.y, p.size, p.size);

    if (p.life <= 0) confettiParticles.splice(i, 1);
  }

  // 2. 繪製並更新爆炸符號與火花
  for (let i = explosionSparks.length - 1; i >= 0; i--) {
    let s = explosionSparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 8;

    noStroke();
    fill(red(s.c), green(s.c), blue(s.c), s.life);
    ellipse(s.x, s.y, s.size, s.size);

    if (s.life <= 0) explosionSparks.splice(i, 1);
  }
}