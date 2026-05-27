import { PrismaClient, UserRole, ItemUnit, ServiceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@swiftshift.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@swiftshift.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.customer.upsert({
    where: { mobile: '9876543210' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      email: 'rajesh@example.com',
      address: '123, MG Road, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
  })

  await prisma.user.upsert({
    where: { email: 'rajesh@example.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      password: customerPassword,
      role: UserRole.CUSTOMER,
      customerId: customer.id,
    },
  })

  // Seed Item Masters
  const items = [
    { name: 'Carton Box Small', unit: ItemUnit.NOS, defaultRate: 25, description: 'Small packing carton 30x30x30 cm' },
    { name: 'Carton Box Medium', unit: ItemUnit.NOS, defaultRate: 40, description: 'Medium packing carton 45x45x45 cm' },
    { name: 'Carton Box Large', unit: ItemUnit.NOS, defaultRate: 60, description: 'Large packing carton 60x60x60 cm' },
    { name: 'Bubble Wrap', unit: ItemUnit.METER, defaultRate: 15, description: 'Standard bubble wrap roll' },
    { name: 'Stretch Film', unit: ItemUnit.ROLL, defaultRate: 120, description: 'Stretch film for furniture protection' },
    { name: 'Packing Tape', unit: ItemUnit.ROLL, defaultRate: 35, description: 'Heavy duty packing tape' },
    { name: 'Mattress Cover', unit: ItemUnit.NOS, defaultRate: 80, description: 'Plastic mattress protection cover' },
    { name: 'Sofa Cover', unit: ItemUnit.NOS, defaultRate: 150, description: 'Protective sofa cover' },
    { name: 'TV Box', unit: ItemUnit.NOS, defaultRate: 200, description: 'Specialized TV packing box' },
    { name: 'Foam Sheet', unit: ItemUnit.METER, defaultRate: 20, description: 'Protective foam sheeting' },
    { name: 'Packing Paper', unit: ItemUnit.KG, defaultRate: 30, description: 'Newsprint packing paper' },
    { name: 'Corner Protector', unit: ItemUnit.NOS, defaultRate: 10, description: 'Cardboard corner protectors' },
  ]

  for (const item of items) {
    await prisma.itemMaster.upsert({
      where: { id: item.name },
      update: {},
      create: item,
    })
  }

  const allItems = await prisma.itemMaster.findMany()

  // Seed Templates
  const template1BHK = await prisma.template.upsert({
    where: { id: '1bhk-standard' },
    update: {},
    create: {
      id: '1bhk-standard',
      name: '1BHK Standard',
      description: 'Standard packing for 1 bedroom apartment',
    },
  })

  const template2BHK = await prisma.template.upsert({
    where: { id: '2bhk-full' },
    update: {},
    create: {
      id: '2bhk-full',
      name: '2BHK Full Packing',
      description: 'Complete packing service for 2 bedroom apartment',
    },
  })

  const template3BHK = await prisma.template.upsert({
    where: { id: '3bhk-premium' },
    update: {},
    create: {
      id: '3bhk-premium',
      name: '3BHK Premium',
      description: 'Premium packing for 3 bedroom apartment',
    },
  })

  await prisma.template.upsert({
    where: { id: 'office-shifting' },
    update: {},
    create: {
      id: 'office-shifting',
      name: 'Office Shifting',
      description: 'Complete office relocation package',
    },
  })

  // Add template items
  const smallBox = allItems.find(i => i.name === 'Carton Box Small')
  const mediumBox = allItems.find(i => i.name === 'Carton Box Medium')
  const largeBox = allItems.find(i => i.name === 'Carton Box Large')
  const bubbleWrap = allItems.find(i => i.name === 'Bubble Wrap')
  const tape = allItems.find(i => i.name === 'Packing Tape')
  const mattressCover = allItems.find(i => i.name === 'Mattress Cover')

  if (smallBox && mediumBox && largeBox && bubbleWrap && tape && mattressCover) {
    const templateItems1BHK = [
      { templateId: template1BHK.id, itemId: smallBox.id, quantity: 10, rate: smallBox.defaultRate },
      { templateId: template1BHK.id, itemId: mediumBox.id, quantity: 8, rate: mediumBox.defaultRate },
      { templateId: template1BHK.id, itemId: bubbleWrap.id, quantity: 20, rate: bubbleWrap.defaultRate },
      { templateId: template1BHK.id, itemId: tape.id, quantity: 5, rate: tape.defaultRate },
      { templateId: template1BHK.id, itemId: mattressCover.id, quantity: 1, rate: mattressCover.defaultRate },
    ]

    for (const ti of templateItems1BHK) {
      await prisma.templateItem.create({ data: ti })
    }

    const templateItems2BHK = [
      { templateId: template2BHK.id, itemId: smallBox.id, quantity: 15, rate: smallBox.defaultRate },
      { templateId: template2BHK.id, itemId: mediumBox.id, quantity: 15, rate: mediumBox.defaultRate },
      { templateId: template2BHK.id, itemId: largeBox.id, quantity: 8, rate: largeBox.defaultRate },
      { templateId: template2BHK.id, itemId: bubbleWrap.id, quantity: 40, rate: bubbleWrap.defaultRate },
      { templateId: template2BHK.id, itemId: tape.id, quantity: 8, rate: tape.defaultRate },
      { templateId: template2BHK.id, itemId: mattressCover.id, quantity: 2, rate: mattressCover.defaultRate },
    ]

    for (const ti of templateItems2BHK) {
      await prisma.templateItem.create({ data: ti })
    }

    const templateItems3BHK = [
      { templateId: template3BHK.id, itemId: smallBox.id, quantity: 20, rate: smallBox.defaultRate },
      { templateId: template3BHK.id, itemId: mediumBox.id, quantity: 25, rate: mediumBox.defaultRate },
      { templateId: template3BHK.id, itemId: largeBox.id, quantity: 15, rate: largeBox.defaultRate },
      { templateId: template3BHK.id, itemId: bubbleWrap.id, quantity: 60, rate: bubbleWrap.defaultRate },
      { templateId: template3BHK.id, itemId: tape.id, quantity: 12, rate: tape.defaultRate },
      { templateId: template3BHK.id, itemId: mattressCover.id, quantity: 3, rate: mattressCover.defaultRate },
    ]

    for (const ti of templateItems3BHK) {
      await prisma.templateItem.create({ data: ti })
    }
  }

  // Seed Services
  const services = [
    { name: 'Local Household Shifting', type: ServiceType.LOCAL_SHIFT, description: 'Within city shifting', baseRate: 5000 },
    { name: 'Interstate Shifting', type: ServiceType.INTERSTATE, description: 'Between cities/states shifting', baseRate: 15000 },
    { name: 'International Relocation', type: ServiceType.INTERNATIONAL, description: 'International moving services', baseRate: 50000 },
    { name: 'Car Transportation', type: ServiceType.CAR_TRANSPORT, description: 'Safe car transport service', baseRate: 8000 },
    { name: 'Office Shifting', type: ServiceType.OFFICE_SHIFTING, description: 'Corporate office relocation', baseRate: 20000 },
    { name: 'Warehouse Storage', type: ServiceType.WAREHOUSE, description: 'Short/long term storage', baseRate: 3000 },
  ]

  for (const service of services) {
    await prisma.service.create({ data: service }).catch(() => {})
  }

  // Seed Trucks
  const trucks = [
    { registrationNo: 'KA-01-AB-1234', model: 'Tata 407', capacity: '2 Ton' },
    { registrationNo: 'KA-01-CD-5678', model: 'Ashok Leyland 909', capacity: '5 Ton' },
    { registrationNo: 'KA-02-EF-9012', model: 'Mahindra Bolero Pickup', capacity: '1.5 Ton' },
  ]

  for (const truck of trucks) {
    await prisma.truck.upsert({
      where: { registrationNo: truck.registrationNo },
      update: {},
      create: truck,
    })
  }

  // Seed Loaders
  const loaders = [
    { name: 'Ramu Kumar', mobile: '9876500001', dailyRate: 600 },
    { name: 'Suresh Babu', mobile: '9876500002', dailyRate: 600 },
    { name: 'Mahesh Singh', mobile: '9876500003', dailyRate: 700 },
  ]

  for (const loader of loaders) {
    await prisma.loader.upsert({
      where: { mobile: loader.mobile },
      update: {},
      create: loader,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('Admin login: admin@swiftshift.com / admin123')
  console.log('Customer login: rajesh@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
