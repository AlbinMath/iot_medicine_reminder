const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Since we're not using MongoDB anymore, we'll store data in memory
let medicineLogs = [];
let complianceStats = {
  totalLogs: 0,
  complianceRate: 0,
  missedCount: 0,
  lateCount: 0,
  complianceCount: 0
};

// Routes

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for ESP32 to send data (kept for backward compatibility)
app.post('/api/medicine-log', (req, res) => {
  try {
    const { status, medicine, timestamp, date, time, device_id } = req.body;
    
    const logEntry = {
      status,
      medicine,
      timestamp: timestamp || Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toTimeString().split(' ')[0],
      device_id: device_id || 'ESP32_MED_REMINDER_001',
      createdAt: new Date()
    };
    
    medicineLogs.unshift(logEntry); // Add to beginning of array
    
    // Keep only the last 100 entries
    if (medicineLogs.length > 100) {
      medicineLogs = medicineLogs.slice(0, 100);
    }
    
    // Update stats
    updateStats(logEntry);
    
    console.log(`Medicine log saved: ${status} - ${medicine} at ${time}`);
    res.status(200).json({ message: 'Medicine log saved successfully' });
  } catch (error) {
    console.error('Error saving medicine log:', error);
    res.status(500).json({ error: 'Failed to save medicine log' });
  }
});

// Get all medicine logs
app.get('/api/medicine-logs', (req, res) => {
  try {
    res.json(medicineLogs);
  } catch (error) {
    console.error('Error fetching medicine logs:', error);
    res.status(500).json({ error: 'Failed to fetch medicine logs' });
  }
});

// Get medicine logs by date range
app.get('/api/medicine-logs/range', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filteredLogs = medicineLogs;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredLogs = medicineLogs.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate >= start && logDate <= end;
      });
    }
    
    res.json(filteredLogs);
  } catch (error) {
    console.error('Error fetching medicine logs by range:', error);
    res.status(500).json({ error: 'Failed to fetch medicine logs' });
  }
});

// Get compliance statistics
app.get('/api/compliance-stats', (req, res) => {
  try {
    res.json(complianceStats);
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    res.status(500).json({ error: 'Failed to fetch compliance statistics' });
  }
});

// Get recent alerts (missed medicines)
app.get('/api/recent-alerts', (req, res) => {
  try {
    const alerts = medicineLogs.filter(log => log.status === 'MISSED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    res.status(500).json({ error: 'Failed to fetch recent alerts' });
  }
});

// Helper function to update statistics
function updateStats(logEntry) {
  complianceStats.totalLogs = medicineLogs.length;
  
  const complianceCount = medicineLogs.filter(log => log.status === 'COMPLIANCE').length;
  const missedCount = medicineLogs.filter(log => log.status === 'MISSED').length;
  const lateCount = medicineLogs.filter(log => log.status === 'LATE').length;
  
  complianceStats.complianceCount = complianceCount;
  complianceStats.missedCount = missedCount;
  complianceStats.lateCount = lateCount;
  complianceStats.complianceRate = complianceStats.totalLogs > 0 ? 
    Math.round((complianceCount / complianceStats.totalLogs) * 100) : 0;
}

// Add some dummy data for testing
function addDummyData() {
  const dummyData = [
    {
      status: 'COMPLIANCE',
      medicine: 'MedA',
      timestamp: 1704067200,
      date: '2024-01-01',
      time: '09:00:00',
      device_id: 'ESP32_MED_REMINDER_001',
      createdAt: new Date('2024-01-01T09:00:00.000Z')
    },
    {
      status: 'COMPLIANCE',
      medicine: 'MedB',
      timestamp: 1704082200,
      date: '2024-01-01',
      time: '14:30:00',
      device_id: 'ESP32_MED_REMINDER_001',
      createdAt: new Date('2024-01-01T14:30:00.000Z')
    },
    {
      status: 'LATE',
      medicine: 'MedC',
      timestamp: 1704101700,
      date: '2024-01-01',
      time: '21:15:00',
      device_id: 'ESP32_MED_REMINDER_001',
      createdAt: new Date('2024-01-01T21:15:00.000Z')
    }
  ];
  
  medicineLogs = dummyData;
  dummyData.forEach(log => updateStats(log));
}

// Add dummy data on startup
addDummyData();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}`);
});