require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('./models/Route');

// [area, district, routeNumber, truckNumber, days, time, wasteType, feeLKR/month]
// NOTE: sample data for demo purposes - replace with official council data.
const data = [
  ['Colombo 01 - Fort', 'Colombo', 'CMC-01', 'WP-LA-1101', ['Mon', 'Wed', 'Fri'], '06:00 - 09:00', 'General & Recyclables', 1500],
  ['Colombo 03 - Kollupitiya', 'Colombo', 'CMC-03', 'WP-LA-1103', ['Tue', 'Thu', 'Sat'], '06:30 - 09:30', 'General & Recyclables', 1500],
  ['Colombo 07 - Cinnamon Gardens', 'Colombo', 'CMC-07', 'WP-LA-1107', ['Mon', 'Thu'], '07:00 - 10:00', 'General Waste', 1800],
  ['Dehiwala', 'Colombo', 'DMC-02', 'WP-LB-2202', ['Tue', 'Fri'], '06:00 - 09:00', 'General & Organic', 1200],
  ['Mount Lavinia', 'Colombo', 'DMC-05', 'WP-LB-2205', ['Wed', 'Sat'], '06:30 - 09:30', 'General & Organic', 1200],
  ['Nugegoda', 'Colombo', 'SJP-04', 'WP-LC-3304', ['Mon', 'Thu'], '07:00 - 10:00', 'General Waste', 1000],
  ['Kandy City', 'Kandy', 'KMC-01', 'CP-KA-4401', ['Mon', 'Wed', 'Fri'], '06:00 - 09:00', 'General & Organic', 1100],
  ['Peradeniya', 'Kandy', 'KMC-06', 'CP-KA-4406', ['Tue', 'Sat'], '07:00 - 10:00', 'Organic & Recyclables', 900],
  ['Galle Fort', 'Galle', 'GMC-01', 'SP-GA-5501', ['Daily'], '05:30 - 08:00', 'General & Recyclables (tourist zone)', 2000],
  ['Unawatuna', 'Galle', 'GMC-09', 'SP-GA-5509', ['Mon', 'Wed', 'Sat'], '06:00 - 09:00', 'General & Recyclables', 1600],
  ['Negombo', 'Gampaha', 'NMC-02', 'WP-GA-6602', ['Tue', 'Fri'], '06:00 - 09:00', 'General & Organic', 1300],
  ['Jaffna Town', 'Jaffna', 'JMC-01', 'NP-JA-7701', ['Mon', 'Thu'], '06:30 - 09:30', 'General Waste', 900],
  ['Ella', 'Badulla', 'ELA-01', 'UP-BD-8801', ['Wed', 'Sat'], '07:00 - 09:00', 'General & Recyclables (tourist zone)', 1400],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Route.deleteMany({});
  await Route.insertMany(
    data.map(([area, district, routeNumber, truckNumber, collectionDays, collectionTime, wasteType, fee]) => ({
      area, district, routeNumber, truckNumber, collectionDays, collectionTime, wasteType, fee,
    }))
  );
  console.log(`Seeded ${data.length} routes`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
