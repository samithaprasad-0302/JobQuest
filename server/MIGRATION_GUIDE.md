# MongoDB to Sequelize Route Conversion Guide

## Overview
This guide helps you convert your Mongoose routes to Sequelize queries.

## Common Query Patterns

### 1. Finding a Single Record

**MongoDB (Mongoose):**
```javascript
const user = await User.findOne({ email: 'test@example.com' });
const user = await User.findById(userId);
```

**Sequelize:**
```javascript
const user = await User.findOne({ where: { email: 'test@example.com' } });
const user = await User.findByPk(userId);
```

---

### 2. Finding Multiple Records

**MongoDB (Mongoose):**
```javascript
const users = await User.find({ role: 'admin' });
const users = await User.find({}).limit(10).skip(20).sort({ createdAt: -1 });
```

**Sequelize:**
```javascript
const users = await User.findAll({ where: { role: 'admin' } });
const users = await User.findAll({
  limit: 10,
  offset: 20,
  order: [['createdAt', 'DESC']]
});
```

---

### 3. Creating Records

**MongoDB (Mongoose):**
```javascript
const user = new User({ email, firstName, lastName });
await user.save();

// Or directly:
const user = await User.create({ email, firstName, lastName });
```

**Sequelize:**
```javascript
const user = await User.create({
  email,
  firstName,
  lastName
});
```

---

### 4. Updating Records

**MongoDB (Mongoose):**
```javascript
const user = await User.findByIdAndUpdate(
  userId,
  { firstName, lastName },
  { new: true }
);

// Or:
user.firstName = firstName;
user.lastName = lastName;
await user.save();
```

**Sequelize:**
```javascript
const user = await User.findByPk(userId);
user.firstName = firstName;
user.lastName = lastName;
await user.save();

// Or directly:
await User.update(
  { firstName, lastName },
  { where: { id: userId } }
);
```

---

### 5. Deleting Records

**MongoDB (Mongoose):**
```javascript
await User.findByIdAndDelete(userId);
// Or:
await User.deleteOne({ email });
```

**Sequelize:**
```javascript
await User.destroy({ where: { id: userId } });
// Or:
await User.destroy({ where: { email } });
```

---

### 6. Counting Records

**MongoDB (Mongoose):**
```javascript
const count = await User.countDocuments({ role: 'admin' });
```

**Sequelize:**
```javascript
const count = await User.count({ where: { role: 'admin' } });
```

---

### 7. Checking if Record Exists

**MongoDB (Mongoose):**
```javascript
const exists = await User.exists({ email });
```

**Sequelize:**
```javascript
const user = await User.findOne({ where: { email } });
const exists = user !== null;
```

---

### 8. Pagination

**MongoDB (Mongoose):**
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const jobs = await Job.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });
  
const total = await Job.countDocuments(query);
const totalPages = Math.ceil(total / limit);
```

**Sequelize:**
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

const { count, rows: jobs } = await Job.findAndCountAll({
  where: query,
  limit,
  offset,
  order: [['createdAt', 'DESC']]
});

const totalPages = Math.ceil(count / limit);
```

---

### 9. Text Search (Full-Text Search)

**MongoDB (Mongoose):**
```javascript
const jobs = await Job.find({ $text: { $search: searchTerm } });
```

**Sequelize:**
```javascript
const { Op } = require('sequelize');

const jobs = await Job.findAll({
  where: {
    [Op.or]: [
      { title: { [Op.like]: `%${searchTerm}%` } },
      { description: { [Op.like]: `%${searchTerm}%` } },
      { skills: { [Op.like]: `%${searchTerm}%` } }
    ]
  }
});
```

---

### 10. Complex Filters

**MongoDB (Mongoose):**
```javascript
const query = { status: 'active' };

if (location) {
  query.location = new RegExp(location, 'i');
}

if (remote === 'true') {
  query.isRemote = true;
}

const jobs = await Job.find(query);
```

**Sequelize:**
```javascript
const { Op } = require('sequelize');

const query = { status: 'active' };

if (location) {
  query.location = { [Op.like]: `%${location}%` };
}

if (remote === 'true') {
  query.isRemote = true;
}

const jobs = await Job.findAll({ where: query });
```

