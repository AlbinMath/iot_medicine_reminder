const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://albinmathew2026:albinmathew2026@freshecart.xcg2mqx.mongodb.net/?retryWrites=true&w=majority&appName=FresheCart';

// Medicine Log Schema
const medicineLogSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['COMPLIANCE', 'LATE', 'MISSED']
  },
  medicine: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  device_id: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MedicineLog = mongoose.model('MedicineLog', medicineLogSchema, 'iot_monitor');

async function addDummyData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await MedicineLog.deleteMany({});
    console.log('Cleared existing data');

    // Create dummy data with proper MongoDB ObjectIds
    const dummyData = [
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedA',
        timestamp: 1704067200, // 2024-01-01 09:00:00
        date: '2024-01-01',
        time: '09:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-01T09:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedB',
        timestamp: 1704082200, // 2024-01-01 14:30:00
        date: '2024-01-01',
        time: '14:30:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-01T14:30:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'LATE',
        medicine: 'MedC',
        timestamp: 1704101700, // 2024-01-01 21:15:00
        date: '2024-01-01',
        time: '21:15:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-01T21:15:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'MISSED',
        medicine: 'MedA',
        timestamp: 1704153600, // 2024-01-02 09:00:00
        date: '2024-01-02',
        time: '09:15:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-02T09:15:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedB',
        timestamp: 1704168600, // 2024-01-02 14:30:00
        date: '2024-01-02',
        time: '14:30:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-02T14:30:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedC',
        timestamp: 1704187800, // 2024-01-02 21:00:00
        date: '2024-01-02',
        time: '21:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-02T21:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedA',
        timestamp: 1704240000, // 2024-01-03 09:00:00
        date: '2024-01-03',
        time: '09:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-03T09:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'LATE',
        medicine: 'MedB',
        timestamp: 1704255600, // 2024-01-03 14:40:00
        date: '2024-01-03',
        time: '14:40:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-03T14:40:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'MISSED',
        medicine: 'MedC',
        timestamp: 1704274800, // 2024-01-03 21:00:00
        date: '2024-01-03',
        time: '21:15:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-03T21:15:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedA',
        timestamp: 1704326400, // 2024-01-04 09:00:00
        date: '2024-01-04',
        time: '09:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-04T09:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedB',
        timestamp: 1704341400, // 2024-01-04 14:30:00
        date: '2024-01-04',
        time: '14:30:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-04T14:30:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedC',
        timestamp: 1704360600, // 2024-01-04 21:00:00
        date: '2024-01-04',
        time: '21:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-04T21:00:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'LATE',
        medicine: 'MedA',
        timestamp: 1704412800, // 2024-01-05 09:00:00
        date: '2024-01-05',
        time: '09:07:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-05T09:07:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'MISSED',
        medicine: 'MedB',
        timestamp: 1704427800, // 2024-01-05 14:30:00
        date: '2024-01-05',
        time: '14:45:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-05T14:45:00.000Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'COMPLIANCE',
        medicine: 'MedC',
        timestamp: 1704447000, // 2024-01-05 21:00:00
        date: '2024-01-05',
        time: '21:00:00',
        device_id: 'ESP32_MED_REMINDER_001',
        createdAt: new Date('2024-01-05T21:00:00.000Z')
      }
    ];

    // Insert dummy data
    await MedicineLog.insertMany(dummyData);
    console.log('Dummy data added successfully!');
    console.log(`Added ${dummyData.length} dummy records`);

    // Display the data with proper formatting
    const logs = await MedicineLog.find().sort({ createdAt: -1 });
    console.log('\n=== DUMMY DATA IN DATABASE ===');
    logs.forEach((log, index) => {
      console.log(`\n${index + 1}. Record:`);
      console.log(`   "_id": "${log._id}",`);
      console.log(`   "status": "${log.status}",`);
      console.log(`   "medicine": "${log.medicine}",`);
      console.log(`   "timestamp": ${log.timestamp},`);
      console.log(`   "date": "${log.date}",`);
      console.log(`   "time": "${log.time}",`);
      console.log(`   "device_id": "${log.device_id}",`);
      console.log(`   "createdAt": "${log.createdAt.toISOString()}"`);
    });

    // Calculate statistics
    const totalLogs = logs.length;
    const complianceCount = logs.filter(log => log.status === 'COMPLIANCE').length;
    const missedCount = logs.filter(log => log.status === 'MISSED').length;
    const lateCount = logs.filter(log => log.status === 'LATE').length;
    const complianceRate = Math.round((complianceCount / totalLogs) * 100);

    console.log('\n=== STATISTICS ===');
    console.log(`Total Logs: ${totalLogs}`);
    console.log(`Compliance Rate: ${complianceRate}%`);
    console.log(`Compliance Count: ${complianceCount}`);
    console.log(`Missed Count: ${missedCount}`);
    console.log(`Late Count: ${lateCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Now refresh your dashboard at http://localhost:3000');

  } catch (error) {
    console.error('Error:', error);
  }
}

addDummyData();




