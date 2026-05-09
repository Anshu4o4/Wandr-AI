import morgan from 'morgan';
import logger from '../utils/logger.js';

morgan.token('user-id', (req) => req.user?._id || 'unauthenticated');

const format = ':method :url :status :response-time ms - userId::user-id';

const requestLogger = morgan(format, {
  stream: {
    write: (message) => {
      const parts = message.trim().split(' ');
      const responseTime = parseFloat(parts[3]);
      const url = parts[1];

      // Log normal requests as http level
      logger.http(message.trim());

      // Log slow requests as warn level
      if (responseTime > 3000) {
        logger.warn('Slow request detected', { url, responseTime });
      }
    },
  },
});

export default requestLogger;
