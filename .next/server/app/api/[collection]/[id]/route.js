"use strict";(()=>{var e={};e.id=778,e.ids=[778],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7790:e=>{e.exports=require("assert")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8216:e=>{e.exports=require("net")},9801:e=>{e.exports=require("os")},6162:e=>{e.exports=require("stream")},2452:e=>{e.exports=require("tls")},4175:e=>{e.exports=require("tty")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},7225:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{originalPathname:()=>l,patchFetch:()=>T,requestAsyncStorage:()=>n,routeModule:()=>R,serverHooks:()=>c,staticGenerationAsyncStorage:()=>u});var s=r(3278),i=r(5002),o=r(4877),A=r(691),a=e([A]);A=(a.then?(await a)():a)[0];let R=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/[collection]/[id]/route",pathname:"/api/[collection]/[id]",filename:"route",bundlePath:"app/api/[collection]/[id]/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\[collection]\\[id]\\route.ts",nextConfigOutput:"",userland:A}),{requestAsyncStorage:n,staticGenerationAsyncStorage:u,serverHooks:c}=R,l="/api/[collection]/[id]/route";function T(){return(0,o.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:u})}E()}catch(e){E(e)}})},691:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{DELETE:()=>R,GET:()=>a,PATCH:()=>T});var s=r(1309),i=r(871),o=r(7066),A=e([i,o]);[i,o]=A.then?(await A)():A;let n=e=>e.replace(/[A-Z]/g,e=>`_${e.toLowerCase()}`);async function a(e,{params:t}){let{collection:r,id:E}=t,o="forumTopics"===r?"forum_topics":r;try{let e=await (0,i.IO)(`SELECT * FROM ${o} WHERE ${"users"===o?"uid":"id"} = $1`,[E]);if(0===e.rowCount)return s.NextResponse.json({error:"Not found"},{status:404});let t=e.rows[0],r={};for(let e in t)r[e.replace(/_([a-z])/g,e=>e[1].toUpperCase())]=t[e];return r.uid&&(r.id=r.uid),s.NextResponse.json(r)}catch(e){return console.error(`Error fetching ${r}/${E}:`,e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function T(e,{params:t}){let{collection:r,id:E}=t,A="forumTopics"===r?"forum_topics":r;try{let t=await e.json(),a=Object.keys(t);if(0===a.length)return s.NextResponse.json({error:"No data provided"},{status:400});let T=a.map((e,t)=>`${n(e)} = $${t+1}`).join(", "),R=Object.values(t);if(await (0,i.IO)(`UPDATE ${A} SET ${T} WHERE ${"users"===A?"uid":"id"} = $${a.length+1}`,[...R,E]),"services"===r&&"accepted"===t.status){let e=await (0,i.IO)("SELECT user_id, title FROM services WHERE id = $1",[E]);if(e.rowCount>0){let t=e.rows[0];await (0,o.z)(t.user_id,{title:"Service accept\xe9",body:`Votre service "${t.title}" a \xe9t\xe9 accept\xe9 !`,url:"/services"})}}else if("requests"===r&&"accepted"===t.status){let e=await (0,i.IO)("SELECT user_id, title FROM requests WHERE id = $1",[E]);if(e.rowCount>0){let t=e.rows[0];await (0,o.z)(t.user_id,{title:"Demande accept\xe9e",body:`Votre demande "${t.title}" a \xe9t\xe9 accept\xe9e !`,url:"/requests"})}}else if("connections"===r&&"accepted"===t.status){let e=await (0,i.IO)("SELECT sender_id FROM connections WHERE id = $1",[E]);if(e.rowCount>0){let t=e.rows[0];await (0,o.z)(t.sender_id,{title:"Demande de connexion accept\xe9e",body:`Votre demande de connexion a \xe9t\xe9 accept\xe9e.`,url:"/profile"})}}return s.NextResponse.json({success:!0})}catch(e){return console.error(`Error updating ${r}/${E}:`,e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function R(e,{params:t}){let{collection:r,id:E}=t,o="forumTopics"===r?"forum_topics":r;try{return await (0,i.IO)(`DELETE FROM ${o} WHERE ${"users"===o?"uid":"id"} = $1`,[E]),s.NextResponse.json({success:!0})}catch(e){return console.error(`Error deleting ${r}/${E}:`,e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}E()}catch(e){E(e)}})},871:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{IO:()=>R});var s=r(8678),i=e([s]);s=(i.then?(await i)():i)[0];let o="postgres://mock:mock@localhost:5432/mock",A=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),o=process.env.DATABASE_URL,A=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let a=new s.default.Pool({connectionString:o,ssl:!o.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),T=!1,R=async(e,t)=>{if(A)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!a)throw Error("Database pool not initialized");return T||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await n(),T=!0),await a.query(e,t)},n=async()=>{if(a&&!A)try{let e=await a.connect();try{await e.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(255),
        campus VARCHAR(255),
        department VARCHAR(255),
        gender VARCHAR(50),
        country VARCHAR(255),
        availability VARCHAR(255),
        languages JSONB,
        offered_skills JSONB,
        requested_skills JSONB,
        bio TEXT,
        skills TEXT[],
        needs TEXT[],
        avatar VARCHAR(255),
        cover_photo VARCHAR(255),
        credits INTEGER DEFAULT 5,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        verified BOOLEAN DEFAULT true,
        is_verified_email BOOLEAN DEFAULT true,
        is_verified_sms BOOLEAN DEFAULT true,
        terms_accepted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE users ADD COLUMN gender VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN country VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN availability VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN languages JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN offered_skills JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN requested_skills JSONB;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
        BEGIN
          ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT true;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END;
      END $$;

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        user_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        credit_cost INTEGER NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'proposed',
        accepted_by VARCHAR(255) REFERENCES users(uid),
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        user_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        credit_offer INTEGER NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'proposed',
        fulfilled_by VARCHAR(255) REFERENCES users(uid),
        fulfilled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255),
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        external_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255),
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forum_topics (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(255) REFERENCES users(uid),
        author_name VARCHAR(255),
        author_avatar VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255),
        media JSONB DEFAULT '[]',
        likes TEXT[] DEFAULT '{}',
        dislikes TEXT[] DEFAULT '{}',
        shares INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        comments JSONB DEFAULT '[]',
        external_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(255) REFERENCES users(uid),
        receiver_id VARCHAR(255) REFERENCES users(uid),
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_id VARCHAR(255) REFERENCES users(uid),
        to_id VARCHAR(255) REFERENCES users(uid),
        amount INTEGER NOT NULL,
        service_title VARCHAR(255),
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        from_name VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(255) REFERENCES users(uid),
        receiver_id VARCHAR(255) REFERENCES users(uid),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(uid),
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      DO $ 
      BEGIN 
        BEGIN
          ALTER TABLE connections DROP COLUMN id;
          ALTER TABLE connections ADD COLUMN id SERIAL PRIMARY KEY;
        EXCEPTION
          WHEN others THEN null;
        END;
      END $$;
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};E()}catch(e){E(e)}})},7066:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{z:()=>a});var s=r(1417),i=r.n(s),o=r(871),A=e([o]);o=(A.then?(await A)():A)[0];let T=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,R=process.env.VAPID_PRIVATE_KEY,n=process.env.VAPID_EMAIL||"mailto:example@yourdomain.com";async function a(e,t){try{let r=await (0,o.IO)("SELECT subscription FROM push_subscriptions WHERE user_id = $1",[e]);if(0===r.rowCount){console.log(`No push subscription found for user ${e}`);return}let E=r.rows.map(async r=>{let E=r.subscription;try{await i().sendNotification(E,JSON.stringify(t))}catch(t){410===t.statusCode||404===t.statusCode?(console.log(`Removing expired subscription for user ${e}`),await (0,o.IO)("DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription = $2",[e,JSON.stringify(E)])):console.error("Error sending push notification:",t)}});await Promise.all(E)}catch(e){console.error("Error in sendPushNotification:",e)}}T&&R&&i().setVapidDetails(n,T,R),E()}catch(e){E(e)}})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[379,833,986,417],()=>r(7225));module.exports=E})();