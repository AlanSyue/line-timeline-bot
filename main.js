const puppeteer = require('puppeteer');

(async () => {
  const user = {
    "email" : `${line email}`, // LINE 登入帳號
    "password" : `${line password}` // LINE 登入密碼
    "lineId"   : `${line ID}` // LINE 官方帳號 id
  }

  const postData = {
    "imagePath" : `${imgPathArray}`, // 圖檔路徑 （ 需下載下來才能上傳 ) 格式為 Array
    "date" : `2020/10/20`, // 預約發文日期
    "time" : `10:20`, // 預約發文時間
    "content" `${postContent}`:  // 文字內容
  }

  // 開啟 browser
  const browser = await puppeteer.launch({
        headless: true
  });
  // 新增分頁
  const page = await browser.newPage();
  // 監聽 dialog 事件
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  await page.goto(`https://manager.line.biz/account/${user.lineId}`);

  await page.click('input[type="submit"]');

  await page.waitFor(2000); // stop 2s prevent too fast to redirect
  // login
  await page.waitForSelector('input[name="tid"]')
  await page.type("input[name='tid']", user.email)
  await page.waitFor(1000);
  await page.waitForSelector('input[name="tpasswd"]')
  await page.type('input[name="tpasswd"]', user.password)
  await page.waitFor(2000);
  await page.click('button[type="submit"]')
  await page.waitFor(5000);
  await page.goto(`https://manager.line.biz/account/${user.lineId}/timeline/create`);
  await page.waitForSelector("i[class='las la-image fa-3x']", {timeout:8000});

  // 輸入日期與時間
  await page.waitForSelector('input[name="datepicker"]')
  await page.click("input[name='datepicker']");
  await keyInDate(page, postData.date);
  await page.click("input[name='timepicker']");
  await keyInTime(page, postData.time)

  // 上傳照片
  await page.click("i[class='las la-image fa-3x']");
  await page.waitForSelector('label[class="custom-file-label text-left cursor-pointer"]')
  await uploadImage(postData.imagePath, page);

  // 建立文字
  await page.waitForSelector("div[class='form-control editor']");
  await page.type("div[class='form-control editor']", postData.content);
  console.log("type success");

  // 預約貼文
  await page.waitFor(2000);
  await page.click("button[class='btn btn-lg btn-primary px-5 mx-1']"); // 點擊貼文按鈕
  await page.waitForSelector("button[class='btn btn-lg rounded-0 flex-1 btn-primary']");
  await page.click("button[class='btn btn-lg rounded-0 flex-1 btn-primary']"); // 點擊預約按鈕

  browser.close();
  process.exit();
})();

// use fileChooser to upload images
const uploadImage = async (images, page) => {
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('label[class="custom-file-label text-left cursor-pointer"]'),
  ]);

  await fileChooser.accept(images);
}

// key in post date in datepicker
const keyInDate = async (page, date) => {
  date.split("").forEach(async (number, index) => {
    await page.keyboard.press(number);
    await page.keyboard.up(number);
    await page.waitFor(5);
  })
}

// key in post time in timepicker
const keyInTime = async (page, time) => {
  time.split("").forEach(async (number, index) => {
    await page.keyboard.press(number);
    await page.keyboard.up(number);
    await page.waitFor(5);
  })
}