describe('RNBackgroundUploadExample', () => {
  const delay = t => new Promise(res => setTimeout(() => res(), t));

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should load the app', async () => {
    await expect(element(by.id('main_screen'))).toBeVisible();
  }, 20000);

  it('should handle a 502 request', async () => {
    const button = await element(by.id('5_sec_delay_button'));

    await button.tap();

    // arbitrary high number
    await delay(10000);

    const completed = await element(by.id('5_sec_delay_completed'));

    await expect(completed).toBeVisible();
  }, 20000);

  it('should handle a 200 request', async () => {
    const button = await element(by.id('10_sec_delay_button'));

    await button.tap();

    // arbitrary high number
    await delay(15000);

    const completed = await element(by.id('10_sec_delay_completed'));

    await expect(completed).toBeVisible();
  }, 30000);

  it('should cancel a 10sec upload', async () => {
    const button = await element(by.id('10_sec_delay_button'));

    await button.tap();

    await delay(1000);

    const cancelButton = await element(by.id('cancel_button'));

    await cancelButton.tap();

    // arbitrary high number
    await delay(12000);

    const completed = await element(by.id('10_sec_delay_completed'));

    await expect(completed).not.toBeVisible();
  }, 30000);
});
