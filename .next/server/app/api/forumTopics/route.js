"use strict";(()=>{var e={};e.id=677,e.ids=[677],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},6033:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.r(E),t.d(E,{originalPathname:()=>c,patchFetch:()=>i,requestAsyncStorage:()=>n,routeModule:()=>o,serverHooks:()=>u,staticGenerationAsyncStorage:()=>N});var r=t(3278),T=t(5002),s=t(4877),a=t(2961),R=e([a]);a=(R.then?(await R)():R)[0];let o=new r.AppRouteRouteModule({definition:{kind:T.x.APP_ROUTE,page:"/api/forumTopics/route",pathname:"/api/forumTopics",filename:"route",bundlePath:"app/api/forumTopics/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\forumTopics\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:n,staticGenerationAsyncStorage:N,serverHooks:u}=o,c="/api/forumTopics/route";function i(){return(0,s.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:N})}A()}catch(e){A(e)}})},2961:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.r(E),t.d(E,{GET:()=>a,POST:()=>R});var r=t(1309),T=t(871),s=e([T]);async function a(){try{let e=(await (0,T.IO)("SELECT * FROM forum_topics ORDER BY created_at DESC")).rows.map(e=>({id:e.id,authorId:e.author_id,authorName:e.author_name,authorAvatar:e.author_avatar,title:e.title,message:e.content,category:e.category,media:e.media,likes:e.likes,dislikes:e.dislikes,shares:e.shares,reposts:e.reposts,comments:e.comments,externalLink:e.external_link,createdAt:e.created_at}));return r.NextResponse.json(e)}catch(e){return console.error("Error fetching forum topics:",e),r.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function R(e){try{let E=await e.json(),t=await (0,T.IO)(`INSERT INTO forum_topics (author_id, author_name, author_avatar, title, content, category, media, external_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,[E.authorId,E.authorName,E.authorAvatar,E.title,E.message||E.content,E.category,JSON.stringify(E.media||[]),E.externalLink]);return r.NextResponse.json({id:t.rows[0].id})}catch(e){return console.error("Error creating forum topic:",e),r.NextResponse.json({error:"Internal Server Error"},{status:500})}}T=(s.then?(await s)():s)[0],A()}catch(e){A(e)}})},871:(e,E,t)=>{t.a(e,async(e,A)=>{try{t.d(E,{IO:()=>o});var r=t(8678),T=e([r]);r=(T.then?(await T)():T)[0];let s="postgres://mock:mock@localhost:5432/mock",a=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),s=process.env.DATABASE_URL,a=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let R=new r.default.Pool({connectionString:s,ssl:!s.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),i=!1,o=async(e,E)=>{if(a)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!R)throw Error("Database pool not initialized");return i||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await n(),i=!0),await R.query(e,E)},n=async()=>{if(R&&!a)try{let e=await R.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};A()}catch(e){A(e)}})}};var E=require("../../../webpack-runtime.js");E.C(e);var t=e=>E(E.s=e),A=E.X(0,[379,833],()=>t(6033));module.exports=A})();