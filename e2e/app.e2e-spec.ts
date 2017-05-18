import { PendulumWebClientPage } from './app.po';

describe('pendulum-web-client App', () => {
  let page: PendulumWebClientPage;

  beforeEach(() => {
    page = new PendulumWebClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
