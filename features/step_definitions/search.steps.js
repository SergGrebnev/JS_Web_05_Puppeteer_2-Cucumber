const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const { Given, When, Then, Before, After } = require("cucumber");
const {
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  clickSelector,
  getText,
} = require("../../lib/commands.js");

var { setDefaultTimeout } = require("@cucumber/cucumber");
setDefaultTimeout(60 * 1000);

Before(async function () {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  this.browser = browser;
  this.page = page;

  const daySelector = "a.page-nav__day"; //день в меню навигации
  const timeSelector = "a.movie-seances__time:not(.acceptin-button-disabled)"; //время сеанса
  const rowSelector = ".buying-scheme__row"; //ряд
  const chairSelector = ".buying-scheme__chair"; // стул
  const chairNotTakenSelector = ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)"; //стандартный не выбраный стул
  const chairVipNotTakenSelector = ".buying-scheme__chair_vip:not(.buying-scheme__chair_taken)"; //стандартный не выбраный стул
  const buttonSelector = "button.acceptin-button"; //кнопка (одинаковый на двух страницах)
  const takenSelector = "buying-scheme__chair_taken"; // !БЕЗ ТОЧКИ, класс занятого стула

  this.daySelector = daySelector;
  this.timeSelector = timeSelector;
  this.rowSelector = rowSelector;
  this.chairSelector = chairSelector;
  this.chairNotTakenSelector = chairNotTakenSelector;
  this.chairVipNotTakenSelector = chairVipNotTakenSelector;
  this.buttonSelector = buttonSelector;
  this.takenSelector = takenSelector;
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});

Given("Пользователь находится на странице {string}", async function (string) {
  return await this.page.goto(`https://qamid.tmweb.ru${string}`, {
    setTimeout: 10000,
  });
});

When("Пользователь выбирает день сеанса: {int}", async function (day) {
  const dayOfWeek = await selectOneElement(this.page, this.daySelector, day); //День недели
  console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
  await dayOfWeek.click();
});

When("Пользователь выбирает время сеанса: {int}", async function (time) {
  const seanceTime = await selectOneElement(this.page, this.timeSelector, time); //Время сеанса
  console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
  await seanceTime.click();
});

When("Открывается новая страница", async function () {
  await this.page.waitForNavigation(); //Ждём смены страницы
});

When("Пользователь выбирает ряд {int} и место {int}", async function (row, chair) {
  const selectedSeat = await selectChair(
    this.page,
    row,
    this.rowSelector,
    chair,
    this.chairSelector,
    true,
    this.takenSelector
  ); //Место определённое по ряду и стулу (true - пропускать занятые стулья)

  await clickElement(selectedSeat);
});

When("Нажатие кнопки подтверждения", async function () {
  await clickSelector(this.page, this.buttonSelector);
});

Then("Пользователь видит {string}", async function (string) {
  await this.page.waitForSelector(this.buttonSelector);
  const actual = await getText(this.page, this.buttonSelector);
  expect(actual).contains(string);
  await clickSelector(this.page, this.buttonSelector); // Без этого не уходит со страницы в следующем тесте
});

When("Случайный выбор даты", async function () {
  const dayOfWeek = await selectRandomElement(this.page, this.daySelector); //Cлучайный день недели
  console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
  await clickElement(dayOfWeek);
});

When("Случайный выбор времени", async function () {
  const seanceTime = await selectRandomElement(this.page, this.timeSelector); //Cлучайное время сеанса
  console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
  await clickElement(seanceTime);
});

When("Случайный выбор стандартного места", async function () {
  const freeChair = await selectRandomElement(this.page, this.chairNotTakenSelector); //Cлучайное свободное стандартное место (занятые (chair_takend) исключены)
  await clickElement(freeChair);
});

When("Случайный выбор VIP места", async function () {
  const freeVip = await selectRandomElement(this.page, this.chairVipNotTakenSelector); //Cлучайное свободное VIP место (занятые (chair_takend) исключены)
  await clickElement(freeVip);
});

Then("Кнопка подтверждения не активна", async function () {
  await this.page.waitForTimeout(1000);
  const actual = await this.page.$eval(this.buttonSelector, (link) => link.disabled);
  expect(actual).equal(true);
});
