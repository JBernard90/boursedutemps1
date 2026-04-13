"use strict";(()=>{var e={};e.id=217,e.ids=[217],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7790:e=>{e.exports=require("assert")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8216:e=>{e.exports=require("net")},9801:e=>{e.exports=require("os")},6162:e=>{e.exports=require("stream")},2452:e=>{e.exports=require("tls")},4175:e=>{e.exports=require("tty")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},732:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{originalPathname:()=>N,patchFetch:()=>R,requestAsyncStorage:()=>n,routeModule:()=>o,serverHooks:()=>c,staticGenerationAsyncStorage:()=>u});var s=r(3278),A=r(5002),i=r(4877),a=r(5833),T=e([a]);a=(T.then?(await T)():T)[0];let o=new s.AppRouteRouteModule({definition:{kind:A.x.APP_ROUTE,page:"/api/messages/route",pathname:"/api/messages",filename:"route",bundlePath:"app/api/messages/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\messages\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:n,staticGenerationAsyncStorage:u,serverHooks:c}=o,N="/api/messages/route";function R(){return(0,i.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:u})}E()}catch(e){E(e)}})},5833:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{GET:()=>R,POST:()=>o});var s=r(1309),A=r(871),i=r(6910),a=r(7066),T=e([A,a]);async function R(e){let t=(0,i.bE)(e);if(!t)return s.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(await (0,A.IO)("SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at ASC",[t])).rows.map(e=>({id:e.id,senderId:e.sender_id,receiverId:e.receiver_id,content:e.content,timestamp:e.created_at,isRead:e.is_read||!1}));return s.NextResponse.json(e)}catch(e){return console.error("Error fetching messages:",e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function o(e){try{let t=await e.json(),r=await (0,A.IO)(`INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING id`,[t.senderId,t.receiverId,t.content]),E=await (0,A.IO)("SELECT first_name, last_name FROM users WHERE uid = $1",[t.senderId]),i=E.rowCount>0?`${E.rows[0].first_name} ${E.rows[0].last_name}`:"Quelqu'un";return await (0,a.z)(t.receiverId,{title:`Nouveau message de ${i}`,body:t.content.length>50?t.content.substring(0,47)+"...":t.content,url:"/profile?chat="+t.senderId}),s.NextResponse.json({id:r.rows[0].id})}catch(e){return console.error("Error creating message:",e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}[A,a]=T.then?(await T)():T,E()}catch(e){E(e)}})},871:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{IO:()=>o});var s=r(8678),A=e([s]);s=(A.then?(await A)():A)[0];let i="postgres://mock:mock@localhost:5432/mock",a=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),i=process.env.DATABASE_URL,a=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let T=new s.default.Pool({connectionString:i,ssl:!i.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),R=!1,o=async(e,t)=>{if(a)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!T)throw Error("Database pool not initialized");return R||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await n(),R=!0),await T.query(e,t)},n=async()=>{if(T&&!a)try{let e=await T.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};E()}catch(e){E(e)}})},6910:(e,t,r)=>{r.d(t,{bE:()=>a,fT:()=>i});var E=r(7390),s=r.n(E);let A=process.env.JWT_SECRET||"your-secret-key";function i(e){return s().sign(e,A,{expiresIn:"7d"})}function a(e){let t=e.headers.get("Authorization");if(!t||!t.startsWith("Bearer "))return null;let r=function(e){try{return s().verify(e,A)}catch(e){return null}}(t.split(" ")[1]);return r?.uid||null}},7066:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{z:()=>T});var s=r(1417),A=r.n(s),i=r(871),a=e([i]);i=(a.then?(await a)():a)[0];let R=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,o=process.env.VAPID_PRIVATE_KEY,n=process.env.VAPID_EMAIL||"mailto:example@yourdomain.com";async function T(e,t){try{let r=await (0,i.IO)("SELECT subscription FROM push_subscriptions WHERE user_id = $1",[e]);if(0===r.rowCount){console.log(`No push subscription found for user ${e}`);return}let E=r.rows.map(async r=>{let E=r.subscription;try{await A().sendNotification(E,JSON.stringify(t))}catch(t){410===t.statusCode||404===t.statusCode?(console.log(`Removing expired subscription for user ${e}`),await (0,i.IO)("DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription = $2",[e,JSON.stringify(E)])):console.error("Error sending push notification:",t)}});await Promise.all(E)}catch(e){console.error("Error in sendPushNotification:",e)}}R&&o&&A().setVapidDetails(n,R,o),E()}catch(e){E(e)}})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[379,833,390,417],()=>r(732));module.exports=E})();