import Dexie from 'dexie';
import type {Job, Candidate, Assessment} from '../types';

export class TalentDB extends Dexie{
    jobs!: Dexie.Table<Job,string>;
    candidates!: Dexie.Table<Candidate,string>;
    assessments!: Dexie.Table<Assessment,string>;

    constructor(){
        super('talentflow-db');
        this.version(1).stores({
            jobs:'id,slug,title,order,status,summary',
            candidates: 'id,name,email,jobId,stage,profile',
            assessments: 'jobId'
        });
        
        // Version 2: Updated assessments schema to support multiple assessments per job
        this.version(2).stores({
            jobs:'id,slug,title,order,status,summary',
            candidates: 'id,name,email,jobId,stage,profile',
            assessments: 'id,jobId,title,createdAt'
        });
    }
}

export const db = new TalentDB();