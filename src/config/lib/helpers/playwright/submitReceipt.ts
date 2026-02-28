import { chromium } from 'playwright';
import { TelegramService } from 'config/telegram/telegramServise';
import { readFile } from 'fs/promises';

const targetUrl = 'https://npd.nalog.gov.by/npdweb/';
const login = process.env.LOGIN_NPD ?? '';
const password = process.env.PASSWORD_NPD ?? '';

export async function submitReceipt(
  userId: number,
  note: string,
  amount: string,
): Promise<void> {
  const filename = `Чек_${userId}_${new Date().toLocaleDateString('ru-RU')}_${amount}BYN.pdf`;
  const interval = setInterval(() => {
    void TelegramService.sendChatAction(userId);
  }, 4000);
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto(targetUrl);
  await page.click('button[aria-label="Войти в учетную запись"]');
  await page.fill('input[id="login"]', login);
  await page.fill('input[id="password"]', password);
  await page.click('button[aria-label="Войти"]');
  await page.waitForTimeout(3000);
  const closeButton = page.locator('button:has-text("Закрыть")');
  if (await closeButton.count()) await closeButton.click();
  await page.click('button[aria-label="Новый чек"]');
  await page.fill('textarea[id="note"]', note);
  await page.fill('input[id="amount"]', amount);
  await page.click('button[aria-label="Безналичный расчёт"]');
  await page.click('button:has-text("Подтверждаю")');
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Получить чек в PDF")');
  await page.click('button:has-text("Узкий формат (80мм)")');
  const download = await downloadPromise;
  const filePath = await download.path();
  const buffer = await readFile(filePath);
  clearInterval(interval);
  await TelegramService.sendDocument(userId, buffer, note, filename);
  await browser.close();
}
