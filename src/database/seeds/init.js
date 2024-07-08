const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users_organisation').del();
  await knex('organisations').del();
  await knex('users').del();

  // Generate user IDs
  const user1Id = uuidv4();
  const user2Id = uuidv4();

  // Insert users
  await knex('users').insert([
    {
      userId: user1Id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+1234567890',
    },
    {
      userId: user2Id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+1987654321',
    },
  ]);

  // Generate organization IDs
  const orgId1 = uuidv4();
  const orgId2 = uuidv4();
  const orgId3 = uuidv4();

  // Insert organizations
  await knex('organisations').insert([
    {
      orgId: orgId1,
      name: "John's Organization",
      description: "John Doe's default organization",
    },
    {
      
      orgId: orgId2,
      name: "Jane's Organization",
      description: "Jane Smith's default organization",
    },
    {
      orgId: orgId3,
      name: "Task Organization 1",
      description: "Task organization 1",
    },
  ]);

  // Insert into users_organisation (junction table)
  await knex('users_organisation').insert([
    { userId: user1Id, orgId: orgId1 },
    { userId: user1Id, orgId: orgId2 },
    { userId: user2Id, orgId: orgId2 },
    { userId: user2Id, orgId: orgId3 },
  ]);
};
