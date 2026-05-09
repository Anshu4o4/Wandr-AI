import mongoose from 'mongoose';

/**
 * @desc    Get health check data
 * @route   GET /api/v1/health
 * @access  Public
 */
export const getHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    const status = dbStatus === 'connected' ? 'ok' : 'down';
    
    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime) + 's',
      services: {
        database: dbStatus,
        memory: {
          used: `${usedMemory}MB`,
          total: `${totalMemory}MB`,
          percent: `${memoryPercent}%`
        }
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    if (status === 'ok') {
      res.status(200).json(healthData);
    } else {
      res.status(503).json(healthData);
    }
  } catch (error) {
    res.status(503).json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};
