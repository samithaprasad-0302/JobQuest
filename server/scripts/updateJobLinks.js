const { Job, sequelize } = require('../models');

const updateJobLinks = async () => {
  try {
    // Use raw SQL to update jobs where link is null but email exists
    const result = await sequelize.query(
      `UPDATE Jobs SET \`link\` = \`email\` WHERE \`link\` IS NULL AND \`email\` IS NOT NULL`
    );

    console.log(`Updated job links`);

    // List all jobs to verify
    const allJobs = await Job.findAll({
      attributes: ['id', 'title', 'email', 'link']
    });

    console.log('\nJobs after update:');
    allJobs.forEach(job => {
      console.log(`ID: ${job.id}, Title: ${job.title}, Email: ${job.email}, Link: ${job.link}`);
    });
  } catch (error) {
    console.error('Error updating job links:', error);
  } finally {
    process.exit(0);
  }
};

updateJobLinks();

