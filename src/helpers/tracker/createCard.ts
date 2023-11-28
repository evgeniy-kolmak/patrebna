import Chromium from 'chrome-aws-lambda';
import nodeHtmlToImage from 'node-html-to-image';
import { ITrack } from '../tasks/trackEvropochta';

export const createTrackCard = async ({
  trackNumber,
  infoPoint,
  comment,
}: Omit<ITrack, 'lengthPath'>): Promise<void> => {
  await nodeHtmlToImage({
    output: `assets/track-card--${trackNumber}.jpg`,
    html: `<html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap"
        rel="stylesheet"
      />
    </head>
    <body style="max-width: 500px; height: 230px; background: linear-gradient(to right, #4e54c8, #8f94fb); font-family: 'Roboto', sans-serif; margin: 0; padding: 0">
      <div style="padding: 30px;">
        <span style="display: block; margin-bottom: 8px; color: #ffffff; drop-shadow: 0 4px 24px rgba(51,51,51,.3); font-size: 35px; font-weight: 600;">${trackNumber}</span>
        <span style="color: #ebe8ff; drop-shadow: 0 4px 24px rgba(51,51,51,.2); font-size: 22px; font-weight: 300; margin-bottom: 14px">${
          comment ? comment : ''
        }</span>
        <p style="color: #ffffff; drop-shadow: 0 4px 24px rgba(51,51,51,.2); font-size: 16px; line-height: 120%;">${infoPoint}</p>
      </div>
    </body>
  </html>
  `,
    puppeteerArgs: {
      args: Chromium.args,
      executablePath: '/usr/bin/chromium-browser',
    },
  });
};
