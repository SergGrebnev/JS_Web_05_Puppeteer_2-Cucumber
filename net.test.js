const {
  searchAllElements,
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  putText,
  getText,
} = require("./lib/commands.js");
const { generateName } = require("./lib/util.js");

let page;
const daySelector = "a.page-nav__day"; //день в меню навигации
const timeSelector = "a.movie-seances__time:not(.acceptin-button-disabled)"; //время сеанса
const rowSelector = ".buying-scheme__row"; //ряд
const chairSelector = ".buying-scheme__chair"; // стул
const buttonSelector = "button.acceptin-button"; //кнопка

beforeEach(async () => {
  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
});

afterEach(() => {
  page.close();
});

describe("Ticket Booking Test", () => {
  beforeEach(async () => {
    await page.goto("https://qamid.tmweb.ru/client/payment.php");
  });

  //----------------------------------
  test.only("Positive test. Booking by row and chair", async () => {
    const day = 3; // день(от 0 до 6)
    const time = 4; // время(начиная с 0)
    const row = 1; // ряд (начиная с 0)
    const chair = 1; // место (начиная с 0)

    const dayOfWeek = await selectOneElement(page, daySelector, day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    const seanceTime = await selectOneElement(page, timeSelector, time); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation(); //Ждём смены страницы

    const selectedChair = await selectChair(page, row, rowSelector, chair, chairSelector); //Выбранный ряд и место
    // console.log(
    //   "Классы стула из net.test.js: " +
    //     (await selectedChair.evaluate((el) => el.classList.contains("buying-scheme__chair_taken")))
    // );
    //buying-scheme__chair buying-scheme__chair_standart buying-scheme__chair_taken
    await selectedChair.click();

    await page.click(buttonSelector);
    await page.waitForNavigation(); //Ждём смены страницы

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await page.click(buttonSelector); // Без этого не уходит со страницы в следующем тесте
  });

  //----------------------------------
  test("Positive test. Booking by selected parameters", async () => {
    const day = 3; // день
    const time = 4; // время
    const chair = 5; // место (в перделах зала, начиная с 0)

    const dayOfWeek = await selectOneElement(page, "a.page-nav__day", day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    const seanceTime = await selectOneElement(
      page,
      "a.movie-seances__time:not(.acceptin-button-disabled)",
      time
    ); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation(); //Ждём смены страницы

    const freeChair = await selectOneElement(
      page,
      ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken):not(buying-scheme__chair_selected)",
      chair
    ); //Стандартное место (баг-места (chair_takend) исключены)
    await freeChair.click();

    await page.click("button.acceptin-button");
    //await page.waitForNavigation(); //Ждём смены страницы

    await page.waitForSelector("button.acceptin-button");
    const actual = await getText(page, "button.acceptin-button");
    await expect(actual).toContain("Получить код бронирования");
    await page.click("button.acceptin-button"); // Без этого не уходит со страницы в следующем тесте
  });

  //----------------------------------
  ////////!!! Не обрабатывается наличие селекторов стульев, являющихся легендой к зрительному залу
  test("Positive test. Booking with random parameters", async () => {
    //Выбор дня
    const dayOfWeek = await selectRandomElement(page, "a.page-nav__day"); //Cлучайный день недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    //Выбор времени сеанса
    const seanceTime = await selectRandomElement(
      page,
      "a.movie-seances__time:not(.acceptin-button-disabled)"
    ); //Cлучайное время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation(); //Ждём смены страницы

    //Выбор случайного стандартного места
    const freeChair = await selectRandomElement(
      page,
      ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken):not(buying-scheme__chair_selected)"
    ); //Cлучайное свободное стандартное место (баг-места (chair_takend) исключены)
    await freeChair.click();

    //Выбор случайного VIP места
    const freeVip = await selectRandomElement(
      page,
      ".buying-scheme__chair_vip:not(.buying-scheme__chair_takend):not(buying-scheme__chair_selected)"
    ); //Cлучайное свободное VIP место (баг-места (chair_takend) исключены)
    await freeVip.click();

    //await page.waitForSelector("button.acceptin-button");
    await page.click("button.acceptin-button");
    //await page.waitForNavigation(); //Ждём смены страницы

    await page.waitForSelector("button.acceptin-button");
    const actual = await getText(page, "button.acceptin-button");
    await expect(actual).toContain("Получить код бронирования");
    await page.click("button.acceptin-button"); // Без этого не уходит со страницы в следующем тесте
  });

  //----------------------------------
  test("Negative test. Cancel chair selection", async () => {
    const day = 2; // день
    const time = 1; // время
    const chairs = [5, 34, 22]; // места в зале (стулья)

    const dayOfWeek = await selectOneElement(page, "a.page-nav__day", day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    const seanceTime = await selectOneElement(
      page,
      "a.movie-seances__time:not(.acceptin-button-disabled)",
      time
    ); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation(); //Ждём смены страницы

    for (let i = 0; i < 2; i++) {
      // первая итерация - выбор стульев, вторая итерация - отмена выбора
      for (let chair of chairs) {
        const freeChair = await selectOneElement(
          page,
          ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken):not(buying-scheme__chair_selected)",
          chair
        ); //Стандартное место (баг-места (chair_takend) исключены)
        await freeChair.click();
      }
    }

    await page.waitForTimeout(1000);
    const actual = await page.$eval("button.acceptin-button", (link) => link.disabled);
    await expect(actual).toBe(true);

    await page.click("button.acceptin-button"); // Без этого не уходит со страницы в следующем тесте
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
