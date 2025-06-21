import colors from 'colors';
import app from './app.js';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(colors.bgBlue.bold(`App listening on port ${port}`));
});
