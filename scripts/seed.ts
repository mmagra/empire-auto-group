// Seeds demo data for local development and client previews.
//
//   npm run seed            -> creates a first admin if none exists + demo vehicles
//                              (fixed test password below; for previews only, never the real site)
//   npm run seed -- --clear -> removes the demo vehicles (stock numbers starting DEMO-)
import bcrypt from "bcryptjs";
// Uses the app's own client so the data folder and tables are set up the same way.
import { db } from "../src/lib/db";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DEMO = [
  { year: 2021, make: "Toyota", model: "RAV4", trim: "XLE AWD", bodyType: "SUV", price: 27995, mileage: 38210, exteriorColor: "Magnetic Gray", interiorColor: "Black", transmission: "Automatic", drivetrain: "AWD", fuelType: "Gasoline", engine: "2.5L 4-Cyl", featured: true, features: ["Backup Camera", "Apple CarPlay", "Android Auto", "Blind Spot Monitor", "Adaptive Cruise Control", "Heated Seats", "Power Liftgate"] },
  { year: 2019, make: "Honda", model: "Accord", trim: "Sport 1.5T", bodyType: "Sedan", price: 21495, salePrice: 20495, mileage: 52880, exteriorColor: "Crystal Black Pearl", interiorColor: "Black", transmission: "CVT", drivetrain: "FWD", fuelType: "Gasoline", engine: "1.5L 4-Cyl Turbo", featured: true, features: ["Backup Camera", "Apple CarPlay", "Android Auto", "Lane Keep Assist", "Alloy Wheels", "Push Button Start"] },
  { year: 2018, make: "Ford", model: "F-150", trim: "XLT SuperCrew 4x4", bodyType: "Truck", price: 29900, mileage: 71450, exteriorColor: "Oxford White", interiorColor: "Gray", transmission: "Automatic", drivetrain: "4WD", fuelType: "Gasoline", engine: "2.7L V6 Turbo", featured: true, features: ["Tow Package", "Backup Camera", "Bluetooth", "Remote Start", "Keyless Entry", "Alloy Wheels"] },
  { year: 2020, make: "Jeep", model: "Grand Cherokee", trim: "Limited 4x4", bodyType: "SUV", price: 28750, mileage: 47100, exteriorColor: "Diamond Black", interiorColor: "Black Leather", transmission: "Automatic", drivetrain: "4WD", fuelType: "Gasoline", engine: "3.6L V6", featured: true, features: ["Leather Seats", "Heated Seats", "Heated Steering Wheel", "Navigation", "Sunroof / Moonroof", "Remote Start", "Power Liftgate"] },
  { year: 2017, make: "Subaru", model: "Outback", trim: "2.5i Premium", bodyType: "Wagon", price: 16995, mileage: 88900, exteriorColor: "Wilderness Green", interiorColor: "Ivory", transmission: "CVT", drivetrain: "AWD", fuelType: "Gasoline", engine: "2.5L 4-Cyl", features: ["Heated Seats", "Backup Camera", "Bluetooth", "Alloy Wheels"] },
  { year: 2022, make: "Chevrolet", model: "Equinox", trim: "LT", bodyType: "SUV", price: 23495, mileage: 29340, exteriorColor: "Summit White", interiorColor: "Jet Black", transmission: "Automatic", drivetrain: "AWD", fuelType: "Gasoline", engine: "1.5L 4-Cyl Turbo", features: ["Apple CarPlay", "Android Auto", "Remote Start", "Backup Camera", "Lane Keep Assist"] },
  { year: 2016, make: "Nissan", model: "Altima", trim: "2.5 SV", bodyType: "Sedan", price: 11495, mileage: 96200, exteriorColor: "Gun Metallic", interiorColor: "Charcoal", transmission: "CVT", drivetrain: "FWD", fuelType: "Gasoline", engine: "2.5L 4-Cyl", status: "PENDING", features: ["Backup Camera", "Bluetooth", "Push Button Start", "Keyless Entry"] },
  { year: 2019, make: "BMW", model: "X3", trim: "xDrive30i", bodyType: "SUV", price: 26900, mileage: 54600, exteriorColor: "Alpine White", interiorColor: "Black SensaTec", transmission: "Automatic", drivetrain: "AWD", fuelType: "Gasoline", engine: "2.0L 4-Cyl Turbo", features: ["Navigation", "Heated Seats", "Leather Seats", "Sunroof / Moonroof", "Premium Audio", "Power Liftgate", "Backup Camera"] },
];

async function main() {
  if (process.argv.includes("--clear")) {
    const { count } = await db.vehicle.deleteMany({ where: { stockNumber: { startsWith: "DEMO-" } } });
    console.log(`Removed ${count} demo vehicles.`);
    return;
  }

  if ((await db.adminUser.count()) === 0) {
    const email = "admin@empireautogroupllc.com";
    // Easy, fixed test password so the Render preview login survives restarts.
    // Change before going live: the real site uses the first-run setup screen instead.
    const password = "Empire@1234";
    await db.adminUser.create({ data: { email, name: "Empire Admin", passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`\nCreated admin  ${email}`);
    console.log(`Password       ${password}\n`);
  }

  let n = 0;
  for (const [i, d] of DEMO.entries()) {
    const stockNumber = `DEMO-${101 + i}`;
    if (await db.vehicle.findFirst({ where: { stockNumber } })) continue;
    const { features, ...rest } = d;
    await db.vehicle.create({
      data: {
        status: "AVAILABLE",
        ...rest,
        stockNumber,
        slug: slugify(`${d.year} ${d.make} ${d.model} ${d.trim} ${stockNumber}`),
        features: JSON.stringify(features),
        description: `This ${d.year} ${d.make} ${d.model} ${d.trim} is a great-looking, well-kept vehicle. Inspected by our team and ready to go. Ask about financing help and trade-ins. Call 603-858-8844 or stop by 44 Manchester Road, Derry.`,
        createdAt: new Date(Date.now() - i * 86400000),
      },
    });
    n++;
  }
  console.log(`Added ${n} demo vehicles. Remove them later with: npm run seed -- --clear`);
}

main().finally(() => db.$disconnect());
