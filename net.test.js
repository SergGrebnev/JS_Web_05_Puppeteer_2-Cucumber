const {
  searchAllElements,
  selectOneElement,
  selectRandomElement,
  clickElement,
  putText,
  getText,
} = require("./lib/commands.js");
const { generateName } = require("./lib/util.js");

let page;

beforeEach(async () => {
  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
});

afterEach(() => {
  page.close();
});

describe("Ticket Booking Test", () => {
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("https://qamid.tmweb.ru/client/payment.php");
  });

  test("Positive test 1", async () => {
    const title = await page.title();
    console.log("Page title: " + title);
    console.log("this 1 : " + this);
    console.log("видимость функции 1 : " + searchAllElements);
    const DayOfWeek = await selectRandomElement(page, "a.page-nav__day", 1); //Cлучайный день недели
    let day = await DayOfWeek.evaluate((el) => el.textContent);
    console.log("Бронирование билета на: " + day);
    await DayOfWeek.click();
    // const title2 = await page.title();
    // console.log("Page title: " + title2);
    // const pageList = await browser.newPage();
    // await pageList.goto("https://netology.ru/navigation");
    // await pageList.waitForSelector("h1");
  });
});

// describe("Netology.ru tests", () => {
//   beforeEach(async () => {
//     page = await browser.newPage();
//     await page.goto("https://netology.ru");
//   });

//   test("The first test'", async () => {
//     const title = await page.title();
//     console.log("Page title: " + title);
//     await clickElement(page, "header a + a");
//     const title2 = await page.title();
//     console.log("Page title: " + title2);
//     const pageList = await browser.newPage();
//     await pageList.goto("https://netology.ru/navigation");
//     await pageList.waitForSelector("h1");
//   });

//   test("The first link text 'Медиа Нетологии'", async () => {
//     const actual = await getText(page, "header a + a");
//     expect(actual).toContain("Медиа Нетологии");
//   });

//   test("The first link leads on 'Медиа' page", async () => {
//     await clickElement(page, "header a + a");
//     const actual = await getText(page, ".logo__media");
//     await expect(actual).toContain("Медиа");
//   });
// });

// test("Should look for a course", async () => {
//   await page.goto("https://netology.ru/navigation");
//   await putText(page, "input", "тестировщик");
//   const actual = await page.$eval("a[data-name]", (link) => link.textContent);
//   const expected = "Тестировщик ПО";
//   expect(actual).toContain(expected);
// });

// test("Should show warning if login is not email", async () => {
//   await page.goto("https://netology.ru/?modal=sign_in");
//   await putText(page, 'input[type="email"]', generateName(5));
// });
