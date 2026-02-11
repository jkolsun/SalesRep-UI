import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin users
  const admin1 = await prisma.user.upsert({
    where: { email: 'andrew@brightautomations.org' },
    update: {},
    create: {
      email: 'andrew@brightautomations.org',
      name: 'Andrew',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  const admin2 = await prisma.user.upsert({
    where: { email: 'jared@brightautomations.org' },
    update: {},
    create: {
      email: 'jared@brightautomations.org',
      name: 'Jared',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // Create sales reps
  const rep1 = await prisma.user.upsert({
    where: { email: 'sarah@brightautomations.org' },
    update: {},
    create: {
      email: 'sarah@brightautomations.org',
      name: 'Sarah Williams',
      role: 'REP',
      phone: '(555) 123-4567',
      status: 'ACTIVE',
    },
  })

  const rep2 = await prisma.user.upsert({
    where: { email: 'mike@brightautomations.org' },
    update: {},
    create: {
      email: 'mike@brightautomations.org',
      name: 'Mike Thompson',
      role: 'REP',
      phone: '(555) 234-5678',
      status: 'ACTIVE',
    },
  })

  console.log('Created users:', { admin1, admin2, rep1, rep2 })

  // Create a lead list
  const leadList = await prisma.leadList.create({
    data: {
      name: 'Phoenix Restoration Companies',
      industry: 'RESTORATION',
      totalLeads: 50,
      importedById: admin1.id,
    },
  })

  console.log('Created lead list:', leadList)

  // Create sample restoration leads
  const restorationCompanies = [
    { company: 'ServiceMaster Restore', contact: 'Michael Thompson', title: 'Operations Manager', city: 'Phoenix', state: 'AZ', subIndustry: 'Water Damage' },
    { company: 'PuroClean of Atlanta', contact: 'Sarah Williams', title: 'Business Development', city: 'Atlanta', state: 'GA', subIndustry: 'Fire & Smoke' },
    { company: 'Rainbow International', contact: 'James Brown', title: 'Owner', city: 'Denver', state: 'CO', subIndustry: 'Carpet Cleaning' },
    { company: 'SERVPRO of Downtown', contact: 'Emily Davis', title: 'Office Manager', city: 'Dallas', state: 'TX', subIndustry: 'Water Damage' },
    { company: 'Paul Davis Restoration', contact: 'Carlos Rodriguez', title: 'General Manager', city: 'Miami', state: 'FL', subIndustry: 'Storm Damage' },
    { company: 'Belfor Property Restoration', contact: 'Amanda Lee', title: 'Marketing Director', city: 'Houston', state: 'TX', subIndustry: 'Commercial' },
    { company: 'ATI Restoration', contact: 'Robert Chen', title: 'Owner', city: 'San Francisco', state: 'CA', subIndustry: 'Water Damage' },
    { company: 'DKI Services', contact: 'Jennifer Smith', title: 'Operations', city: 'Chicago', state: 'IL', subIndustry: 'Fire & Smoke' },
    { company: 'First Onsite', contact: 'David Wilson', title: 'Regional Manager', city: 'Seattle', state: 'WA', subIndustry: 'Commercial' },
    { company: 'Aftermath Services', contact: 'Lisa Anderson', title: 'Business Development', city: 'Portland', state: 'OR', subIndustry: 'Biohazard' },
    { company: 'Cotton Holdings', contact: 'Mark Taylor', title: 'VP Sales', city: 'Nashville', state: 'TN', subIndustry: 'Disaster Recovery' },
    { company: 'Blackmon Mooring', contact: 'Susan Martinez', title: 'Account Executive', city: 'Austin', state: 'TX', subIndustry: 'Water Damage' },
    { company: 'BMS CAT', contact: 'Chris Johnson', title: 'Owner', city: 'San Diego', state: 'CA', subIndustry: 'Fire & Smoke' },
    { company: 'Polygon US', contact: 'Amy White', title: 'Sales Manager', city: 'Boston', state: 'MA', subIndustry: 'Commercial' },
    { company: 'Rytech', contact: 'Kevin Brown', title: 'Franchise Owner', city: 'Las Vegas', state: 'NV', subIndustry: 'Water Damage' },
    { company: 'AdvantaClean', contact: 'Michelle Lee', title: 'Office Manager', city: 'Charlotte', state: 'NC', subIndustry: 'Mold Remediation' },
    { company: 'Steamatic', contact: 'Brian Davis', title: 'Owner', city: 'Minneapolis', state: 'MN', subIndustry: 'Water Damage' },
    { company: '1-800 WATER DAMAGE', contact: 'Rachel Green', title: 'Marketing', city: 'Indianapolis', state: 'IN', subIndustry: 'Water Damage' },
    { company: 'Coit Cleaning', contact: 'Tom Harris', title: 'Regional Director', city: 'Salt Lake City', state: 'UT', subIndustry: 'Carpet Cleaning' },
    { company: 'Restoration 1', contact: 'Karen Miller', title: 'Franchise Owner', city: 'Tampa', state: 'FL', subIndustry: 'Water Damage' },
  ]

  for (let i = 0; i < restorationCompanies.length; i++) {
    const company = restorationCompanies[i]
    const phone = `${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`

    await prisma.lead.create({
      data: {
        companyName: company.company,
        contactName: company.contact,
        contactTitle: company.title,
        phone: phone,
        email: `${company.contact.toLowerCase().replace(' ', '.')}@${company.company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        industry: 'RESTORATION',
        subIndustry: company.subIndustry,
        city: company.city,
        state: company.state,
        timezone: 'America/New_York',
        status: i < 5 ? 'ASSIGNED' : 'NEW',
        assignedToId: i < 3 ? rep1.id : i < 5 ? rep2.id : null,
        source: 'CSV_IMPORT',
        priority: i < 5 ? 'HOT' : i < 10 ? 'WARM' : 'COLD',
        leadListId: leadList.id,
      },
    })
  }

  console.log(`Created ${restorationCompanies.length} sample leads`)

  // Create default settings
  await prisma.settings.upsert({
    where: { key: 'company' },
    update: {},
    create: {
      key: 'company',
      value: {
        name: 'Bright Automations',
        timezone: 'America/Los_Angeles',
      },
    },
  })

  await prisma.settings.upsert({
    where: { key: 'dailyTargets' },
    update: {},
    create: {
      key: 'dailyTargets',
      value: {
        dials: 80,
        connects: 15,
        demos: 3,
      },
    },
  })

  await prisma.settings.upsert({
    where: { key: 'commissionRules' },
    update: {},
    create: {
      key: 'commissionRules',
      value: [
        { type: 'DEMO_BOOKED', amount: 150, description: 'Per qualified demo scheduled', enabled: true },
        { type: 'DEMO_COMPLETED', amount: 50, description: 'Bonus when demo is completed', enabled: true },
        { type: 'CLOSE', amount: 500, description: 'Per closed deal', enabled: true },
        { type: 'RESIDUAL', amount: 5, description: '5% monthly recurring for 12 months', enabled: false },
      ],
    },
  })

  console.log('Created default settings')

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
