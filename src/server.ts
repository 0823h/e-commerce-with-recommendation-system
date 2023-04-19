import app from '@express';
import models from '@models';
import db from './configs/database';
import CF from './api/v2/utils/collaborative_filtering';

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  try {
    await db.sequelize?.sync({ alter: true });
    await models.associate?.();
    console.log('✅ Database connected!');
    console.log(`🚀 Server listening on port: ${PORT}`);
  } catch (error) {
    console.log('Failed to start server!');
    console.log(error);
  }
});
