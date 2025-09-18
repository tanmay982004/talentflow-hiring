// src/utils/resetDatabase.ts
import { db } from '../db/dexie';

export const resetDatabase = async () => {
  console.log('Resetting database...');
  
  try {
    // Close the database connection
    await db.close();
    
    // Delete the database
    await db.delete();
    
    // Reopen with the new schema
    await db.open();
    
    console.log('Database reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};

// Function to clear assessments table specifically
export const clearAssessments = async () => {
  console.log('Clearing assessments table...');
  
  try {
    await db.assessments.clear();
    console.log('Assessments table cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing assessments:', error);
    return false;
  }
};

// Function to check database status
export const checkDatabaseStatus = async () => {
  try {
    const tables = await Promise.all([
      db.jobs.count(),
      db.candidates.count(), 
      db.assessments.count()
    ]);
    
    console.log('Database status:', {
      jobs: tables[0],
      candidates: tables[1], 
      assessments: tables[2],
      version: db.verno
    });
    
    return {
      jobs: tables[0],
      candidates: tables[1],
      assessments: tables[2],
      version: db.verno
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return null;
  }
};