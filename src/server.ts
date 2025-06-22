import colors from 'colors';

process.on('uncaughtException', (err) => {
  console.error(colors.bgRed.bold('Uncaught Exception! 💥 Shutting down...'));
  console.error(err);
  process.exit(1);
});

import app from './app.js';

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(colors.bgBlue.bold(`App listening on port ${port}`));
});

process.on('unhandledRejection', (err) => {
  console.error(colors.bgRed.bold('Unhandled Rejection! 💥 Shutting down...'));
  console.error(err);

  server.close(() => process.exit(1));
});
