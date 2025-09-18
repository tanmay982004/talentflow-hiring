// src/utils/migrateDatabase.ts
import Dexie from 'dexie';

// Define the database schema that matches your current setup
interface MigrationDatabase extends Dexie {
  jobs: Dexie.Table<any, string>;
  candidates: Dexie.Table<any, string>;
  assessments: Dexie.Table<any, string>;
}

// Create a database connection for a specific port
function createDatabaseForPort(port: number): MigrationDatabase {
  const db = new Dexie(`talentflow-db-${port}`) as MigrationDatabase;
  
  db.version(2).stores({
    jobs: 'id, slug, title, status, tags, order, createdAt, summary',
    candidates: 'id, name, email, jobId, stage, timeline, profile',
    assessments: 'id, jobId, title, sections, createdAt'
  });

  return db;
}

// Export data from a specific port
export async function exportDataFromPort(port: number) {
  const db = createDatabaseForPort(port);
  
  try {
    await db.open();
    
    const jobs = await db.jobs.toArray();
    const candidates = await db.candidates.toArray();
    const assessments = await db.assessments.toArray();
    
    const exportData = {
      jobs,
      candidates,
      assessments,
      exportedAt: Date.now(),
      sourcePort: port
    };
    
    console.log(`Exported data from port ${port}:`, {
      jobs: jobs.length,
      candidates: candidates.length,
      assessments: assessments.length
    });
    
    return exportData;
  } catch (error) {
    console.error(`Failed to export data from port ${port}:`, error);
    throw error;
  } finally {
    db.close();
  }
}

// Import data to a specific port
export async function importDataToPort(port: number, data: any) {
  const db = createDatabaseForPort(port);
  
  try {
    await db.open();
    
    // Clear existing data first
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments], async () => {
      await db.jobs.clear();
      await db.candidates.clear();
      await db.assessments.clear();
    });
    
    // Import new data
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments], async () => {
      if (data.jobs?.length) await db.jobs.bulkAdd(data.jobs);
      if (data.candidates?.length) await db.candidates.bulkAdd(data.candidates);
      if (data.assessments?.length) await db.assessments.bulkAdd(data.assessments);
    });
    
    console.log(`Imported data to port ${port}:`, {
      jobs: data.jobs?.length || 0,
      candidates: data.candidates?.length || 0,
      assessments: data.assessments?.length || 0
    });
  } catch (error) {
    console.error(`Failed to import data to port ${port}:`, error);
    throw error;
  } finally {
    db.close();
  }
}

// Migrate data from one port to another
export async function migrateData(fromPort: number, toPort: number) {
  console.log(`Migrating data from port ${fromPort} to port ${toPort}...`);
  
  try {
    const exportedData = await exportDataFromPort(fromPort);
    await importDataToPort(toPort, exportedData);
    console.log(`✅ Successfully migrated data from port ${fromPort} to port ${toPort}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to migrate data:`, error);
    return false;
  }
}

// List all available databases
export async function listAvailableDatabases() {
  const commonPorts = [5173, 5174, 5175, 5176, 5177];
  const availableDatabases = [];
  
  for (const port of commonPorts) {
    try {
      const db = createDatabaseForPort(port);
      await db.open();
      
      const jobsCount = await db.jobs.count();
      const candidatesCount = await db.candidates.count();
      const assessmentsCount = await db.assessments.count();
      
      if (jobsCount > 0 || candidatesCount > 0 || assessmentsCount > 0) {
        availableDatabases.push({
          port,
          jobs: jobsCount,
          candidates: candidatesCount,
          assessments: assessmentsCount
        });
      }
      
      db.close();
    } catch (error) {
      // Database doesn't exist for this port, continue
    }
  }
  
  return availableDatabases;
}

// Manual migration functions for browser console
(window as any).migrationTools = {
  listDatabases: listAvailableDatabases,
  migrate: migrateData,
  exportData: exportDataFromPort,
  importData: importDataToPort
};