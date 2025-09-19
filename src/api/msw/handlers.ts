import {http, HttpResponse} from 'msw';
import {db} from '../../db/dexie';
import type {Assessment,Job,Candidate,Stage} from '../../types';

const randomLatency = (min=200,max=1200) => new Promise((r)=> setTimeout((r),Math.floor(Math.random()*(max-min)+min)));
const randomFailure = (rate=0.06) => Math.random()<rate;

export const handlers=[
    http.get('/api/jobs',async({request}) => {
        try {
            await randomLatency();
            const url = new URL(request.url);
            const page = Number(url.searchParams.get('page')||'1');
            const pageSize = Number(url.searchParams.get('pageSize') || '8');
            const search = (url.searchParams.get('search') || '').toLowerCase();
            const status = url.searchParams.get('status') || '';

            let jobs = await db.jobs.toArray();
            if (search) {
                jobs = jobs.filter(j => j.title.toLowerCase().includes(search) || j.tags.some(tag => tag.toLowerCase().includes(search)));
            }
            if(status) jobs = jobs.filter(j=>j.status === status);
            jobs.sort((a,b)=>a.order - b.order);
            const total = jobs.length;
            const start = (page - 1)*pageSize;
            const items = jobs.slice(start,start+pageSize);
            return HttpResponse.json({items,total});
        } catch (error) {
            console.error('Error in /api/jobs handler:', error);
            return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    }),

    http.get('/api/jobs/:id', async ({ params }) => {
        await randomLatency();
        const { id } = params as { id: string };

        const job = await db.jobs.get(id);

        if (job) {
            return HttpResponse.json(job);
        } else {
            // Return a 404 error if no job is found with that ID
            return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
        }
    }),

    http.post('/api/jobs', async ({request}) => {
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message: 'Simulated write failure'},{status: 500});
        }
        const payload = await request.json() as Partial<Job>;
        if (!payload) {
            return HttpResponse.json({ message: 'Request body is empty' }, { status: 400 });
        }
        const totalJobs = await db.jobs.count();
        payload.order = totalJobs + 1;
        await db.jobs.add(payload as any);
        return HttpResponse.json(payload,{status: 201});
    }),

    http.patch('/api/jobs/:id', async({request,params}) => {
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message: 'Simulated write failure'},{status:500});
        }
        const {id} = params as {id: string};
        const patch = (await request.json()) as any;
        const existing = await db.jobs.get(id);
        if(!existing){
            return HttpResponse.json({message: 'Not found'}, {status: 404});
        }

        const updated = {...existing, ...patch};
        await db.jobs.put(updated);
        return HttpResponse.json(updated);
        
    }),

    http.patch('/api/jobs/:id/reorder',async ({request,params}) =>{
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message:'Simulated reorder failure'},{status:500});
        }
        const {id} = params as {id: string};
        const body = await request.json() as {fromOrder:number,toOrder:number};
        const toOrder = Number(body.toOrder);

        const jobs = await db.jobs.orderBy('order').toArray();
        const moving = jobs.find(j=>j.id ===id);
        if(!moving){
            return HttpResponse.json({message:'Not found'},{status:404});
        }
        const without = jobs.filter(j => j.id !==id);
        const insertIndex = Math.max(0,Math.min(without.length,toOrder-1));
        without.splice(insertIndex,0,moving);
        const updates = without.map((job,idx) =>({...job,order:idx+1}));
        await db.transaction('rw',db.jobs,async () => {
            await Promise.all(updates.map(u=>db.jobs.put(u)));
        });
        return HttpResponse.json({success: true});

    }),

    http.post('/api/candidates', async ({ request }) => {
        await randomLatency();
        if (randomFailure(0.06)) {
            return HttpResponse.json({ message: 'Failed to create candidate. Please try again.' }, { status: 500 });
        }
        
        const payload = await request.json() as Partial<Candidate>;
        if (!payload) {
            return HttpResponse.json({ message: 'Request body is empty' }, { status: 400 });
        }
        
        // Generate a unique ID and set defaults
        const newCandidate = {
            id: crypto.randomUUID(),
            name: payload.name || '',
            email: payload.email || '',
            jobId: payload.jobId || '',
            stage: payload.stage || 'applied' as Stage,
            profile: payload.profile || '',
            timeline: [{
                timestamp: Date.now(),
                to: payload.stage || 'applied' as Stage,
                note: 'Candidate added'
            }],
            note: payload.note
        };
        
        try {
            await db.candidates.add(newCandidate);
            return HttpResponse.json(newCandidate, { status: 201 });
        } catch (error) {
            console.error('Error adding candidate:', error);
            return HttpResponse.json({ message: 'Failed to create candidate. Please try again.' }, { status: 500 });
        }
    }),

    http.get('/api/candidates', async({request})=>{
        await randomLatency();
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || '1');
        const pageSize = Number(url.searchParams.get('pageSize') || '50');
        const search = (url.searchParams.get('search') || '').toLowerCase();
        const stage = url.searchParams.get('stage') || '';

        const jobId = url.searchParams.get('jobId') || '';

        let candidates = await db.candidates.toArray();
        
        if (jobId) {
        candidates = candidates.filter(c => c.jobId === jobId);
        }
        
        if(search) candidates = candidates.filter(c=>c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));
        if(stage) candidates = candidates.filter(c=>c.stage === stage);
        const total = candidates.length;
        const start = (page-1)*pageSize;
        const items = candidates.slice(start,start+pageSize);
        return HttpResponse.json({items,total});
    }),

    http.get('/api/candidates/:id', async ({ params }) => {
        await randomLatency();
        const { id } = params as { id: string };
        const candidate = await db.candidates.get(id);

        if (candidate) {
            return HttpResponse.json(candidate);
        } else {
            return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
        }
    }),

    http.patch('/api/candidates/:id', async({request,params})=>{
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message:'Simulated write failure'},{status:500});
        }

        const {id} = params as {id:string};
        const patch = await request.json() as any;
        const existing = await db.candidates.get(id);
        if(!existing){
            return HttpResponse.json({message:'Not found'},{status:404});
        }
        const updated = {...existing,...patch} as any;
        if(patch.stage && patch.stage !== existing.stage){
            const ev = {timestamp:Date.now(),from:existing.stage,to:patch.stage, note:patch.note ||''};
            updated.timeline = [...(existing.timeline || []),ev];
        }
        await db.candidates.put(updated);
        return HttpResponse.json(updated);
    }),

    http.get('/api/candidates/:id/timeline', async({params})=>{
        await randomLatency();
        const {id} = params as {id: string};
        const candidate = await db.candidates.get(id);
        if(!candidate){
            return HttpResponse.json({message:'Not found'},{status:404});
        }
        return HttpResponse.json({timeline:candidate.timeline || []});
    }),

    http.get('/api/assessments', async()=>{
        await randomLatency();
        try {
            const assessments = await db.assessments.toArray();
            return HttpResponse.json(assessments);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            return HttpResponse.json({message:'Failed to fetch assessments'},{status:500});
        }
    }),

    http.get('/api/assessments/job/:jobId', async({params})=>{
        await randomLatency();
        const {jobId} = params as {jobId: string};
        try {
            const assessments = await db.assessments.where('jobId').equals(jobId).toArray();
            return HttpResponse.json(assessments);
        } catch (error) {
            console.error('Error fetching assessments for job:', error);
            return HttpResponse.json({message:'Failed to fetch assessments'},{status:500});
        }
    }),

    http.get('/api/assessments/:id', async({params})=>{
        await randomLatency();
        const {id} = params as {id: string};
        const assessment = await db.assessments.get(id);
        if(!assessment){
            return HttpResponse.json({message:'Assessment not found'},{status:404});
        }
        return HttpResponse.json(assessment);
    }),

    http.post('/api/assessments', async({request})=>{
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message:'Simulated write failure'},{status:500});
        }
        const payload = await request.json() as Partial<Assessment>;
        if (!payload.jobId) {
            return HttpResponse.json({message: 'Job ID is required'}, {status: 400});
        }
        if (!payload.title) {
            return HttpResponse.json({message: 'Assessment title is required'}, {status: 400});
        }
        
        const assessment: Assessment = {
            id: crypto.randomUUID(),
            jobId: payload.jobId,
            title: payload.title,
            sections: payload.sections || [],
            createdAt: Date.now()
        };
        
        try {
            console.log('Attempting to add assessment to database:', assessment);
            await db.assessments.add(assessment);
            console.log('Assessment added successfully');
            return HttpResponse.json(assessment, {status: 201});
        } catch (error) {
            console.error('Detailed error creating assessment:', {
                error,
                errorName: (error as Error).name,
                errorMessage: (error as Error).message,
                assessment,
                stack: (error as Error).stack
            });
            
            // If it's a constraint error, try to handle it
            if ((error as Error).name === 'ConstraintError' || (error as Error).message.includes('constraint')) {
                console.log('Constraint error - possibly duplicate ID, generating new one');
                const newAssessment = { ...assessment, id: crypto.randomUUID() };
                try {
                    await db.assessments.add(newAssessment);
                    return HttpResponse.json(newAssessment, {status: 201});
                } catch (retryError) {
                    console.error('Retry also failed:', retryError);
                }
            }
            
            return HttpResponse.json({
                message: 'Failed to create assessment', 
                error: (error as Error).message,
                details: (error as Error).name
            }, {status: 500});
        }
    }),

    http.put('/api/assessments/:jobId', async({request,params})=>{
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message:'Simulated write failure'},{status:500});
        }
        const {jobId} = params as {jobId: string};
        const payload = await request.json();
        await db.assessments.put({...(payload as Assessment),jobId});
        return HttpResponse.json(payload);
    }),

    http.post('/api/assessments/:jobId/submit',async({request,params})=>{
        await randomLatency();
        if(randomFailure(0.06)){
            return HttpResponse.json({message:'Simulated write failure'},{status:500});
        }

        const {jobId} = params as {jobId: string};
        const response = await request.json();
        const existing = await db.assessments.get(jobId);
        const updated = {
            ...(existing || {jobId,title:'',sections:[]}) as any,
            responses: [...((existing && (existing as any).responses) || []), {id: crypto.randomUUID(),createdAt: Date.now(),response}]
        };
        await db.assessments.put(updated);
        return HttpResponse.json({success:true},{status:201});
    }),
];