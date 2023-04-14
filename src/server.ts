import app from '@express';
import models from '@models';

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  try {
    await models.associate?.();
    console.log('✅ Database connected!');
    console.log(`🚀 Server listening on port: ${PORT}`);
  } catch (error) {
    console.log('Failed to start server!');
    console.log(error);
  }
});
