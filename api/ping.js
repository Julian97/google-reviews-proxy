module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(200).json({ 
    success: true,
    message: 'Ping successful! Fresh deployment working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    version: '2.0'
  });
};
