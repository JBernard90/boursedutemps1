"use strict";(()=>{var e={};e.id=348,e.ids=[348],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7790:e=>{e.exports=require("assert")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8216:e=>{e.exports=require("net")},9801:e=>{e.exports=require("os")},6162:e=>{e.exports=require("stream")},2452:e=>{e.exports=require("tls")},4175:e=>{e.exports=require("tty")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},160:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{originalPathname:()=>N,patchFetch:()=>a,requestAsyncStorage:()=>R,routeModule:()=>n,serverHooks:()=>c,staticGenerationAsyncStorage:()=>u});var s=r(3278),i=r(5002),A=r(4877),T=r(2681),o=e([T]);T=(o.then?(await o)():o)[0];let n=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/connections/route",pathname:"/api/connections",filename:"route",bundlePath:"app/api/connections/route"},resolvedPagePath:"P:\\boursedutemps\\app\\api\\connections\\route.ts",nextConfigOutput:"",userland:T}),{requestAsyncStorage:R,staticGenerationAsyncStorage:u,serverHooks:c}=n,N="/api/connections/route";function a(){return(0,A.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:u})}E()}catch(e){E(e)}})},2681:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.r(t),r.d(t,{GET:()=>a,POST:()=>n});var s=r(1309),i=r(871),A=r(6910),T=r(7066),o=e([i,T]);async function a(e){let t=(0,A.bE)(e);if(!t)return s.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=(await (0,i.IO)("SELECT * FROM connections WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC",[t])).rows.map(e=>({id:e.id,senderId:e.sender_id,receiverId:e.receiver_id,status:e.status,createdAt:e.created_at,updatedAt:e.updated_at}));return s.NextResponse.json(e)}catch(e){return console.error("Error fetching connections:",e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function n(e){try{let t=await e.json(),r=await (0,i.IO)(`INSERT INTO connections (sender_id, receiver_id, status)
       VALUES ($1, $2, $3) RETURNING id`,[t.senderId,t.receiverId,t.status||"sent"]),E=await (0,i.IO)("SELECT first_name, last_name FROM users WHERE uid = $1",[t.senderId]),A=E.rowCount>0?`${E.rows[0].first_name} ${E.rows[0].last_name}`:"Un membre";return await (0,T.z)(t.receiverId,{title:"Nouvelle demande de connexion",body:`${A} souhaite se connecter avec vous.`,url:"/profile"}),s.NextResponse.json({id:r.rows[0].id})}catch(e){return console.error("Error creating connection:",e),s.NextResponse.json({error:"Internal Server Error"},{status:500})}}[i,T]=o.then?(await o)():o,E()}catch(e){E(e)}})},871:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{IO:()=>n});var s=r(8678),i=e([s]);s=(i.then?(await i)():i)[0];let A="postgres://mock:mock@localhost:5432/mock",T=!0;if(process.env.DATABASE_URL)try{new URL(process.env.DATABASE_URL),A=process.env.DATABASE_URL,T=!1,console.log("[DB] DATABASE_URL is set and valid.")}catch(e){console.error("[DB] Invalid DATABASE_URL format. Falling back to mock URL for build/safety.")}else console.warn("========================================================="),console.warn("WARNING: DATABASE_URL environment variable is missing."),console.warn("Using a mock URL for build purposes."),console.warn("=========================================================");let o=new s.default.Pool({connectionString:A,ssl:!A.includes("localhost")&&{rejectUnauthorized:!1},connectionTimeoutMillis:5e3}),a=!1,n=async(e,t)=>{if(T)return console.warn(`[DB] Mock mode active. Returning empty result for query: ${e.substring(0,50)}...`),{rows:[],rowCount:0};if(!o)throw Error("Database pool not initialized");return a||-1!==e.toLowerCase().indexOf("create table")||-1!==e.toLowerCase().indexOf("alter table")||(await R(),a=!0),await o.query(e,t)},R=async()=>{if(o&&!T)try{let e=await o.connect();try{await e.query(`
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
    `),console.log("[DB] Tables initialized successfully")}finally{e.release()}}catch(e){console.error("[DB] Initialization error:",e)}};E()}catch(e){E(e)}})},6910:(e,t,r)=>{r.d(t,{bE:()=>T,fT:()=>A});var E=r(7390),s=r.n(E);let i=process.env.JWT_SECRET||"your-secret-key";function A(e){return s().sign(e,i,{expiresIn:"7d"})}function T(e){let t=e.headers.get("Authorization");if(!t||!t.startsWith("Bearer "))return null;let r=function(e){try{return s().verify(e,i)}catch(e){return null}}(t.split(" ")[1]);return r?.uid||null}},7066:(e,t,r)=>{r.a(e,async(e,E)=>{try{r.d(t,{z:()=>o});var s=r(1417),i=r.n(s),A=r(871),T=e([A]);A=(T.then?(await T)():T)[0];let a=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,n=process.env.VAPID_PRIVATE_KEY,R=process.env.VAPID_EMAIL||"mailto:example@yourdomain.com";async function o(e,t){try{let r=await (0,A.IO)("SELECT subscription FROM push_subscriptions WHERE user_id = $1",[e]);if(0===r.rowCount){console.log(`No push subscription found for user ${e}`);return}let E=r.rows.map(async r=>{let E=r.subscription;try{await i().sendNotification(E,JSON.stringify(t))}catch(t){410===t.statusCode||404===t.statusCode?(console.log(`Removing expired subscription for user ${e}`),await (0,A.IO)("DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription = $2",[e,JSON.stringify(E)])):console.error("Error sending push notification:",t)}});await Promise.all(E)}catch(e){console.error("Error in sendPushNotification:",e)}}a&&n&&i().setVapidDetails(R,a,n),E()}catch(e){E(e)}})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[379,833,986,390,417],()=>r(160));module.exports=E})();