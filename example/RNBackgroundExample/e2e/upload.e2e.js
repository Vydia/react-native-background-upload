const delay = t => new Promise(res => setTimeout(() => res(), t));

describe('TestApp', () => {
  let mainScreen;

  beforeAll(async () => {
    //await device.reloadReactNative();
    mainScreen = await element(by.id('main_screen'));
  });

  it('should load default screen', async () => {
    await expect(mainScreen).toExist();
  });

  it('should handle a 502 request', async () => {
    const button = await element(by.id('5_sec_delay_button'));

    await button.tap();

    await delay(10000);

    const completed = await element(by.id('5_sec_delay_completed'));

    await expect(completed).toBeVisible();
  });

  it('should handle a 200 request', async () => {
    const button = await element(by.id('10_sec_delay_button'));

    await button.tap();

    await delay(15000);

    const completed = await element(by.id('10_sec_delay_completed'));

    await expect(completed).toBeVisible();
  });
});
