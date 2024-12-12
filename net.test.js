const {
  searchAllElements,
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  clickSelector,
  putText,
  getText,
} = require("./lib/commands.js");
const { generateName } = require("./lib/util.js");

let page;
const daySelector = "a.page-nav__day"; //день в меню навигации
const timeSelector = "a.movie-seances__time:not(.acceptin-button-disabled)"; //время сеанса
const rowSelector = ".buying-scheme__row"; //ряд
const chairSelector = ".buying-scheme__chair"; // стул
const chairNotTakenSelector = ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)"; //стандартный не выбраный стул
const chairVipNotTakenSelector = ".buying-scheme__chair_vip:not(.buying-scheme__chair_taken)"; //стандартный не выбраный стул
const buttonSelector = "button.acceptin-button"; //кнопка (одинаковый на двух страницах)
const takenSelector = "buying-scheme__chair_taken"; // !БЕЗ ТОЧКИ, класс занятого стула

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
  test("Positive test. Booking by row and chair", async () => {
    const day = 3; // день(от 0 до 6)
    const time = 4; // время(начиная с 0)
    const row = 2; // ряд (начиная с 0)
    const chair = 8; // место (начиная с 0)
    const flagTaken = true; // true - пропускать занятые стулья

    const dayOfWeek = await selectOneElement(page, daySelector, day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    const seanceTime = await selectOneElement(page, timeSelector, time); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation(); //Ждём смены страницы

    const selectedSeat = await selectChair(
      page,
      row,
      rowSelector,
      chair,
      chairSelector,
      flagTaken,
      takenSelector
    ); //Место определённое по ряду и стулу

    await clickElement(selectedSeat);

    await clickSelector(page, buttonSelector);
    //await page.waitForNavigation(); //Ждём смены страницы
    await page.waitForTimeout(1_000);

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await clickSelector(page, buttonSelector); // Без этого не уходит со страницы в следующем тесте
  }, 120_000); // таймаут теста 120 сек.

  //----------------------------------
  test("Positive test. Booking by selected parameters", async () => {
    const day = 3; // день
    const time = 4; // время
    const chair = 5; // место (в перделах зала, начиная с 0)

    const dayOfWeek = await selectOneElement(page, daySelector, day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await clickElement(dayOfWeek);

    const seanceTime = await selectOneElement(page, timeSelector, time); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await clickElement(seanceTime);

    await page.waitForNavigation(); //Ждём смены страницы

    const freeChair = await selectOneElement(page, chairNotTakenSelector, chair); //Стандартное место (занятые места (chair_taken) исключены)
    await clickElement(freeChair);

    await clickSelector(page, buttonSelector);
    await page.waitForNavigation(); //Ждём смены страницы

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await clickSelector(page, buttonSelector); // Без этого не уходит со страницы в следующем тесте
  });

  //----------------------------------
  ////////!!! Не обрабатывается наличие селекторов стульев, являющихся легендой к зрительному залу
  test("Positive test. Booking with random parameters", async () => {
    //Выбор дня
    const dayOfWeek = await selectRandomElement(page, daySelector); //Cлучайный день недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await clickElement(dayOfWeek);

    //Выбор времени сеанса
    const seanceTime = await selectRandomElement(page, timeSelector); //Cлучайное время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await clickElement(seanceTime);

    await page.waitForNavigation(); //Ждём смены страницы

    //Выбор случайного стандартного места
    const freeChair = await selectRandomElement(page, chairNotTakenSelector); //Cлучайное свободное стандартное место (занятые (chair_takend) исключены)
    await clickElement(freeChair);

    //Выбор случайного VIP места
    const freeVip = await selectRandomElement(page, chairVipNotTakenSelector); //Cлучайное свободное VIP место (занятые (chair_takend) исключены)
    await clickElement(freeVip);

    await clickSelector(page, buttonSelector);
    await page.waitForNavigation(); //Ждём смены страницы

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await clickSelector(page, buttonSelector); // Без этого не уходит со страницы в следующем тесте
  });

  //----------------------------------
  test("Negative test. Cancel chair selection", async () => {
    const day = 2; // день
    const time = 1; // время
    const chairs = [5, 34, 22]; // места в зале (стулья)

    const dayOfWeek = await selectOneElement(page, daySelector, day); //День недели
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await clickElement(dayOfWeek);

    const seanceTime = await selectOneElement(page, timeSelector, time); //Время сеанса
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await clickElement(seanceTime);

    await page.waitForNavigation(); //Ждём смены страницы

    for (let i = 0; i < 2; i++) {
      // первая итерация - выбор стульев, вторая итерация - отмена выбора
      for (let chair of chairs) {
        const freeChair = await selectOneElement(page, chairNotTakenSelector, chair); //Стандартное место (занятые (chair_takend) исключены)
        await clickElement(freeChair);
      }
    }

    await page.waitForTimeout(1000);
    const actual = await page.$eval(buttonSelector, (link) => link.disabled);
    await expect(actual).toBe(true);
  });
});
