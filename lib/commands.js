// Экспортируем нужные
module.exports = {
  //searchAllElements,
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  clickSelector,
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
  try {
    let takenStatus;
    let selectRow;
    let seat;
    do {
      selectRow = await selectOneElement(page, rowSelector, row); //выбран заданный ряд
      const numberOfChairs = (await searchAllElements(page, rowSelector)).length; // количество стульев в ряду
      seat = await selectOneElement(selectRow, chairSelector, chair); // найден стул в ряду
      if (flagTaken && chair < numberOfChairs - 1) {
        console.log(`Стул ${chair + 1} в ${row + 1} ряду занят, проверяю ${chair + 2} стул`);
        chair++;
      } else {
        console.log(`Перехожу на ${row + 2} ряд`);
        row++;
        chair = 0;
      }
      takenStatus = await seat.evaluate((el, taken) => el.classList.contains(taken), takenSelector); //true - если место занято
    } while (flagTaken && takenStatus);

    //await page.waitForTimeout(30000);
    return seat;
  } catch (error) {
    throw new Error(`Seat in row ${row} and chair ${chair} not selected`);
  }
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

async function clickElement(el) {
  try {
    await el.click();
  } catch (error) {
    throw new Error(`Element is not clickable: ${el}`);
  }
}

async function clickSelector(page, selector) {
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
