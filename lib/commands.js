module.exports = {
  //Поиск всех элементов странице по селектору
  searchAllElements: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$$(selector);
    } catch (error) {
      throw new Error(`No elements found for selector: ${selector}`);
    }
  },

  //Выбор одного элемента из найденных на странице по порядковому номеру
  selectOneElement: async function (page, selector, number) {
    try {
      //const elements = this.searchAllElements(page, selector); //массив элементов найденных по селектору
      const elements = (page, selector) =>
        this.searchAllElements(page, selector); //массив элементов найденных по селектору
      return await elements[number];
    } catch (error) {
      throw new Error(`Element number ${number} not selected`);
    }
  },

  //Выбор случайного элемента из найденных на странице по селектору кроме n первых (n=0 выбор из всех)
  selectRandomElement: async function (page, selector, n) {
    // try {

    console.log("this 2 : " + this);
    console.log("видимость функции 2 : " + this.searchAllElements);
    // await page.waitForSelector(selector);
    // elements = await page.$$(selector);
    const elements = await this.searchAllElements(page, selector); //массив элементов найденных по селектору
    console.log("Найденные элементы: " + elements);
    const numberOfElements = elements.length; //количество элементов
    console.log("Количество селекторов на странице: " + numberOfElements);
    // вычисление случайного элемента кроме n первых
    const number = Math.floor(n + Math.random() * (numberOfElements - 1 - n));
    return await elements[number];
    // } catch (error) {
    //   throw new Error(
    //     `Random selection is not available for selector: ${selector}`
    //   );
    // }
  },

  clickElement: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      await page.click(selector);
    } catch (error) {
      throw new Error(`Selector is not clickable: ${selector}`);
    }
  },
  getText: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (link) => link.textContent);
    } catch (error) {
      throw new Error(`Text is not available for selector: ${selector}`);
    }
  },
  putText: async function (page, selector, text) {
    try {
      const inputField = await page.$(selector);
      await inputField.focus();
      await inputField.type(text);
      await page.keyboard.press("Enter");
    } catch (error) {
      throw new Error(`Not possible to type text for selector: ${selector}`);
    }
  },
};
