let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      const { createApp } = await import('../src/server/app');
      cachedApp = createApp();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error('SERVERLESS STARTUP ERROR:', err);
    return res.status(500).json({
      error: 'Serverless initialization error',
      message: err?.message || String(err),
      stack: err?.stack,
    });
  }
}