---

### 11. Sorting

**MongoDB (Mongoose):**
```javascript
const jobs = await Job.find({})
  .sort({ createdAt: -1, salary: 1 });
```

**Sequelize:**
```javascript
const jobs = await Job.findAll({
  order: [
    ['createdAt', 'DESC'],
    ['salary', 'ASC']
  ]
});
```

---

### 12. JSON Field Updates (for skills, experience, etc.)

**MongoDB (Mongoose):**
```javascript
user.skills.push('JavaScript');
await user.save();

// Or remove:
user.skills.pull('JavaScript');
await user.save();
```

**Sequelize:**
```javascript
const { sequelize } = require('sequelize');

// Add to array:
user.skills = [...(user.skills || []), 'JavaScript'];
await user.save();

// Or use SQL function:
await User.update(
  {
    skills: sequelize.fn('JSON_ARRAY_APPEND', sequelize.col('skills'), '$', 'JavaScript')
  },
  { where: { id: userId } }
);
```

---

### 13. Relationships/Associations

**MongoDB (Mongoose):**
```javascript
const jobs = await Job.find({})
  .populate('company', 'name logo')
  .populate('postedBy', 'firstName lastName email');
```

**Sequelize:**
```javascript
const jobs = await Job.findAll({
  include: [
    { 
      association: 'company',
      attributes: ['name', 'logo']
    },
    {
      association: 'postedBy',
      attributes: ['firstName', 'lastName', 'email']
    }
  ]
});
```

---

### 14. Transactions

**MongoDB (Mongoose):**
```javascript
const session = await mongoose.startSession();
await session.startTransaction();

try {
  await User.create([{ email }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

**Sequelize:**
```javascript
const transaction = await sequelize.transaction();

try {
  await User.create({ email }, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

## Step-by-Step Route Conversion Example

### Before (Mongoose):
```javascript
router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'active' };
    if (search) query.$text = { $search: search };
    if (category) query.category = new RegExp(category, 'i');

    const jobs = await Job.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('company', 'name logo');

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### After (Sequelize):
```javascript
const { Op } = require('sequelize');
const { Job, Company } = require('../models');

router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    const query = { status: 'active' };
    
    if (search) {
      query[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (category) {
      query.category = { [Op.like]: `%${category}%` };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: query,
      include: [
        {
          model: Company,
          attributes: ['name', 'logo']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

## Important Notes

1. **Imports at the top of route files:**
   ```javascript
   const { Op } = require('sequelize');
   const { User, Job, Company, Contact, Application, Newsletter } = require('../models');
   ```

2. **Replace all `mongoose.Schema.Types.ObjectId` references** with string UUIDs in Sequelize

3. **Virtual fields** in Mongoose need to be computed in Sequelize:
   ```javascript
   // Mongoose virtual
   userSchema.virtual('fullName').get(function() { return `${this.firstName} ${this.lastName}`; });
   
   // Sequelize getter
   User.addScope('defaultScope', {
     attributes: {
       include: [
         [sequelize.literal(`CONCAT(firstName, ' ', lastName)`), 'fullName']
       ]
     }
   });
   ```

4. **Hooks** are the same concept:
   ```javascript
   // Mongoose
   userSchema.pre('save', async function() { ... });
   
   // Sequelize
   User.beforeCreate(async (user) => { ... });
   ```

---

## Quick Reference Table

| Operation | Mongoose | Sequelize |
|-----------|----------|-----------|
| Find One | `findOne()` | `findOne({ where: ... })` |
| Find By ID | `findById()` | `findByPk()` |
| Find All | `find()` | `findAll({ where: ... })` |
| Create | `create()` | `create()` |
| Update | `findByIdAndUpdate()` | `update()` or save after fetch |
| Delete | `findByIdAndDelete()` | `destroy()` |
| Count | `countDocuments()` | `count()` |
| Pagination | `skip().limit()` | `offset/limit` |
| Sort | `.sort()` | `order: [[...]]` |
| Populate | `.populate()` | `include: [...]` |
| Text Search | `$text: { $search }` | `[Op.like]: '%..%'` |
