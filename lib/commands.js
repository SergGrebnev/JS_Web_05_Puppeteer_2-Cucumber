// Экспортируем нужные
module.exports = {
  //searchAllElements,
  selectOneElement,
  selectRandomElement,
  selectChair,
  getText,
};

//Поиск всех элементов странице по селектору
async function searchAllElements(page, selector) {
  try {
    await page.waitForSelector(selector);
    return await page.$$(selector);
  } catch (error) {
    throw new Error(`No elements found for selector: ${selector}`);
  }
}

//Выбор по порядковому номеру одного элемента из найденных на странице
async function selectOneElement(page, selector, number) {
  try {
    const elements = await searchAllElements(page, selector); //массив элементов найденных по селектору
    return await elements[number];
  } catch (error) {
    throw new Error(`Element number ${number} not selected`);
  }
}

//Выбор места по ряду и стулу
async function selectChair(page, row, rowSelector, chair, chairSelector, flagTaken, takenSelector) {
  // try {
  const selectRow = await selectOneElement(page, rowSelector, row); //выбран заданный ряд
  const seat = await selectOneElement(selectRow, chairSelector, chair); // найден стул в ряду
  // console.log(
  //   "Классы стула из commands.js: " +
  //     (await seat.evaluate((el) => el.classList.contains("buying-scheme__chair_taken")))
  // );
  if (flagTaken) {
    do {} while (await seat.evaluate((el) => el.classList.contains("buying-scheme__chair_taken")));
  }
  //await page.waitForTimeout(30000);
  return seat;
  // } catch (error) {
  //   throw new Error(`Seat in row ${row} and chair ${chair} not selected`);
  // }
}

//Выбор случайного элемента из найденных на странице по селектору
async function selectRandomElement(page, selector) {
  try {
    const elements = await searchAllElements(page, selector); //массив элементов найденных по селектору
    const numberOfElements = elements.length; //количество элементов
    console.log("Количество селекторов на странице: " + numberOfElements);
    const number = Math.floor(Math.random() * (numberOfElements - 1)); // вычисление случайного элемента
    return await elements[number];
  } catch (error) {
    throw new Error(`Random selection is not available for selector: ${selector}`);
  }
}

async function clickElement(page, selector) {
  try {
    await page.waitForSelector(selector);
    await page.click(selector);
  } catch (error) {
    throw new Error(`Selector is not clickable: ${selector}`);
  }
}

async function getText(page, selector) {
  try {
    await page.waitForSelector(selector);
    return await page.$eval(selector, (link) => link.textContent);
  } catch (error) {
    throw new Error(`Text is not available for selector: ${selector}`);
  }
}

async function putText(page, selector, text) {
  try {
    const inputField = await page.$(selector);
    await inputField.focus();
    await inputField.type(text);
    await page.keyboard.press("Enter");
  } catch (error) {
    throw new Error(`Not possible to type text for selector: ${selector}`);
  }
}
