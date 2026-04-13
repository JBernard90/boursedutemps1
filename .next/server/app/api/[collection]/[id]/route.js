"use strict";(()=>{var e={};e.id=778,e.ids=[778],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},7225:(e,E,t)=>{t.a(e,async(e,r)=>{try{t.r(E),t.d(E,{originalPathname:()=>c,patchFetch:()=>i,requestAsyncStorage:()=>n,routeModule:()=>o,serverHooks:()=>N,staticGenerationAsyncStorage:()=>u});var A=t(3278),T=t(5002),s=t(4877),R=t(691),a=e([R]);R=(a.then?(await a)():a)[0];let o=new A.AppRouteRouteModule({definition:{kind:T.x.APP_ROUTE,page:"/api/[collection]/[id]/route",pathname:"/api/[collection]/[id]",filename:"route",bundlePath:"app/api/[collection]/[id]/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\[collection]\\[id]\\route.ts",nextConfigOutput:"",userland:R}),{requestAsyncStorage:n,staticGenerationAsyncStorage:u,serverHooks:N}=o,c="/api/[collection]/[id]/route";function i(){return(0,s.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:u})}r()}catch(e){r(e)}})},691:(e,E,t)=>{t.a(e,async(e,r)=>{try{t.r(E),t.d(E,{DELETE:()=>i,GET:()=>R,PATCH:()=>a});var A=t(1309),T=t(871),s=e([T]);T=(s.then?(await s)():s)[0];let o=e=>e.replace(/[A-Z]/g,e=>`_${e.toLowerCase()}`);async function R(e,{params:E}){let{collection:t,id:r}=E,s="forumTopics"===t?"forum_topics":t;try{let e=await (0,T.IO)(`SELECT * FROM ${s} WHERE ${"users"===s?"uid":"id"} = $1`,[r]);if(0===e.rowCount)return A.NextResponse.json({error:"Not found"},{status:404});let E=e.rows[0],t={};for(let e in E)t[e.replace(/_([a-z])/g,e=>e[1].toUpperCase())]=E[e];return t.uid&&(t.id=t.uid),A.NextResponse.json(t)}catch(e){return console.error(`Error fetching ${t}/${r}:`,e),A.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function a(e,{params:E}){let{collection:t,id:r}=E,s="forumTopics"===t?"forum_topics":t;try{let E=await e.json(),t=Object.keys(E);if(0===t.length)return A.NextResponse.json({error:"No data provided"},{status:400});let R=t.map((e,E)=>`${o(e)} = $${E+1}`).join(", "),a=Object.values(E);return await (0,T.IO)(`UPDATE ${s} SET ${R} WHERE ${"users"===s?"uid":"id"} = $${t.length+1}`,[...a,r]),A.NextResponse.json({success:!0})}catch(e){return console.error(`Error updating ${t}/${r}:`,e),A.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function i(e,{params:E}){let{collection:t,id:r}=E,s="forumTopics"===t?"forum_topics":t;try{return await (0,T.IO)(`DELETE FROM ${s} WHERE ${"users"===s?"uid":"id"} = $1`,[r]),A.NextResponse.json({success:!0})}catch(e){return console.error(`Error deleting ${t}/${r}:`,e),A.NextResponse.json({error:"Internal Server Error"},{status:500})}}r()}catch(e){r(e)}})},871:(e,E,t)=>{t.a(e,async(e,r)=>{try{t.d(E,{IO:()=>o});var A=t(8678),T=e([A]);A=(T.then?(await T)():T)[0];let s="postgres://mock:mock@localhost:5432/mock",R=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),s=process.env.DATABASE_URL,R=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let a=new A.default.Pool({connectionString:s,ssl:!s.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),i=!1,o=async(e,E)=>{if(R)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!a)throw Error("Database pool not initialized");return i||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await n(),i=!0),await a.query(e,E)},n=async()=>{if(a&&!R)try{let e=await a.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};r()}catch(e){r(e)}})}};var E=require("../../../../webpack-runtime.js");E.C(e);var t=e=>E(E.s=e),r=E.X(0,[379,833],()=>t(7225));module.exports=r})();